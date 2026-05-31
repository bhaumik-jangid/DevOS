import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="test@devos.dev",
        username="testuser",
        password="testpass123"
    )


@pytest.fixture
def auth_client(client, user):
    res = client.post("/api/v1/auth/login/", {
        "email": "test@devos.dev",
        "password": "testpass123"
    }, format="json")
    token = res.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client, res.data["refresh"]


class TestLogin:
    def test_valid_login_returns_tokens(self, client, user):
        res = client.post("/api/v1/auth/login/", {
            "email": "test@devos.dev",
            "password": "testpass123"
        }, format="json")
        assert res.status_code == 200
        assert "access" in res.data
        assert "refresh" in res.data
        assert res.data["user"]["email"] == "test@devos.dev"

    def test_invalid_credentials_rejected(self, client, user):
        res = client.post("/api/v1/auth/login/", {
            "email": "test@devos.dev",
            "password": "wrongpassword"
        }, format="json")
        assert res.status_code == 400

    def test_missing_fields_rejected(self, client):
        res = client.post("/api/v1/auth/login/", {
            "email": "test@devos.dev"
        }, format="json")
        assert res.status_code == 400


class TestMe:
    def test_me_returns_user_data(self, auth_client):
        client, _ = auth_client
        res = client.get("/api/v1/auth/me/")
        assert res.status_code == 200
        assert res.data["email"] == "test@devos.dev"

    def test_me_requires_auth(self, client):
        res = client.get("/api/v1/auth/me/")
        assert res.status_code == 401


class TestLogout:
    def test_logout_blacklists_token(self, auth_client):
        client, refresh = auth_client
        res = client.post("/api/v1/auth/logout/", {
            "refresh": refresh
        }, format="json")
        assert res.status_code == 200

    def test_logout_requires_auth(self, client):
        res = client.post("/api/v1/auth/logout/", {
            "refresh": "fake"
        }, format="json")
        assert res.status_code == 401
