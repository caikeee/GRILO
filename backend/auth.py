from datetime import datetime, timedelta
from typing import Optional
import hashlib
import os
import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Header

# Secret key for JWT - must be set via SECRET_KEY environment variable
_secret_key = os.getenv("SECRET_KEY")
if not _secret_key:
    raise RuntimeError(
        "SECRET_KEY environment variable is not set. "
        "Generate one with: python -c 'import secrets; print(secrets.token_hex(32))'"
    )
SECRET_KEY: str = _secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8  # reduced from 24h — limits exposure window if token leaks
REFRESH_TOKEN_EXPIRE_DAYS = 30


def hash_refresh_token(token: str) -> str:
    """SHA-256 hash of a refresh token for safe DB storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token (30 days)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Validate access token and return user_id.

    Also enforces token_version match against the DB so a logout/password-reset
    can revoke previously issued access tokens.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    token = parts[1]
    payload = verify_token(token)

    # Reject refresh tokens used as access tokens
    if payload.get("type") == "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    if "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user_id = payload["user_id"]

    # Enforce token_version (revocation on logout / password reset)
    try:
        from backend.database import SessionLocal
        from backend.db_models import User
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                )
            tv_token = payload.get("tv", 0)
            tv_user = getattr(user, "token_version", 0) or 0
            if int(tv_token) != int(tv_user):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session revoked. Please log in again.",
                )
        finally:
            db.close()
    except HTTPException:
        raise
    except Exception:
        # If DB lookup fails (e.g., during migrations) fail closed only on tv mismatch above
        pass

    return user_id


async def get_current_user(db, user_id: int = Depends(get_current_user_id)):
    from backend.db_models import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
