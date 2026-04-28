import pytest

from app.services.password_generator import generate_backup_codes, generate_password


def test_default_password_length():
    assert len(generate_password()) == 16


def test_custom_length():
    assert len(generate_password(length=32)) == 32


def test_contains_all_enabled_character_classes():
    password = generate_password(length=8)
    assert any(c.isupper() for c in password)
    assert any(c.islower() for c in password)
    assert any(c.isdigit() for c in password)
    assert any(not c.isalnum() for c in password)


def test_digits_only():
    password = generate_password(length=12, use_upper=False, use_lower=False, use_symbols=False)
    assert password.isdigit()


def test_exclude_ambiguous():
    password = generate_password(length=64, exclude_ambiguous=True)
    assert not set(password) & set("Il1O0o")


def test_no_character_sets_raises():
    with pytest.raises(ValueError):
        generate_password(use_upper=False, use_lower=False, use_digits=False, use_symbols=False)


def test_passwords_are_unique():
    assert len({generate_password() for _ in range(50)}) == 50


def test_backup_codes_format_and_count():
    codes = generate_backup_codes(count=5)
    assert len(codes) == 5
    for code in codes:
        left, right = code.split("-")
        assert len(left) == 4 and len(right) == 4
