import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("SUPABASE_DB_URL")
    or os.getenv("SUPABASE_DATABASE_URL")
)
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 48
