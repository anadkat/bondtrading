#!/usr/bin/env python3
"""
Bond Screener API - Python FastAPI Backend
"""

import uvicorn
import os
import sys

# Add the app directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )