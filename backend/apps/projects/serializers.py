from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id", "name", "slug", "description", "stack_tags",
            "github_url", "live_url", "alias", "cover_image", "status",
            "hosting_provider", "is_featured", "is_public", "order",
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class ProjectWriteSerializer(serializers.ModelSerializer):
    """Used for create and update operations from the dashboard."""

    class Meta:
        model = Project
        fields = [
            "name", "slug", "description", "long_description",
            "stack_tags", "github_url", "live_url", "alias", "status",
            "hosting_provider", "frontend_url", "backend_url",
            "health_endpoint", "deployment_type", "docker_enabled",
            "ci_cd_enabled", "notes", "is_featured", "is_public", "order",
        ]

    def validate_slug(self, value):
        instance = self.instance
        if Project.objects.filter(slug=value).exclude(
            pk=instance.pk if instance else None
        ).exists():
            raise serializers.ValidationError("A project with this slug already exists.")
        return value

    def validate_stack_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Stack tags must be a list.")
        return [str(tag).strip() for tag in value if str(tag).strip()]
