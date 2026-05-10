import logging
import os
from datetime import datetime

# Carrega .env ANTES de qualquer import que dependa de env vars (ex.: auth.SECRET_KEY)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

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
from backend.controllers.phrases_controller import router as phrases_router
from backend.controllers.analytics_controller import router as analytics_router
from backend.controllers.pmf_controller import router as pmf_router
from backend.admin_controller import router as admin_router

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


def _run_migration_step(label: str, sql: str, engine_ref):
    """Run a single migration SQL statement in isolation, committing on success."""
    from sqlalchemy import text
    try:
        with engine_ref.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
            logger.info("Migration: %s", label)
    except Exception as exc:
        logger.warning("Migration skipped (%s): %s", label, exc)


def _run_migrations():
    """Add new columns to existing tables without dropping data."""
    from sqlalchemy import text, inspect as _inspect

    try:
        insp = _inspect(engine)

        # voice_seconds / voice_sessions on user_progress
        cols_up = [c["name"] for c in insp.get_columns("user_progress")]
        if "voice_seconds" not in cols_up:
            _run_migration_step(
                "added voice_seconds to user_progress",
                "ALTER TABLE user_progress ADD COLUMN voice_seconds INTEGER DEFAULT 0",
                engine,
            )
        if "voice_sessions" not in cols_up:
            _run_migration_step(
                "added voice_sessions to user_progress",
                "ALTER TABLE user_progress ADD COLUMN voice_sessions JSON",
                engine,
            )

        # onboarding/profile columns on users
        cols_users = [c["name"] for c in insp.get_columns("users")]
        if "onboarding_step" not in cols_users:
            _run_migration_step(
                "added onboarding_step to users",
                "ALTER TABLE users ADD COLUMN onboarding_step INTEGER DEFAULT 0",
                engine,
            )
        if "learning_why" not in cols_users:
            _run_migration_step(
                "added learning_why to users",
                "ALTER TABLE users ADD COLUMN learning_why TEXT",
                engine,
            )
        if "daily_interests" not in cols_users:
            _run_migration_step(
                "added daily_interests to users",
                "ALTER TABLE users ADD COLUMN daily_interests TEXT",
                engine,
            )

        # is_admin on users (BOOLEAN DEFAULT FALSE — compatible with PostgreSQL)
        if "is_admin" not in cols_users:
            _run_migration_step(
                "added is_admin to users",
                "ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE",
                engine,
            )

        # refresh_token / refresh_token_expiry on users
        if "refresh_token" not in cols_users:
            _run_migration_step(
                "added refresh_token to users",
                "ALTER TABLE users ADD COLUMN refresh_token VARCHAR(500)",
                engine,
            )
        if "refresh_token_expiry" not in cols_users:
            _run_migration_step(
                "added refresh_token_expiry to users",
                "ALTER TABLE users ADD COLUMN refresh_token_expiry TIMESTAMP",
                engine,
            )
        if "token_version" not in cols_users:
            _run_migration_step(
                "added token_version to users",
                "ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0",
                engine,
            )
        if "failed_login_count" not in cols_users:
            _run_migration_step(
                "added failed_login_count to users",
                "ALTER TABLE users ADD COLUMN failed_login_count INTEGER NOT NULL DEFAULT 0",
                engine,
            )
        if "locked_until" not in cols_users:
            _run_migration_step(
                "added locked_until to users",
                "ALTER TABLE users ADD COLUMN locked_until TIMESTAMP",
                engine,
            )

        # activity_type on user_activity (if table exists)
        if "user_activity" in insp.get_table_names():
            cols_ua = [c["name"] for c in insp.get_columns("user_activity")]
            if "activity_type" not in cols_ua:
                _run_migration_step(
                    "added activity_type to user_activity",
                    "ALTER TABLE user_activity ADD COLUMN activity_type VARCHAR(20) NOT NULL DEFAULT 'general'",
                    engine,
                )
                _run_migration_step(
                    "dropped old unique_user_date index",
                    "DROP INDEX IF EXISTS unique_user_date",
                    engine,
                )
                _run_migration_step(
                    "created unique_user_date_type index",
                    "CREATE UNIQUE INDEX IF NOT EXISTS unique_user_date_type ON user_activity (user_id, date, activity_type)",
                    engine,
                )

        # new_vocabulary on conversations
        if "conversations" in insp.get_table_names():
            cols_conv = [c["name"] for c in insp.get_columns("conversations")]
            if "new_vocabulary" not in cols_conv:
                _run_migration_step(
                    "added new_vocabulary to conversations",
                    "ALTER TABLE conversations ADD COLUMN new_vocabulary TEXT",
                    engine,
                )

        # Aprendida x Dominada — novas colunas em lesson_progress
        if "lesson_progress" in insp.get_table_names():
            cols_lp = [c["name"] for c in insp.get_columns("lesson_progress")]
            if "learned_at" not in cols_lp:
                _run_migration_step(
                    "added learned_at to lesson_progress",
                    "ALTER TABLE lesson_progress ADD COLUMN learned_at TIMESTAMP",
                    engine,
                )
            if "dominated_phrases_count" not in cols_lp:
                _run_migration_step(
                    "added dominated_phrases_count to lesson_progress",
                    "ALTER TABLE lesson_progress ADD COLUMN dominated_phrases_count INTEGER DEFAULT 0",
                    engine,
                )
            if "dominated_at" not in cols_lp:
                _run_migration_step(
                    "added dominated_at to lesson_progress",
                    "ALTER TABLE lesson_progress ADD COLUMN dominated_at TIMESTAMP",
                    engine,
                )

    except Exception as exc:
        logger.warning("Migration check failed (non-fatal): %s", exc)


