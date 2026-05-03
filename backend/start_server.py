#!/usr/bin/env python
"""
Simple server launcher wrapper to ensure proper initialization.
Runs GRILO backend on localhost:8000
"""

import uvicorn
import sys
import os
from dotenv import load_dotenv

# Load .env before any application module is imported
_env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(_env_path)

# Add parent directory to path for proper imports
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    print("Starting GRILO Backend...")
    print("Server: http://127.0.0.1:8000")
    print("-" * 60)
    
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=False,  # Disable reload to avoid double-start issues
        log_level="info"
    )
