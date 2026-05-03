import logging
import os
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter  # QW10: Rate Limiting
from slowapi.util import get_remote_address  # QW10
from slowapi.errors import RateLimitExceeded  # QW10

from backend.controllers.auth_controller import router as auth_router
from backend.controllers.chat_text_controller import router as chat_text_router
from backend.controllers.chat_voice_controller import router as chat_voice_router
from backend.controllers.lessons_controller import router as lessons_router

from backend.database import Base, engine
from backend.config import settings, validate_settings
from backend.middleware import RequestIDMiddleware
from backend.utils.json_logger import setup_json_logging

# Validate configuration (QW5)
try:
    validate_settings()
except ValueError as e:
    print(f"❌ Configuration Error: {e}")
    exit(1)

# QW12: Setup JSON logging for production
if settings.debug is False:
    setup_json_logging(level=settings.log_level)

# Setup logging (QW1 - kept for compatibility)
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Ensure database tables exist on startup.
Base.metadata.create_all(bind=engine)


def _run_migrations():
    """Add new columns to existing tables without dropping data."""
    from sqlalchemy import text, inspect as _inspect
    try:
        with engine.connect() as conn:
            insp = _inspect(engine)

            # voice_seconds on user_progress
            cols_up = [c["name"] for c in insp.get_columns("user_progress")]
            if "voice_seconds" not in cols_up:
                conn.execute(text("ALTER TABLE user_progress ADD COLUMN voice_seconds INTEGER DEFAULT 0"))
                conn.commit()
                logger.info("Migration: added voice_seconds to user_progress")

            # activity_type on user_activity (if table exists)
            if "user_activity" in insp.get_table_names():
                cols_ua = [c["name"] for c in insp.get_columns("user_activity")]
                if "activity_type" not in cols_ua:
                    conn.execute(text("ALTER TABLE user_activity ADD COLUMN activity_type VARCHAR(20) NOT NULL DEFAULT 'general'"))
                    conn.execute(text("DROP INDEX IF EXISTS unique_user_date"))
                    conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS unique_user_date_type ON user_activity (user_id, date, activity_type)"))
                    conn.commit()
                    logger.info("Migration: added activity_type to user_activity")

            # new_vocabulary on conversations
            if "conversations" in insp.get_table_names():
                cols_conv = [c["name"] for c in insp.get_columns("conversations")]
                if "new_vocabulary" not in cols_conv:
                    conn.execute(text("ALTER TABLE conversations ADD COLUMN new_vocabulary TEXT"))
                    conn.commit()
                    logger.info("Migration: added new_vocabulary to conversations")
    except Exception as exc:
        logger.warning("Migration check failed (non-fatal): %s", exc)


_run_migrations()

app = FastAPI(
    title="GRILO API",
    description="English Learning Platform with Voice & Text Chat",
    version="1.0.0"
)

# QW10: Add rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: {
    "detail": "Too many requests. Please try again later.",
    "retry_after": "60 seconds"
})

# QW4: Add Request ID tracking middleware
app.add_middleware(RequestIDMiddleware)

# QW8: Add security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# QW8: Enforce HTTPS in production (QW8)
if settings.debug is False:
    @app.middleware("http")
    async def https_redirect(request, call_next):
        if request.url.scheme == "http" and request.headers.get("host") != "localhost":
            from fastapi.responses import RedirectResponse
            return RedirectResponse(
                url=request.url.replace(scheme="https"),
                status_code=301
            )
        return await call_next(request)

# QW8: Trusted hosts (security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.cors_origins.split(",") + ["localhost", "127.0.0.1", ".railway.app"]
)

# QW8: CORS with whitelist (security) - NOT allow_origins="*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,  # Cache CORS headers for 1h
)

logger.info(f"✅ CORS enabled for origins: {settings.cors_origins_list}")
logger.info(f"✅ Server running in DEBUG mode: {settings.debug}")

frontend_path = os.path.join(os.path.dirname(__file__), "../frontend")


def _frontend_file(file_name: str) -> str:
    return os.path.join(frontend_path, file_name)


@app.get("/health")
async def health_check():
    """
    Health check endpoint (QW2)
    Verify database and API connectivity
    """
    try:
        from sqlalchemy import text
        
        # Test database
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Test Groq API availability
        try:
            from services import client
            client.models.list()
            groq_status = "ok"
        except Exception as e:
            groq_status = f"error: {str(e)[:50]}"
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "components": {
                "database": "ok",
                "groq_api": groq_status,
                "version": "1.0.0"
            }
        }
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }, 503


@app.get("/")
async def root():
    return FileResponse(_frontend_file("index.html"))


@app.get("/home.html")
async def home():
    return FileResponse(_frontend_file("home.html"))


@app.get("/landing.html")
async def landing():
    # Keep compatibility for old links; project now uses index/home as entry pages.
    return FileResponse(_frontend_file("index.html"))


@app.get("/index.html")
async def index():
    return FileResponse(_frontend_file("index.html"))


@app.get("/lessons")
async def lessons_alias():
    return FileResponse(_frontend_file("lessons.html"))


@app.get("/lessons.html")
async def lessons_page():
    return FileResponse(_frontend_file("lessons.html"))


# Domain controllers
app.include_router(auth_router)
app.include_router(chat_text_router)
app.include_router(chat_voice_router)
app.include_router(lessons_router)

# Static files should be mounted last to avoid intercepting API routes.
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
