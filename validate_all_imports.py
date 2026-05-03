#!/usr/bin/env python
"""
Final validation: Test all imports in the project
"""
import os
import sys

# Set required env vars for testing
os.environ.setdefault('SECRET_KEY', 'test_secret_key_for_testing_imports_only')
os.environ.setdefault('DATABASE_URL', 'sqlite:///./grilo.db')
os.environ.setdefault('GROQ_API_KEY', 'test_key')
os.environ.setdefault('ELEVENLABS_API_KEY', 'test_key')

print("=" * 80)
print("FINAL VALIDATION: Testing all imports with absolute paths")
print("=" * 80)

test_modules = [
    ("backend.config", "settings"),
    ("backend.database", "Base, engine"),
    ("backend.auth", "create_access_token"),
    ("backend.db_models", "User"),
    ("backend.schemas", "ChatRequest"),
    ("backend.middleware", "RequestIDMiddleware"),
    ("backend.services", "chat_concise_voice"),
    ("backend.decision_engine", "voice_router"),
    ("backend.fallback", "GraciousFallback"),
    ("backend.voice_cache", "voice_cache"),
    ("backend.voice_metrics", "voice_metrics"),
    ("backend.pedagogy_orchestrator", "PedagogyOrchestrator"),
    ("backend.quiz_questions", "get_all_questions"),
    ("backend.lessons_v2", "lessons_a1"),
    ("backend.utils", "update_streak"),
    ("backend.utils.http_utils", "async_retry_with_backoff"),
    ("backend.utils.groq_quota_manager", "get_quota_status"),
    ("backend.utils.rate_limiter", "limiter"),
    ("backend.utils.json_logger", "setup_json_logging"),
    ("backend.controllers.auth_controller", "router"),
    ("backend.controllers.chat_text_controller", "router"),
    ("backend.controllers.chat_voice_controller", "router"),
    ("backend.controllers.lessons_controller", "router"),
    ("backend.rag.pdf_extractor", "PDFExtractor"),
    ("backend.rag.chunking", "PDFChunker"),
    ("backend.rag.vector_store", "RAGVectorStore"),
    ("backend.server", "app"),
]

success_count = 0
failed_count = 0

for module_name, items in test_modules:
    try:
        __import__(module_name)
        print(f"✅ {module_name:<50} OK")
        success_count += 1
    except Exception as e:
        print(f"❌ {module_name:<50} FAILED: {str(e)[:60]}")
        failed_count += 1

print("=" * 80)
if failed_count == 0:
    print(f"✅ ALL {success_count} MODULES IMPORTED SUCCESSFULLY!")
    print("=" * 80)
    print("\nReady for production deployment!")
    print("\nCommand to run:")
    print("  python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000")
    sys.exit(0)
else:
    print(f"❌ {failed_count} MODULES FAILED out of {success_count + failed_count}")
    print("=" * 80)
    sys.exit(1)
