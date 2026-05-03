"""Development server with .env loading"""
import os
from dotenv import load_dotenv

# Load .env file BEFORE importing anything else
load_dotenv()

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "backend.server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on file changes for development
    )
