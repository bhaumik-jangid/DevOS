from django.db import models
from apps.projects.models import Project


class Deployment(models.Model):
    STATUS_CHOICES = [
        ("success", "Success"),
        ("failed", "Failed"),
        ("in_progress", "In Progress"),
        ("cancelled", "Cancelled"),
        ("rolled_back", "Rolled Back"),
    ]

    SOURCE_CHOICES = [
        ("github_actions", "GitHub Actions"),
        ("render", "Render"),
        ("vercel", "Vercel"),
        ("manual", "Manual"),
        ("webhook", "Webhook"),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="deployments"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="in_progress")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="manual")
    environment = models.CharField(max_length=20, default="production")
    commit_hash = models.CharField(max_length=40, blank=True)
    commit_message = models.TextField(blank=True)
    branch = models.CharField(max_length=100, default="main")
    triggered_by = models.CharField(max_length=100, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    logs = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    deployment_url = models.URLField(blank=True)

    class Meta:
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["project", "-started_at"]),
        ]

    def __str__(self):
        return f"{self.project.name} — {self.status} — {self.started_at}"

    @property
    def duration_display(self):
        if not self.duration_seconds:
            return None
        if self.duration_seconds < 60:
            return f"{self.duration_seconds}s"
        return f"{self.duration_seconds // 60}m {self.duration_seconds % 60}s"
