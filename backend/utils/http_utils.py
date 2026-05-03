"""
🔄 HTTP Retry Logic (QW3)
Automatic retry with exponential backoff for transient failures
"""

import asyncio
import logging
from typing import Optional, Any
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    RetryError,
)

logger = logging.getLogger(__name__)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.RequestError, httpx.TimeoutException)),
)
async def fetch_with_retry(
    url: str,
    method: str = "GET",
    timeout: int = 10,
    **kwargs
) -> httpx.Response:
    """
    Fetch URL with automatic retry on transient failures.
    
    Args:
        url: URL to fetch
        method: HTTP method (GET, POST, etc)
        timeout: Request timeout in seconds
        **kwargs: Additional arguments to pass to httpx
    
    Returns:
        httpx.Response
    
    Raises:
        httpx.HTTPStatusError: If non-transient error
        RetryError: If max retries exceeded
    """
    async with httpx.AsyncClient(timeout=timeout) as client:
        logger.debug(f"Fetching {method} {url} (timeout={timeout}s)")
        response = await client.request(method, url, **kwargs)
        response.raise_for_status()
        logger.debug(f"✅ {method} {url} -> {response.status_code}")
        return response


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
)
async def fetch_json_with_retry(
    url: str,
    method: str = "GET",
    timeout: int = 10,
    **kwargs
) -> dict:
    """
    Fetch JSON with automatic retry.
    
    Returns:
        Parsed JSON response
    """
    response = await fetch_with_retry(url, method, timeout, **kwargs)
    return response.json()


def should_retry(error: Exception) -> bool:
    """Check if error is transient and retryable"""
    transient_errors = (
        httpx.TimeoutException,
        httpx.ConnectError,
        asyncio.TimeoutError,
    )
    return isinstance(error, transient_errors)


__all__ = ["fetch_with_retry", "fetch_json_with_retry", "should_retry"]
