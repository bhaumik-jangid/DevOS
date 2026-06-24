from django.db import models


class PageView(models.Model):
    path = models.CharField(max_length=500)
    referrer = models.CharField(max_length=500, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"{self.path} — {self.timestamp}"


class DailyStat(models.Model):
    date = models.DateField(unique=True)
    page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)

    class Meta:
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"{self.date}: {self.page_views} views"


class SiteConfig(models.Model):
    """
    Singleton model for site-wide configuration.
    Stores microservice toggles and global settings.
    """
    enabled_services = models.JSONField(
        default=list,
        help_text="List of enabled microservice slugs"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Configuration"

    def __str__(self) -> str:
        return "Site Configuration"

    @classmethod
    def get(cls) -> "SiteConfig":
        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                "enabled_services": [
                    "portfolio", "projects", "shortener",
                    "watchlist", "mcp"
                ]
            }
        )
        return obj

    def is_enabled(self, service: str) -> bool:
        return service in self.enabled_services
