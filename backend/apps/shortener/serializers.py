from rest_framework import serializers
from .models import ShortLink, LinkClick


class ShortLinkSerializer(serializers.ModelSerializer):
    short_path = serializers.CharField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ShortLink
        fields = [
            "id", "code", "original_url", "title", "description",
            "created_at", "updated_at", "expires_at",
            "is_active", "click_count", "last_clicked_at",
            "short_path", "is_expired"
        ]
        read_only_fields = [
            "id", "click_count", "last_clicked_at",
            "created_at", "updated_at"
        ]


class ShortLinkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortLink
        fields = [
            "code", "original_url", "title",
            "description", "expires_at", "is_active"
        ]

    def validate_code(self, value: str) -> str:
        value = value.strip()
        if not value:
            return value
        if not all(c.isalnum() or c in "-_" for c in value):
            raise serializers.ValidationError(
                "Code can only contain letters, numbers, hyphens, and underscores."
            )
        if len(value) < 2:
            raise serializers.ValidationError("Code must be at least 2 characters.")
        if len(value) > 20:
            raise serializers.ValidationError("Code must be at most 20 characters.")
        # Only check uniqueness on create, not update
        instance = self.instance
        qs = ShortLink.objects.filter(code=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"The code '{value}' is already in use. Choose a different one."
            )
        return value

    def validate_original_url(self, value: str) -> str:
        value = value.strip()
        if not value.startswith(("http://", "https://")):
            raise serializers.ValidationError(
                "URL must start with http:// or https://"
            )
        return value


class ShortLinkUpdateSerializer(serializers.ModelSerializer):
    """Update serializer — code field is read-only after creation."""
    code = serializers.CharField(read_only=True)

    class Meta:
        model = ShortLink
        fields = [
            "code", "original_url", "title",
            "description", "expires_at", "is_active"
        ]

    def validate_original_url(self, value: str) -> str:
        value = value.strip()
        if not value.startswith(("http://", "https://")):
            raise serializers.ValidationError(
                "URL must start with http:// or https://"
            )
        return value
