"""Site (vault entry) CRUD.

NOTE: Uses an in-memory store so the app works end-to-end without Supabase
credentials. The service layer will be swapped for Supabase in a later step —
the API contract stays the same.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.auth import get_current_user_id
from app.core.crypto import decrypt, encrypt
from app.repositories.sites import SiteRepository, get_site_repository

router = APIRouter(prefix="/sites", tags=["sites"])


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


def _encrypt_payload(payload: SiteBase) -> dict:
    data = payload.model_dump()
    data["password"] = encrypt(data["password"])
    data["backup_code"] = encrypt(data["backup_code"])
    return data


def _to_out(record: dict) -> SiteOut:
    return SiteOut(
        **{
            **record,
            "password": decrypt(record["password"]),
            "backup_code": decrypt(record["backup_code"]),
        }
    )


@router.get("", response_model=list[SiteOut])
def list_sites(
    user_id: str = Depends(get_current_user_id),
    repo: SiteRepository = Depends(get_site_repository),
) -> list[SiteOut]:
    return [_to_out(r) for r in repo.list_all(user_id)]


@router.post("", response_model=SiteOut, status_code=201)
def create_site(
    payload: SiteCreate,
    user_id: str = Depends(get_current_user_id),
    repo: SiteRepository = Depends(get_site_repository),
) -> SiteOut:
    return _to_out(repo.create(_encrypt_payload(payload), user_id))


@router.get("/{site_id}", response_model=SiteOut)
def get_site(
    site_id: str,
    user_id: str = Depends(get_current_user_id),
    repo: SiteRepository = Depends(get_site_repository),
) -> SiteOut:
    record = repo.get(site_id, user_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Site not found")
    return _to_out(record)


@router.put("/{site_id}", response_model=SiteOut)
def update_site(
    site_id: str,
    payload: SiteUpdate,
    user_id: str = Depends(get_current_user_id),
    repo: SiteRepository = Depends(get_site_repository),
) -> SiteOut:
    record = repo.update(site_id, _encrypt_payload(payload), user_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Site not found")
    return _to_out(record)


@router.delete("/{site_id}", status_code=204)
def delete_site(
    site_id: str,
    user_id: str = Depends(get_current_user_id),
    repo: SiteRepository = Depends(get_site_repository),
) -> None:
    if not repo.delete(site_id, user_id):
        raise HTTPException(status_code=404, detail="Site not found")
