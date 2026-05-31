from django.db import models


class PageView(models.Model):
    path = models.CharField(max_length=200)
    referrer = models.CharField(max_length=500, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    country = models.CharField(max_length=100, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-viewed_at"]
        indexes = [
            models.Index(fields=["path", "-viewed_at"]),
        ]

    def __str__(self):
        return f"{self.path} — {self.viewed_at}"


class DailyStat(models.Model):
    date = models.DateField(unique=True)
    total_views = models.IntegerField(default=0)
    unique_paths = models.IntegerField(default=0)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.date} — {self.total_views} views"
