from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id", "name", "slug", "description", "stack_tags",
            "github_url", "live_url", "cover_image", "status",
            "hosting_provider", "is_featured", "order"
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"