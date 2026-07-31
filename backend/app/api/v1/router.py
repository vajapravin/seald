from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from zxcvbn import zxcvbn

from app.api.v1.sites import router as sites_router
from app.services.password_generator import generate_backup_codes, generate_password

api_router = APIRouter()
api_router.include_router(sites_router)


class GeneratePasswordRequest(BaseModel):
    length: int = Field(default=16, ge=8, le=128)
    use_upper: bool = True
    use_lower: bool = True
    use_digits: bool = True
    use_symbols: bool = True
    exclude_ambiguous: bool = False


class GeneratePasswordResponse(BaseModel):
    password: str
    strength_score: int  # 0 (weakest) – 4 (strongest)
    crack_time_display: str


class GenerateBackupCodesRequest(BaseModel):
    count: int = Field(default=10, ge=1, le=20)


class GenerateBackupCodesResponse(BaseModel):
    codes: list[str]


@api_router.post("/passwords/generate", response_model=GeneratePasswordResponse, tags=["passwords"])
def create_password(req: GeneratePasswordRequest) -> GeneratePasswordResponse:
    try:
        password = generate_password(
            length=req.length,
            use_upper=req.use_upper,
            use_lower=req.use_lower,
            use_digits=req.use_digits,
            use_symbols=req.use_symbols,
            exclude_ambiguous=req.exclude_ambiguous,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    strength = zxcvbn(password)
    return GeneratePasswordResponse(
        password=password,
        strength_score=strength["score"],
        crack_time_display=str(
            strength["crack_times_display"]["offline_slow_hashing_1e4_per_second"]
        ),
    )


@api_router.post(
    "/backup-codes/generate", response_model=GenerateBackupCodesResponse, tags=["backup-codes"]
)
def create_backup_codes(req: GenerateBackupCodesRequest) -> GenerateBackupCodesResponse:
    return GenerateBackupCodesResponse(codes=generate_backup_codes(count=req.count))
