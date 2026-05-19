from rest_framework import serializers
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Alert
        fields = [
            "id", "channel", "alert_type", "status",
            "subject", "message", "project_name",
            "sent_at", "created_at", "error_message",
        ]
