import pytest

from app.core.crypto import EncryptionError, decrypt, encrypt


def test_round_trip():
    assert decrypt(encrypt("Hello123!")) == "Hello123!"


def test_empty_string_round_trip():
    assert decrypt(encrypt("")) == ""


def test_ciphertext_differs_from_plaintext():
    assert encrypt("secret") != "secret"


def test_same_plaintext_gives_different_tokens():
    # Fernet includes a random IV — identical inputs must not produce identical ciphertext
    assert encrypt("secret") != encrypt("secret")


def test_tampered_token_raises():
    token = encrypt("secret")
    with pytest.raises(EncryptionError):
        decrypt(token[:-4] + "AAAA")
