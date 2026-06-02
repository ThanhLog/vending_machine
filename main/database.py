import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from supabase import Client, create_client

load_dotenv()


def _clean_env(value: str | None) -> str | None:
    if value is None:
        return None
    return value.strip().strip("\"'")


def _normalize_supabase_url(value: str | None) -> str | None:
    value = _clean_env(value)
    if not value:
        return None
    if not value.startswith(("http://", "https://")):
        value = f"https://{value}"
    return value


def _normalize_database_url(value: str | None) -> str | None:
    value = _clean_env(value)
    if not value:
        return None

    if value.startswith("postgresql://"):
        value = value.replace("postgresql://", "postgresql+psycopg2://", 1)

    return value


def _build_engine_kwargs(database_url: str) -> dict:
    engine_kwargs = {"echo": True, "pool_pre_ping": True}

    if ".supabase.co" in database_url and "sslmode=" not in database_url:
        engine_kwargs["connect_args"] = {"sslmode": "require"}

    return engine_kwargs


DATABASE_URL = _normalize_database_url(
    os.getenv("DATABASE_URL")
    or os.getenv("SUPABASE_DB_URL")
    or os.getenv("SUPABASE_DATABASE_URL")
)
SUPABASE_URL = _normalize_supabase_url(os.getenv("SUPABASE_URL"))
SUPABASE_KEY = _clean_env(os.getenv("SUPABASE_KEY"))


if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. Set DATABASE_URL or SUPABASE_DB_URL."
    )


engine = create_engine(DATABASE_URL, **_build_engine_kwargs(DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
supbase: Client | None = None


Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_supabase():
    global supbase

    if supbase is not None:
        return supbase

    if not SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is not configured.")
    if not SUPABASE_KEY:
        raise RuntimeError("SUPABASE_KEY is not configured.")

    supbase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return supbase
