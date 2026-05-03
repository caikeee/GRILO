"""
🆔 Request ID Middleware (QW4)
Adds unique ID to every request for tracing and debugging
"""

import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Adds X-Request-ID header to all requests.
    Useful for tracing requests through logs and multiple services.
    """
    
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log incoming request
        logger.info(
            f"[{request_id}] {request.method} {request.url.path}",
            extra={"request_id": request_id, "method": request.method, "path": request.url.path}
        )
        
        response = await call_next(request)
        
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        
        # Log response
        logger.info(
            f"[{request_id}] Response {response.status_code}",
            extra={"request_id": request_id, "status_code": response.status_code}
        )
        
        return response


__all__ = ["RequestIDMiddleware"]
