from rest_framework import serializers
from .models import HealthCheck, Incident


class HealthCheckSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    project_slug = serializers.CharField(source="project.slug", read_only=True)

    class Meta:
        model = HealthCheck
        fields = [
            "id", "project", "project_name", "project_slug",
            "checked_at", "status", "status_code",
            "latency_ms", "is_healthy", "error_message",
        ]


class IncidentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Incident
        fields = [
            "id", "project", "project_name", "started_at",
            "resolved_at", "severity", "description",
            "is_resolved", "duration_minutes",
        ]
