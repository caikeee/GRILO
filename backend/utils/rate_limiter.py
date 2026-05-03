"""
QW10: Rate Limiting
Protege API contra abuso e limita custos com Groq.
Usa slowapi para implementar rate limiting baseado em IP.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

# Criar limiter global
limiter = Limiter(key_func=get_remote_address)

# Diferentes políticas para diferentes endpoints
# Formato: "N per M seconds/minutes/hours/days"

RATE_LIMITS = {
    "register": "5 per hour",        # 5 registros por hora
    "login": "10 per hour",           # 10 logins por hora
    "refresh": "20 per hour",         # 20 refreshes por hora
    "chat_text": "30 per minute",     # 30 mensagens por minuto
    "chat_voice": "10 per minute",    # 10 requisições voice por minuto
    "health": "100 per minute",       # 100 health checks por minuto
}


async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom error handler para rate limit excedido."""
    return {
        "detail": "Rate limit exceeded. Too many requests.",
        "retry_after": exc.detail.split(" ")[-1] if exc.detail else "unknown"
    }
