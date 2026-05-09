"""
GRILO Admin Controller
Admin endpoints for user management (password reset, user listing, etc)
Only "caike" has admin access
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.db_models import User
from backend.auth import hash_password, get_current_user_id
from backend.schemas import PasswordResetRequest, UserAdminResponse
from typing import List

router = APIRouter()


def _get_user_from_db(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def verify_admin(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> User:
    """Verify that current user is admin"""
    user = _get_user_from_db(db, user_id)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


@router.get("/api/admin/check", tags=["admin"])
async def check_admin_status(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Check if logged-in user is admin"""
    user = _get_user_from_db(db, user_id)
    return {
        "is_admin": user.is_admin,
        "username": user.username
    }


@router.get("/api/admin/users", response_model=List[UserAdminResponse], tags=["admin"])
async def list_users(
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """List all users (admin only)"""
    users = db.query(User).all()
    return users


@router.post("/api/admin/reset-password", tags=["admin"])
async def reset_user_password(
    req: PasswordResetRequest,
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Reset password for a user (admin only)"""
    user = db.query(User).filter(User.username == req.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{req.username}' not found"
        )
    
    # Hash and update password; revoke all existing sessions for the victim
    user.password_hash = hash_password(req.new_password)
    user.token_version = (user.token_version or 0) + 1
    user.refresh_token = None
    user.refresh_token_expiry = None
    user.failed_login_count = 0
    user.locked_until = None
    db.commit()

    return {
        "success": True,
        "message": f"Password reset for user '{req.username}'",
        "username": req.username
    }


@router.get("/api/admin/user/{username}", response_model=UserAdminResponse, tags=["admin"])
async def get_user_info(
    username: str,
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get info for a specific user (admin only)"""
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{username}' not found"
        )
    
    return user
