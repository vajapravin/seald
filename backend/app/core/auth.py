"""JWT verification for Supabase-issued tokens (asymmetric ES256 keys).

Supabase signs session JWTs with per-project ECC keys. We verify the
signature against the project's public JWKS (fetched and cached), and
check the audience and issuer.
"""

from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.core.config import get_settings

_bearer = HTTPBearer(auto_error=True)

# Cache the JWKS client across requests (it caches keys internally).
_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        settings = get_settings()
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
) -> str:
    settings = get_settings()
    if not settings.SUPABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth is not configured (missing SUPABASE_URL)",
        )

    token = credentials.credentials
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
            issuer=f"{settings.SUPABASE_URL}/auth/v1",
        )
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired"
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject"
        )
    return user_id
