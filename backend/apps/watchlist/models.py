from __future__ import annotations

from django.db import models


class WatchItem(models.Model):
    """A movie or TV series in the watchlist."""

    MEDIA_TYPE_CHOICES = [
        ("movie", "Movie"),
        ("series", "TV Series"),
        ("anime", "Anime"),
        ("documentary", "Documentary"),
    ]

    STATUS_CHOICES = [
        ("watching", "Watching"),
        ("completed", "Completed"),
        ("dropped", "Dropped"),
        ("plan_to_watch", "Plan to Watch"),
        ("on_hold", "On Hold"),
    ]

    PLATFORM_CHOICES = [
        ("netflix", "Netflix"),
        ("prime", "Amazon Prime"),
        ("hotstar", "Disney+ Hotstar"),
        ("jiocinema", "JioCinema"),
        ("youtube", "YouTube"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=300)
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES, default="series")
    platform = models.CharField(max_length=30, choices=PLATFORM_CHOICES, default="other")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="plan_to_watch")

    # Season/episode tracking for series
    total_seasons = models.IntegerField(null=True, blank=True)
    watched_seasons = models.IntegerField(default=0)
    total_episodes = models.IntegerField(null=True, blank=True)
    watched_episodes = models.IntegerField(default=0)

    # Ratings and notes
    personal_rating = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True,
        help_text="Personal rating out of 10"
    )
    notes = models.TextField(blank=True)
    genres = models.JSONField(default=list, help_text="List of genre strings")
    tags = models.JSONField(default=list, help_text="Custom tags")

    # Dates
    started_watching = models.DateField(null=True, blank=True)
    finished_watching = models.DateField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # External metadata
    tmdb_id = models.IntegerField(null=True, blank=True, help_text="TMDB ID for metadata fetch")
    poster_url = models.URLField(max_length=500, blank=True)
    release_year = models.IntegerField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=100, blank=True)

    # AI features
    notify_new_season = models.BooleanField(
        default=True,
        help_text="Get notified when a new season releases"
    )
    last_notified_season = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"{self.title} ({self.get_media_type_display()})"

    @property
    def progress_percent(self) -> float | None:
        if self.total_episodes and self.total_episodes > 0:
            return round(self.watched_episodes / self.total_episodes * 100, 1)
        if self.total_seasons and self.total_seasons > 0:
            return round(self.watched_seasons / self.total_seasons * 100, 1)
        return None


class WatchNote(models.Model):
    """Episode or season-level notes."""
    item = models.ForeignKey(WatchItem, on_delete=models.CASCADE, related_name="watch_notes")
    season = models.IntegerField(null=True, blank=True)
    episode = models.IntegerField(null=True, blank=True)
    content = models.TextField()
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.item.title} S{self.season}E{self.episode} note"
