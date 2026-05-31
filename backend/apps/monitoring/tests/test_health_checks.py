import pytest
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.projects.models import Project
from apps.monitoring.models import Incident
from apps.monitoring.services import check_project

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_superuser(
        email="admin@devos.dev",
        username="admin",
        password="adminpass123"
    )


@pytest.fixture
def auth_client(client, user):
    res = client.post("/api/v1/auth/login/", {
        "email": "admin@devos.dev",
        "password": "adminpass123"
    }, format="json")
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
    return client


@pytest.fixture
def project(db):
    return Project.objects.create(
        name="Test Project",
        slug="test-project",
        description="Test",
        health_endpoint="http://example.com/health/",
        is_public=True,
    )


class TestCheckProject:
    def test_healthy_response_recorded(self, project):
        mock_response = MagicMock()
        mock_response.status_code = 200
        with patch("requests.get", return_value=mock_response):
            check = check_project(project)
        assert check is not None
        assert check.is_healthy is True
        assert check.status == "healthy"
        assert check.status_code == 200

    def test_unhealthy_response_recorded(self, project):
        mock_response = MagicMock()
        mock_response.status_code = 500
        with patch("requests.get", return_value=mock_response):
            with patch("apps.alerts.services.send_telegram", return_value=True):
                check = check_project(project)
        assert check.is_healthy is False
        assert check.status == "unhealthy"

    def test_timeout_recorded(self, project):
        import requests
        with patch("requests.get", side_effect=requests.Timeout()):
            with patch("apps.alerts.services.send_telegram", return_value=True):
                check = check_project(project)
        assert check.status == "timeout"
        assert check.is_healthy is False

    def test_no_endpoint_returns_none(self, db):
        project = Project.objects.create(
            name="No Endpoint",
            slug="no-endpoint",
            description="Test",
            health_endpoint="",
        )
        result = check_project(project)
        assert result is None

    def test_incident_opened_on_failure(self, project):
        mock_response = MagicMock()
        mock_response.status_code = 503
        with patch("requests.get", return_value=mock_response):
            with patch("apps.alerts.services.send_telegram", return_value=True):
                check_project(project)
        assert Incident.objects.filter(project=project, is_resolved=False).exists()

    def test_incident_resolved_on_recovery(self, project):
        Incident.objects.create(
            project=project,
            severity="medium",
            description="Test incident",
        )
        mock_response = MagicMock()
        mock_response.status_code = 200
        with patch("requests.get", return_value=mock_response):
            with patch("apps.alerts.services.send_telegram", return_value=True):
                check_project(project)
        incident = Incident.objects.get(project=project)
        assert incident.is_resolved is True


class TestMonitoringAPI:
    def test_status_requires_auth(self, client):
        res = client.get("/api/v1/monitoring/status/")
        assert res.status_code == 401

    def test_status_returns_project_list(self, auth_client, project):
        res = auth_client.get("/api/v1/monitoring/status/")
        assert res.status_code == 200
        assert isinstance(res.data, list)
