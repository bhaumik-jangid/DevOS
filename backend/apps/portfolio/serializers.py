from rest_framework import serializers
from .models import (
    Profile, Academic, Achievement, Skill,
    Experience, Certification, BlogPost
)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        exclude = ["updated_at"]


class AcademicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Academic
        fields = "__all__"


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = "__all__"


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "icon_name", "proficiency", "order"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            "id", "company", "role", "location", "description",
            "start_date", "end_date", "is_current", "order"
        ]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            "id", "name", "issuer", "issue_date",
            "expiry_date", "credential_url", "image", "order"
        ]


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt",
            "cover_image", "tags", "published_at"
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = "__all__"
