"""Shared test fixtures.

ENCRYPTION_KEYS is set *before* the app is imported so the cached settings
and Fernet instances are built with the test key — tests never depend on a
developer's local .env.
"""

import os

import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient

os.environ["ENCRYPTION_KEYS"] = Fernet.generate_key().decode()
os.environ["STORAGE_BACKEND"] = "memory"

from app.core.config import get_settings

get_settings.cache_clear()

from app.core.auth import get_current_user_id
from app.main import app
from app.repositories.sites import _memory_repo

TEST_USER_ID = "00000000-0000-0000-0000-000000000001"


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user_id] = lambda: TEST_USER_ID
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_id():
    return TEST_USER_ID


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_store():
    """Each test starts with an empty vault — no cross-test contamination."""
    _memory_repo.clear()
    yield
    _memory_repo.clear()
