import pytest
from unittest.mock import patch
from rest_framework.test import APIClient


@pytest.fixture
def client():
    return APIClient()


class TestContactForm:
    def test_valid_submission_accepted(self, client, db):
        with patch("apps.alerts.services.send_telegram", return_value=True):
            res = client.post("/api/v1/portfolio/contact/", {
                "name": "John Doe",
                "email": "john@example.com",
                "message": "This is a test message with enough length."
            }, format="json")
        assert res.status_code == 200

    def test_missing_name_rejected(self, client, db):
        res = client.post("/api/v1/portfolio/contact/", {
            "email": "john@example.com",
            "message": "Test message here."
        }, format="json")
        assert res.status_code == 400
        assert "name" in res.data

    def test_missing_email_rejected(self, client, db):
        res = client.post("/api/v1/portfolio/contact/", {
            "name": "John",
            "message": "Test message here."
        }, format="json")
        assert res.status_code == 400

    def test_short_message_rejected(self, client, db):
        res = client.post("/api/v1/portfolio/contact/", {
            "name": "John",
            "email": "john@example.com",
            "message": "Hi"
        }, format="json")
        assert res.status_code == 400
        assert "message" in res.data
