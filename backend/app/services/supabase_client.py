"""Lazy Supabase client. Import `get_supabase()` wherever DB access is needed."""

from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase() -> Client:
    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise RuntimeError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env"
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
