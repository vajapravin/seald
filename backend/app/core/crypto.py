"""Symmetric encryption for vault secrets (encryption at rest).

Uses Fernet (AES-CBC + HMAC, authenticated). MultiFernet supports key
rotation: ENCRYPTION_KEYS holds a comma-separated list where the first key
encrypts new data and every key is tried for decryption.
"""

from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken, MultiFernet

from app.core.config import get_settings


class EncryptionError(Exception):
    """Raised when a stored value cannot be decrypted (wrong/missing key)."""


@lru_cache
def _fernet() -> MultiFernet:
    settings = get_settings()
    keys = [k.strip() for k in settings.ENCRYPTION_KEYS.split(",") if k.strip()]
    if not keys:
        raise RuntimeError(
            "ENCRYPTION_KEYS is not set. Generate one with: "
            'python -c "from cryptography.fernet import Fernet; '
            'print(Fernet.generate_key().decode())"'
        )
    return MultiFernet([Fernet(k.encode()) for k in keys])


def encrypt(plaintext: str) -> str:
    """Encrypt a string, returning a URL-safe token for storage."""
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt(token: str) -> str:
    """Decrypt a stored token back to the original string."""
    try:
        return _fernet().decrypt(token.encode()).decode()
    except InvalidToken as exc:
        raise EncryptionError(
            "Stored secret could not be decrypted — check ENCRYPTION_KEYS"
        ) from exc
