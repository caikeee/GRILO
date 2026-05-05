from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.auth import (
    create_access_token,
    create_refresh_token,
    hash_password,
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


@router.post("/api/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
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

    access_token = create_access_token(data={"user_id": new_user.id})
    refresh_token = create_refresh_token(data={"user_id": new_user.id})

    new_user.refresh_token = refresh_token
    new_user.refresh_token_expiry = datetime.utcnow() + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        existing_user = db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered",
            ) from exc

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not complete registration",
        ) from exc

    db.refresh(new_user)

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
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token."""
    user = db.query(User).filter(User.username == user_data.username).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token(data={"user_id": user.id})
    refresh_token = create_refresh_token(data={"user_id": user.id})

    user.refresh_token = refresh_token
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
    track_metric_event(
        db,
        user.id,
        "auth",
        "login_success",
        details={"username": user.username},
    )

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
        },
    )


@router.post("/api/auth/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = verify_token(request.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.refresh_token != request.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or invalid",
        )

    if user.refresh_token_expiry and user.refresh_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    new_access_token = create_access_token(data={"user_id": user.id})

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=request.refresh_token,
        token_type="bearer",
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "level": user.level,
            "xp": user.xp,
        },
    )