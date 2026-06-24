from __future__ import annotations

import secrets
import string
from django.db import models
from django.utils import timezone


def generate_code() -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(6))


class ShortLink(models.Model):
    code = models.CharField(max_length=20, unique=True, default=generate_code)
    original_url = models.URLField(max_length=2000)
    title = models.CharField(max_length=200, blank=True)
    description = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    click_count = models.IntegerField(default=0)
    last_clicked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.code} → {self.original_url[:60]}"

    @property
    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at

    @property
    def short_path(self) -> str:
        return f"/s/{self.code}"


class LinkClick(models.Model):
    link = models.ForeignKey(
        ShortLink, on_delete=models.CASCADE, related_name="clicks"
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    country = models.CharField(max_length=100, blank=True)
    clicked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-clicked_at"]

    def __str__(self) -> str:
        return f"{self.link.code} click at {self.clicked_at}"
