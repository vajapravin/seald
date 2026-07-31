"""Cryptographically secure password & backup-code generation.

Uses Python's built-in `secrets` module (CSPRNG) — the recommended way to
generate passwords/tokens in Python.
"""

import secrets
import string

AMBIGUOUS = set("Il1O0o")


def generate_password(
    length: int = 16,
    use_upper: bool = True,
    use_lower: bool = True,
    use_digits: bool = True,
    use_symbols: bool = True,
    exclude_ambiguous: bool = False,
) -> str:
    pools: list[str] = []
    if use_upper:
        pools.append(string.ascii_uppercase)
    if use_lower:
        pools.append(string.ascii_lowercase)
    if use_digits:
        pools.append(string.digits)
    if use_symbols:
        pools.append("!@#$%^&*()-_=+[]{};:,.<>?")

    if not pools:
        raise ValueError("At least one character set must be enabled")
    if length < len(pools):
        raise ValueError(f"Length must be >= {len(pools)} for the selected character sets")

    if exclude_ambiguous:
        pools = ["".join(c for c in pool if c not in AMBIGUOUS) for pool in pools]

    # Guarantee at least one character from each selected pool
    chars = [secrets.choice(pool) for pool in pools]
    all_chars = "".join(pools)
    chars += [secrets.choice(all_chars) for _ in range(length - len(chars))]

    # Shuffle securely
    for i in range(len(chars) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        chars[i], chars[j] = chars[j], chars[i]

    return "".join(chars)


def generate_backup_codes(count: int = 10, group_size: int = 4, groups: int = 2) -> list[str]:
    """Generate 2FA-style backup codes, e.g. 'A3F9-K2M7'."""
    alphabet = "".join(c for c in string.ascii_uppercase + string.digits if c not in AMBIGUOUS)
    codes = []
    for _ in range(count):
        parts = [
            "".join(secrets.choice(alphabet) for _ in range(group_size)) for _ in range(groups)
        ]
        codes.append("-".join(parts))
    return codes
