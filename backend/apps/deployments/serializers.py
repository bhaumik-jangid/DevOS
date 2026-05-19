from rest_framework import serializers
from .models import Deployment


class DeploymentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    duration_display = serializers.CharField(read_only=True)

    class Meta:
        model = Deployment
        fields = [
            "id", "project", "project_name", "status", "source",
            "environment", "commit_hash", "commit_message", "branch",
            "triggered_by", "started_at", "finished_at",
            "duration_seconds", "duration_display", "deployment_url",
            "error_message",
        ]
        read_only_fields = ["started_at"]


class DeploymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deployment
        fields = [
            "project", "status", "source", "environment",
            "commit_hash", "commit_message", "branch",
            "triggered_by", "deployment_url", "logs",
        ]
