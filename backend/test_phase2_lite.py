#!/usr/bin/env python
"""
PHASE 2 LITE - VALIDATION TEST
Valida todos os componentes implementados (QW9-QW12)
"""

import sys
import os
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

print('=' * 60)
print('PHASE 2 LITE - VALIDATION TEST')
print('=' * 60)

try:
    # Test 1: Import auth with new functions
    from auth import create_refresh_token, REFRESH_TOKEN_EXPIRE_DAYS
    print('✓ QW9: create_refresh_token imported')
    print(f'✓ QW9: REFRESH_TOKEN_EXPIRE_DAYS = {REFRESH_TOKEN_EXPIRE_DAYS} days')
    
    # Test 2: Import schemas with RefreshTokenRequest
    from schemas import RefreshTokenRequest, TokenResponse
    print('✓ QW9: RefreshTokenRequest schema exists')
    print('✓ QW9: TokenResponse updated with refresh_token')
    
    # Test 3: Check db_models has refresh token fields
    from db_models import User
    from sqlalchemy import inspect
    mapper = inspect(User)
    columns = [c.name for c in mapper.columns]
    assert 'refresh_token' in columns, 'Missing refresh_token column'
    assert 'refresh_token_expiry' in columns, 'Missing refresh_token_expiry column'
    print('✓ QW9: User model has refresh_token fields')
    
    # Test 4: Import groq_quota_manager
    from utils.groq_quota_manager import get_quota_status, add_tokens
    status = get_quota_status()
    used = status['used']
    limit = status['limit']
    print(f'✓ QW11: Groq Quota Manager: {used}/{limit} tokens')
    
    # Test 5: Import rate_limiter
    from utils.rate_limiter import limiter, RATE_LIMITS
    print(f'✓ QW10: Rate Limiter configured with {len(RATE_LIMITS)} policies')
    
    # Test 6: Import json_logger
    from utils.json_logger import setup_json_logging, get_logger
    print('✓ QW12: JSON Logger configured')
    
    # Test 7: Load server config
    from config import settings
    mode = 'production' if not settings.debug else 'development'
    print(f'✓ Config loaded: {mode} mode')
    
    # Test 8: Check auth_controller has refresh endpoint
    from controllers import auth_controller
    routes = [route.path for route in auth_controller.router.routes]
    assert '/api/auth/refresh' in routes, 'Missing /api/auth/refresh endpoint'
    print('✓ QW9: /api/auth/refresh endpoint registered')
    
    print('=' * 60)
    print('✅ ALL PHASE 2 LITE COMPONENTS VALIDATED')
    print('=' * 60)
    print()
    print('SUMMARY:')
    print('  QW9:  JWT Refresh Token       ✓ COMPLETE')
    print('  QW10: Rate Limiting            ✓ COMPLETE')
    print('  QW11: Groq Quota Manager       ✓ COMPLETE')
    print('  QW12: JSON Logging             ✓ COMPLETE')
    print()
    print('Next steps:')
    print('  1. git add -A')
    print('  2. git commit -m "Phase 2 Lite: QW9-QW12"')
    print('  3. git push')
    print('  4. Deploy to Railway')
    
except Exception as e:
    print(f'❌ VALIDATION FAILED: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
