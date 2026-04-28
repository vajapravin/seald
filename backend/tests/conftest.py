"""Shared test fixtures.

ENCRYPTION_KEYS is set *before* the app is imported so the cached settings
and Fernet instances are built with the test key — tests never depend on a
developer's local .env.
"""
import os

from cryptography.fernet import Fernet

os.environ["ENCRYPTION_KEYS"] = Fernet.generate_key().decode()

import pytest
from fastapi.testclient import TestClient

from app.api.v1 import sites
from app.main import app


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_store():
    """Each test starts with an empty vault — no cross-test contamination."""
    sites._SITES.clear()
    yield
    sites._SITES.clear()
