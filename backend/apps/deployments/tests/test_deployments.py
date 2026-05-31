import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.projects.models import Project
from apps.deployments.models import Deployment

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
        name="Deploy Test",
        slug="deploy-test",
        description="Test project",
    )


class TestDeployments:
    def test_list_requires_auth(self, client):
        res = client.get("/api/v1/deployments/")
        assert res.status_code == 401

    def test_create_deployment(self, auth_client, project):
        res = auth_client.post("/api/v1/deployments/", {
            "project": project.id,
            "status": "success",
            "source": "manual",
            "branch": "main",
            "commit_hash": "abc1234",
            "commit_message": "test commit",
            "triggered_by": "test"
        }, format="json")
        assert res.status_code == 201
        assert Deployment.objects.filter(project=project).exists()

    def test_stats_endpoint(self, auth_client, project):
        Deployment.objects.create(
            project=project, status="success", source="manual"
        )
        Deployment.objects.create(
            project=project, status="failed", source="manual"
        )
        res = auth_client.get("/api/v1/deployments/stats/")
        assert res.status_code == 200
        assert res.data["total"] >= 2
        assert res.data["by_status"].get("success", 0) >= 1
        assert res.data["by_status"].get("failed", 0) >= 1

    def test_finish_deployment(self, auth_client, project):
        dep = Deployment.objects.create(
            project=project, status="in_progress", source="manual"
        )
        with pytest.MonkeyPatch().context() as m:
            m.setattr("apps.alerts.services.send_telegram", lambda *a, **kw: True)
            res = auth_client.patch(
                f"/api/v1/deployments/{dep.id}/finish/",
                {"status": "success"},
                format="json"
            )
        assert res.status_code == 200
        dep.refresh_from_db()
        assert dep.status == "success"
        assert dep.finished_at is not None
        assert dep.duration_seconds is not None
