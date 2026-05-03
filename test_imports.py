#!/usr/bin/env python
"""Test script to verify all imports work correctly"""
import os
import sys

# Set required env vars for testing
os.environ.setdefault('SECRET_KEY', 'test_secret_key_for_testing_imports_only_123456789012345')
os.environ.setdefault('DATABASE_URL', 'sqlite:///./grilo.db')
os.environ.setdefault('GROQ_API_KEY', 'test_key')
os.environ.setdefault('ELEVENLABS_API_KEY', 'test_key')
os.environ.setdefault('ENVIRONMENT', 'development')
os.environ.setdefault('LOG_LEVEL', 'INFO')

print("=" * 70)
print("TESTING ALL IMPORTS WITH ABSOLUTE PATHS")
print("=" * 70)

try:
    print("\n✓ Importing backend.config...")
    from backend.config import settings
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.database...")
    from backend.database import Base, engine
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.auth...")
    from backend.auth import create_access_token, verify_password
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.db_models...")
    from backend.db_models import User
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.schemas...")
    from backend.schemas import ChatRequest
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.middleware...")
    from backend.middleware import RequestIDMiddleware
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.services...")
    from backend import services
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.decision_engine...")
    from backend import decision_engine
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.controllers.auth_controller...")
    from backend.controllers import auth_controller
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.controllers.chat_text_controller...")
    from backend.controllers import chat_text_controller
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.controllers.chat_voice_controller...")
    from backend.controllers import chat_voice_controller
    print("  └─ SUCCESS")
    
    print("\n✓ Importing backend.controllers.lessons_controller...")
    from backend.controllers import lessons_controller
    print("  └─ SUCCESS")
    
    print("\n" + "=" * 70)
    print("✅ ALL IMPORTS SUCCESSFUL - Backend structure is correct!")
    print("=" * 70)
    print("\nNext step: Run the server with:")
    print("  python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000")
    print("\nOR set env vars and run:")
    print("  Set-Item -Path env:SECRET_KEY -Value 'your-secret-key'")
    print("  python -m uvicorn backend.server:app")
    
except Exception as e:
    print(f"\n❌ IMPORT FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
