import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username="admin",
        email="admin@devos.dev",
        password="testpass123"
    )