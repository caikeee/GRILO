from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth import create_access_token, create_refresh_token, hash_password, verify_password, get_current_user_id, verify_token  # QW9
from backend.database import get_db
from backend.db_models import User, UserProgress
from backend.utils import update_streak, award_xp
from backend.schemas import (
    TokenResponse,
    UserLogin,
    UserRegister,
    RefreshTokenRequest,  # QW9
)
from datetime import datetime, timedelta  # QW9

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
    db.commit()
    db.refresh(new_user)

    user_progress = UserProgress(user_id=new_user.id)
    db.add(user_progress)
    db.commit()

    access_token = create_access_token(data={"user_id": new_user.id})
    refresh_token = create_refresh_token(data={"user_id": new_user.id})  # QW9
    
    # Store refresh_token in DB for validation (QW9)
    from auth import REFRESH_TOKEN_EXPIRE_DAYS
    new_user.refresh_token = refresh_token
    new_user.refresh_token_expiry = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,  # QW9
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
    refresh_token = create_refresh_token(data={"user_id": user.id})  # QW9
    
    # Store refresh_token in DB (QW9)
    from auth import REFRESH_TOKEN_EXPIRE_DAYS
    user.refresh_token = refresh_token
    user.refresh_token_expiry = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()

    # Update streak and award daily login XP (5 XP base + streak bonus)
    streak_result = update_streak(db, user.id)
    if streak_result["is_new_day"]:
        award_xp(db, user.id, 5 + streak_result["streak_bonus_xp"], source="daily_login")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,  # QW9
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


@router.post("/api/auth/refresh", response_model=TokenResponse)  # QW9: Refresh token endpoint
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token (QW9)."""
    # Verificar se refresh_token é válido
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
    
    # Verificar se expirou
    if user.refresh_token_expiry and user.refresh_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )
    
    # Gerar novo access_token (refresh_token continua igual)
    new_access_token = create_access_token(data={"user_id": user.id})
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=request.refresh_token,  # QW9: Same refresh token
        token_type="bearer",
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "level": user.level,
            "xp": user.xp,
        },
    )