_run_migrations()


def _seed_phrase_bank_if_needed():
    """Popula LessonPhraseBank com 5 frases iniciais por aula (idempotente)."""
    try:
        from backend.database import SessionLocal
        from backend.phrase_bank_seed import seed_phrase_bank
        db = SessionLocal()
        try:
            result = seed_phrase_bank(db)
            if result["inserted_lessons"]:
                logger.info(
                    "Seed phrase bank: %s aulas, %s frases",
                    len(result["inserted_lessons"]),
                    result["total_phrases"],
                )
        finally:
            db.close()
    except Exception as exc:
        logger.warning("Seed phrase bank skipped: %s", exc)


_seed_phrase_bank_if_needed()


app = FastAPI(
    title="GRILO API",
    description="English Learning Platform with Voice & Text Chat",
    version="1.0.0"
)

# QW10: Add rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
from fastapi.responses import JSONResponse as _JSONResponse


def _rate_limit_handler(request, exc):
    return _JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please slow down and try again."},
    )


app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)

# QW4: Add Request ID tracking middleware
app.add_middleware(RequestIDMiddleware)


# QW8: Add security headers middleware (CSP included)
_CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com data:; "
    "img-src 'self' data: blob: https:; "
    "media-src 'self' blob: data:; "
    "connect-src 'self' https://api.elevenlabs.io https://api.groq.com; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "frame-ancestors 'none'; "
    "form-action 'self';"
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "microphone=(self), camera=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = _CSP_POLICY
        return response


app.add_middleware(SecurityHeadersMiddleware)


# QW8: Trusted hosts — restricted to production host(s) only
from urllib.parse import urlparse

_extra_allowed = os.getenv("ALLOWED_HOSTS", "").split(",")
_extra_allowed = [h.strip() for h in _extra_allowed if h.strip()]

# Extract bare hostnames from CORS origins (TrustedHostMiddleware rejects scheme/port).
_cors_hosts = []
for origin in settings.cors_origins.split(","):
    origin = origin.strip()
    if not origin:
        continue
    parsed = urlparse(origin if "://" in origin else f"//{origin}", scheme="http")
    if parsed.hostname:
        _cors_hosts.append(parsed.hostname)

_default_hosts = _cors_hosts + [
    "localhost",
    "127.0.0.1",
    "testserver",
    "web-production-6ecc2.up.railway.app",
    "*.up.railway.app",
    "*.railway.app",
]
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=list({*_default_hosts, *_extra_allowed}),
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
            from backend.services import client
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


@app.get("/privacidade.html")
async def privacidade():
    return FileResponse(_frontend_file("privacidade.html"))


@app.get("/termos.html")
async def termos():
    return FileResponse(_frontend_file("termos.html"))


@app.get("/lessons")
async def lessons_alias():
    return FileResponse(_frontend_file("lessons.html"))


@app.get("/lessons.html")
async def lessons_page():
    return FileResponse(_frontend_file("lessons.html"))


@app.get("/dashboard")
async def dashboard_alias():
    return FileResponse(_frontend_file("dashboard.html"))


@app.get("/dashboard.html")
async def dashboard_page():
    return FileResponse(_frontend_file("dashboard.html"))


@app.get("/pmf")
async def pmf_alias():
    return FileResponse(_frontend_file("pmf.html"))


@app.get("/pmf.html")
async def pmf_page():
    return FileResponse(_frontend_file("pmf.html"))


# Domain controllers
app.include_router(auth_router)
app.include_router(chat_text_router)
app.include_router(chat_voice_router)
app.include_router(lessons_router)
app.include_router(phrases_router)
app.include_router(analytics_router)
app.include_router(pmf_router)
app.include_router(admin_router)

# Static files should be mounted last to avoid intercepting API routes.
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
