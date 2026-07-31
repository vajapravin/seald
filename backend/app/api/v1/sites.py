"""Site (vault entry) CRUD.

NOTE: Uses an in-memory store so the app works end-to-end without Supabase
credentials. The service layer will be swapped for Supabase in a later step —
the API contract stays the same.
"""

from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.crypto import decrypt, encrypt

router = APIRouter(prefix="/sites", tags=["sites"])

# --- In-memory store (temporary until Supabase step) ---
_SITES: dict[str, dict] = {}


class SiteBase(BaseModel):
    site: str = Field(min_length=1, max_length=255, examples=["github.com"])
    username: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=512)
    note: str = Field(default="", max_length=2000)
    backup_code: str = Field(default="", max_length=1000)


class SiteCreate(SiteBase):
    pass


class SiteUpdate(SiteBase):
    pass


class SiteOut(SiteBase):
    id: str
    created_at: str
    updated_at: str


def _now() -> str:
    return datetime.now(UTC).isoformat()


@router.get("", response_model=list[SiteOut])
def list_sites() -> list[SiteOut]:
    items = sorted(_SITES.values(), key=lambda s: s["site"].lower())
    return [SiteOut(**s) for s in items]


@router.post("", response_model=SiteOut, status_code=201)
def create_site(payload: SiteCreate) -> SiteOut:
    site_id = str(uuid4())
    record = {
        "id": site_id,
        **payload.model_dump(),
        "created_at": _now(),
        "updated_at": _now(),
    }
    record["password"] = encrypt(record["password"])
    record["backup_code"] = encrypt(record["backup_code"])
    _SITES[site_id] = record
    return _to_out(record)


@router.get("/{site_id}", response_model=SiteOut)
def get_site(site_id: str) -> SiteOut:
    record = _SITES.get(site_id)
    if not record:
        raise HTTPException(status_code=404, detail="Site not found")
    return _to_out(record)


@router.put("/{site_id}", response_model=SiteOut)
def update_site(site_id: str, payload: SiteUpdate) -> SiteOut:
    record = _SITES.get(site_id)
    if not record:
        raise HTTPException(status_code=404, detail="Site not found")
    data = payload.model_dump()
    record.update(data)
    record["password"] = encrypt(data["password"])
    record["backup_code"] = encrypt(data["backup_code"])
    record["updated_at"] = _now()
    return _to_out(record)


@router.delete("/{site_id}", status_code=204)
def delete_site(site_id: str) -> None:
    if site_id not in _SITES:
        raise HTTPException(status_code=404, detail="Site not found")
    del _SITES[site_id]


def _to_out(record: dict) -> SiteOut:
    return SiteOut(
        **{
            **record,
            "password": decrypt(record["password"]),
            "backup_code": decrypt(record["backup_code"]),
        }
    )
