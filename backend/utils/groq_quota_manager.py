"""
QW11: Groq Quota Manager
Tracks daily token usage and enforces limits to protect budget.
Stores quota in JSON file (production should use Redis).
"""

from datetime import datetime, date
import json
import os
import logging

logger = logging.getLogger(__name__)

# Daily token limit (adjust based on your Groq plan)
# Typical: 100k tokens = ~1000 requests
DAILY_TOKEN_LIMIT = 100_000

# Store quota in memory and file
_quota_store = {}


def get_quota_file():
    """Get quota file path."""
    return os.path.join(os.path.dirname(__file__), "..", "groq_quota.json")


def load_quota():
    """Load quota from file."""
    global _quota_store
    quota_file = get_quota_file()
    
    try:
        if os.path.exists(quota_file):
            with open(quota_file, "r") as f:
                _quota_store = json.load(f)
                logger.debug(f"Quota loaded: {_quota_store}")
        else:
            _quota_store = {}
    except Exception as e:
        logger.warning(f"Failed to load quota: {e}")
        _quota_store = {}
    
    return _quota_store


def save_quota():
    """Save quota to file."""
    try:
        quota_file = get_quota_file()
        with open(quota_file, "w") as f:
            json.dump(_quota_store, f, indent=2)
            logger.debug(f"Quota saved: {_quota_store}")
    except Exception as e:
        logger.error(f"Failed to save quota: {e}")


def get_today():
    """Get today's date as string (YYYY-MM-DD)."""
    return str(date.today())


def get_daily_usage():
    """Get tokens used today."""
    load_quota()
    today = get_today()
    return _quota_store.get(today, 0)


def add_tokens(count: int):
    """Add tokens to today's usage."""
    load_quota()
    today = get_today()
    _quota_store[today] = _quota_store.get(today, 0) + count
    save_quota()
    
    logger.info(f"Added {count} tokens. Today's usage: {_quota_store[today]}/{DAILY_TOKEN_LIMIT}")


def is_quota_exceeded():
    """Check if daily quota is exceeded."""
    load_quota()
    return get_daily_usage() >= DAILY_TOKEN_LIMIT


def get_remaining_tokens():
    """Get remaining tokens today."""
    load_quota()
    used = get_daily_usage()
    remaining = DAILY_TOKEN_LIMIT - used
    return max(0, remaining)


def reset_daily_quota():
    """Reset quota for new day (cleanup old entries)."""
    load_quota()
    today = get_today()
    # Keep only today's data
    today_usage = _quota_store.get(today, 0)
    _quota_store = {today: today_usage}
    save_quota()
    logger.info("Daily quota reset")


def get_quota_status():
    """Get detailed quota status."""
    load_quota()
    used = get_daily_usage()
    remaining = get_remaining_tokens()
    percentage = (used / DAILY_TOKEN_LIMIT) * 100
    
    return {
        "date": get_today(),
        "used": used,
        "limit": DAILY_TOKEN_LIMIT,
        "remaining": remaining,
        "percentage": round(percentage, 1),
        "exceeded": is_quota_exceeded(),
    }
