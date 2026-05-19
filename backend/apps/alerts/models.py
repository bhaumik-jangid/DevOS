from django.db import models


class Alert(models.Model):
    CHANNEL_CHOICES = [
        ("telegram", "Telegram"),
        ("email", "Email"),
    ]

    TYPE_CHOICES = [
        ("downtime", "Downtime"),
        ("recovery", "Recovery"),
        ("deployment_failure", "Deployment Failure"),
        ("contact_form", "Contact Form"),
        ("incident", "Incident"),
        ("custom", "Custom"),
    ]

    STATUS_CHOICES = [
        ("sent", "Sent"),
        ("failed", "Failed"),
        ("pending", "Pending"),
    ]

    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default="telegram")
    alert_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    subject = models.CharField(max_length=200)
    message = models.TextField()
    error_message = models.TextField(blank=True)
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="alerts"
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.alert_type} — {self.subject}"
