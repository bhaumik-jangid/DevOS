from rest_framework import serializers
from .models import (
    Profile, Academic, Achievement, Skill,
    Experience, Certification, BlogPost
)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        exclude = ["updated_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        media_fields = [
            "photo_primary",
            "photo_secondary",
            "resume",
        ]

        for field_name in media_fields:
            field = getattr(instance, field_name)

            if not field:
                data[field_name] = None
                continue

            value = str(field)

            # External URL already stored in DB
            if value.startswith(("http://", "https://")):
                data[field_name] = value
            else:
                # Normal Django media file
                try:
                    data[field_name] = field.url
                except ValueError:
                    data[field_name] = value

        return data


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
    reading_time_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "cover_image",
            "tags", "category", "published_at", "reading_time_minutes",
            "view_count", "featured"
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    reading_time_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = BlogPost
        fields = "__all__"
