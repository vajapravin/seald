"""Shared test fixtures.

ENCRYPTION_KEYS is set *before* the app is imported so the cached settings
and Fernet instances are built with the test key — tests never depend on a
developer's local .env.
"""

import os

from cryptography.fernet import Fernet

os.environ["ENCRYPTION_KEYS"] = Fernet.generate_key().decode()
os.environ["STORAGE_BACKEND"] = "memory"

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.sites import _memory_repo


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_store():
    """Each test starts with an empty vault — no cross-test contamination."""
    _memory_repo.clear()
    yield
    _memory_repo.clear()
