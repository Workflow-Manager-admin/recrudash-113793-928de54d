import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Optionally, access Supabase-related environment variables for logging or connection
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    """
    PUBLIC_INTERFACE
    Health check endpoint for the backend service.

    Returns:
        dict: A simple healthy status message and the Supabase URL (for debugging).
    """
    return {
        "message": "Healthy",
        "supabase_url": SUPABASE_URL,
    }
