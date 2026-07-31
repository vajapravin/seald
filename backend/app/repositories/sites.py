"""Storage backends for vault entries.

Routes depend on the SiteRepository protocol, not a concrete backend:
tests use InMemorySiteRepository, production uses SupabaseSiteRepository.
Both store ciphertext only — encryption happens in the route layer.
"""

from datetime import UTC, datetime
from typing import Protocol
from uuid import uuid4

from app.core.config import get_settings
from app.services.supabase_client import get_supabase


def _now() -> str:
    return datetime.now(UTC).isoformat()


class SiteRepository(Protocol):
    def list_all(self) -> list[dict]: ...
    def get(self, site_id: str) -> dict | None: ...
    def create(self, data: dict) -> dict: ...
    def update(self, site_id: str, data: dict) -> dict | None: ...
    def delete(self, site_id: str) -> bool: ...


class InMemorySiteRepository:
    def __init__(self) -> None:
        self._store: dict[str, dict] = {}

    def list_all(self) -> list[dict]:
        return sorted(self._store.values(), key=lambda s: s["site"].lower())

    def get(self, site_id: str) -> dict | None:
        return self._store.get(site_id)

    def create(self, data: dict) -> dict:
        record = {"id": str(uuid4()), **data, "created_at": _now(), "updated_at": _now()}
        self._store[record["id"]] = record
        return record

    def update(self, site_id: str, data: dict) -> dict | None:
        record = self._store.get(site_id)
        if record is None:
            return None
        record.update(data)
        record["updated_at"] = _now()
        return record

    def delete(self, site_id: str) -> bool:
        return self._store.pop(site_id, None) is not None

    def clear(self) -> None:
        self._store.clear()


class SupabaseSiteRepository:
    TABLE = "sites"

    def list_all(self) -> list[dict]:
        result = get_supabase().table(self.TABLE).select("*").order("site").execute()
        return result.data

    def get(self, site_id: str) -> dict | None:
        result = get_supabase().table(self.TABLE).select("*").eq("id", site_id).execute()
        return result.data[0] if result.data else None

    def create(self, data: dict) -> dict:
        result = get_supabase().table(self.TABLE).insert(data).execute()
        return result.data[0]

    def update(self, site_id: str, data: dict) -> dict | None:
        payload = {**data, "updated_at": _now()}
        result = get_supabase().table(self.TABLE).update(payload).eq("id", site_id).execute()
        return result.data[0] if result.data else None

    def delete(self, site_id: str) -> bool:
        result = get_supabase().table(self.TABLE).delete().eq("id", site_id).execute()
        return bool(result.data)


_memory_repo = InMemorySiteRepository()


def get_site_repository() -> SiteRepository:
    if get_settings().STORAGE_BACKEND == "memory":
        return _memory_repo
    return SupabaseSiteRepository()
