from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError


def _login_key(request: Request):
    """Rate-limit by client IP (X-Forwarded-For aware) + username when present."""
    xff = request.headers.get("x-forwarded-for", "")
    ip = (xff.split(",")[0].strip() if xff else None) or get_remote_address(request)
    return ip


_limiter = Limiter(key_func=_login_key)

from backend.auth import (
    create_access_token,
    create_refresh_token,
    get_current_user_id,
    hash_password,
    hash_refresh_token,
    verify_password,
    verify_token,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from backend.database import get_db
from backend.db_models import User, UserProgress
from backend.utils import update_streak, award_xp, mark_activity, track_metric_event
from backend.schemas import (
    TokenResponse,
    UserLogin,
    UserRegister,
    RefreshTokenRequest,
)

router = APIRouter(tags=["auth"])

# Account-lockout policy
_MAX_FAILED_LOGINS = 8
_LOCKOUT_MINUTES = 15


def _issue_tokens(user: User) -> tuple[str, str]:
    """Create access + refresh tokens carrying the current token_version."""
    tv = int(getattr(user, "token_version", 0) or 0)
    access_token = create_access_token(data={"user_id": user.id, "tv": tv})
    refresh_token = create_refresh_token(data={"user_id": user.id, "tv": tv})
    return access_token, refresh_token


@router.post("/api/register", response_model=TokenResponse)
@_limiter.limit("5/minute")
async def register(request: Request, user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user. Always returns generic error on conflict (anti-enumeration)."""
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()

    # Anti-enumeration: do NOT reveal which field collided.
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not complete registration with the provided details.",
        )

    hashed_password = hash_password(user_data.password)

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
    )
    db.add(new_user)
    db.flush()

    progress = db.query(UserProgress).filter(UserProgress.user_id == new_user.id).first()
    if not progress:
        db.add(UserProgress(user_id=new_user.id))

    access_token, refresh_token = _issue_tokens(new_user)

    new_user.refresh_token = hash_refresh_token(refresh_token)
    new_user.refresh_token_expiry = datetime.utcnow() + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not complete registration with the provided details.",
        ) from exc

    db.refresh(new_user)

    track_metric_event(
        db,
        new_user.id,
        "funnel",
        "signup_completed",
        details={"source": (request.headers.get("referer") or "")[:200]},
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "level": new_user.level,
            "xp": new_user.xp,
        },
    )


@router.post("/api/login", response_model=TokenResponse)
@_limiter.limit("10/minute")
async def login(request: Request, user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user. Includes per-account lockout after repeated failures."""
    user = db.query(User).filter(User.username == user_data.username).first()

    # Per-account lockout check (independent of IP rate-limit)
    if user and user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Account temporarily locked due to repeated failures. Try again later.",
        )

    if not user or not verify_password(user_data.password, user.password_hash):
        # Increment failure counter on the targeted account (if exists)
        if user:
            user.failed_login_count = (user.failed_login_count or 0) + 1
            if user.failed_login_count >= _MAX_FAILED_LOGINS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=_LOCKOUT_MINUTES)
                user.failed_login_count = 0
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Successful login: clear lockout state
    user.failed_login_count = 0
    user.locked_until = None

    access_token, refresh_token = _issue_tokens(user)
    user.refresh_token = hash_refresh_token(refresh_token)
    user.refresh_token_expiry = datetime.utcnow() + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )
    db.commit()

    streak_result = update_streak(db, user.id)
    if streak_result["is_new_day"]:
        award_xp(
            db,
            user.id,
            5 + streak_result["streak_bonus_xp"],
            source="daily_login",
        )

    mark_activity(db, user.id, "login")
    track_metric_event(db, user.id, "auth", "login_success")

    db.refresh(user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "level": user.level,
            "xp": user.xp,
            "streak": user.streak,
            "is_admin": user.is_admin,
        },
    )


@router.post("/api/auth/refresh", response_model=TokenResponse)
@_limiter.limit("30/minute")
async def refresh_token(
    request: Request,
    body: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Refresh access token using refresh token. Rotates refresh_token on every call.

    On any inconsistency (reuse of an old refresh, invalid signature, etc.) the
    user's session is fully invalidated by bumping token_version.
    """
    payload = verify_token(body.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or invalid",
        )

    presented_hash = hash_refresh_token(body.refresh_token)
    if user.refresh_token != presented_hash:
        # Possible replay/theft — revoke everything
        user.token_version = (user.token_version or 0) + 1
        user.refresh_token = None
        user.refresh_token_expiry = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reuse detected. Please log in again.",
        )

    if user.refresh_token_expiry and user.refresh_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    # Token version mismatch (logout/reset since this token was issued)
    tv_token = int(payload.get("tv", 0) or 0)
    tv_user = int(getattr(user, "token_version", 0) or 0)
    if tv_token != tv_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session revoked. Please log in again.",
        )

    # Rotate: new access AND new refresh, invalidate the old
    new_access, new_refresh = _issue_tokens(user)
    user.refresh_token = hash_refresh_token(new_refresh)
    user.refresh_token_expiry = datetime.utcnow() + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )
    db.commit()

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "level": user.level,
            "xp": user.xp,
        },
    )


@router.post("/api/logout")
async def logout(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Invalidate current session: bump token_version and clear refresh token."""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.token_version = (user.token_version or 0) + 1
        user.refresh_token = None
        user.refresh_token_expiry = None
        db.commit()
    return {"ok": True}


class OnboardingRequest(BaseModel):
    learning_why: str
    daily_interests: str


@router.post("/api/user/onboarding")
async def save_onboarding(
    data: OnboardingRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    was_completed_before = (user.onboarding_step or 0) >= 4
    started_at = user.created_at or datetime.utcnow()
    user.learning_why = data.learning_why
    user.daily_interests = data.daily_interests
    user.onboarding_step = 4
    db.commit()
    if not was_completed_before:
        time_to_complete = max(0, int((datetime.utcnow() - started_at).total_seconds()))
        track_metric_event(
            db,
            user.id,
            "funnel",
            "onboarding_finished",
            details={
                "learning_why": (data.learning_why or "")[:80],
                "time_to_complete_sec": time_to_complete,
            },
        )
    return {"ok": True}


@router.get("/api/user/profile")
async def get_profile(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "level": user.level,
        "xp": user.xp,
        "streak": user.streak,
        "onboarding_step": user.onboarding_step,
        "is_admin": user.is_admin,
    }
