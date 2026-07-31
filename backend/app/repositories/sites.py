"""Storage backends for vault entries, scoped per user.

Routes depend on the SiteRepository protocol. Every method takes a user_id
and only ever touches that user's rows — backend-level filtering, with
Postgres RLS as the defense-in-depth backstop.
"""
from datetime import datetime, timezone
from typing import Protocol
from uuid import uuid4

from app.core.config import get_settings
from app.services.supabase_client import get_supabase


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class SiteRepository(Protocol):
    def list_all(self, user_id: str) -> list[dict]: ...
    def get(self, site_id: str, user_id: str) -> dict | None: ...
    def create(self, data: dict, user_id: str) -> dict: ...
    def update(self, site_id: str, data: dict, user_id: str) -> dict | None: ...
    def delete(self, site_id: str, user_id: str) -> bool: ...


class InMemorySiteRepository:
    def __init__(self) -> None:
        self._store: dict[str, dict] = {}

    def list_all(self, user_id: str) -> list[dict]:
        rows = [s for s in self._store.values() if s["user_id"] == user_id]
        return sorted(rows, key=lambda s: s["site"].lower())

    def get(self, site_id: str, user_id: str) -> dict | None:
        record = self._store.get(site_id)
        if record is None or record["user_id"] != user_id:
            return None
        return record

    def create(self, data: dict, user_id: str) -> dict:
        record = {
            "id": str(uuid4()),
            "user_id": user_id,
            **data,
            "created_at": _now(),
            "updated_at": _now(),
        }
        self._store[record["id"]] = record
        return record

    def update(self, site_id: str, data: dict, user_id: str) -> dict | None:
        record = self._store.get(site_id)
        if record is None or record["user_id"] != user_id:
            return None
        record.update(data)
        record["updated_at"] = _now()
        return record

    def delete(self, site_id: str, user_id: str) -> bool:
        record = self._store.get(site_id)
        if record is None or record["user_id"] != user_id:
            return False
        del self._store[site_id]
        return True

    def clear(self) -> None:
        self._store.clear()


class SupabaseSiteRepository:
    TABLE = "sites"

    def list_all(self, user_id: str) -> list[dict]:
        result = (
            get_supabase().table(self.TABLE)
            .select("*").eq("user_id", user_id).order("site").execute()
        )
        return result.data

    def get(self, site_id: str, user_id: str) -> dict | None:
        result = (
            get_supabase().table(self.TABLE)
            .select("*").eq("id", site_id).eq("user_id", user_id).execute()
        )
        return result.data[0] if result.data else None

    def create(self, data: dict, user_id: str) -> dict:
        result = (
            get_supabase().table(self.TABLE)
            .insert({**data, "user_id": user_id}).execute()
        )
        return result.data[0]

    def update(self, site_id: str, data: dict, user_id: str) -> dict | None:
        result = (
            get_supabase().table(self.TABLE)
            .update({**data, "updated_at": _now()})
            .eq("id", site_id).eq("user_id", user_id).execute()
        )
        return result.data[0] if result.data else None

    def delete(self, site_id: str, user_id: str) -> bool:
        result = (
            get_supabase().table(self.TABLE)
            .delete().eq("id", site_id).eq("user_id", user_id).execute()
        )
        return bool(result.data)


_memory_repo = InMemorySiteRepository()


def get_site_repository() -> SiteRepository:
    if get_settings().STORAGE_BACKEND == "memory":
        return _memory_repo
    return SupabaseSiteRepository()
