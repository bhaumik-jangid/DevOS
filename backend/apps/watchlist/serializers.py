from rest_framework import serializers
from .models import WatchItem, WatchNote


class WatchNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WatchNote
        fields = ["id", "season", "episode", "content", "rating", "created_at"]
        read_only_fields = ["id", "created_at"]


class WatchItemSerializer(serializers.ModelSerializer):
    progress_percent = serializers.FloatField(read_only=True, allow_null=True)

    class Meta:
        model = WatchItem
        fields = [
            "id", "title", "media_type", "platform", "status",
            "total_seasons", "watched_seasons",
            "total_episodes", "watched_episodes",
            "personal_rating", "notes", "genres", "tags",
            "started_watching", "finished_watching",
            "added_at", "updated_at",
            "tmdb_id", "poster_url", "release_year",
            "country", "language",
            "notify_new_season", "last_notified_season",
            "progress_percent",
        ]
        read_only_fields = ["id", "added_at", "updated_at"]


class WatchItemListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    progress_percent = serializers.FloatField(read_only=True, allow_null=True)

    class Meta:
        model = WatchItem
        fields = [
            "id", "title", "media_type", "platform", "status",
            "watched_seasons", "total_seasons",
            "watched_episodes", "total_episodes",
            "personal_rating", "genres", "tags",
            "poster_url", "release_year",
            "started_watching", "finished_watching",
            "notify_new_season", "progress_percent",
            "added_at", "updated_at",
        ]
