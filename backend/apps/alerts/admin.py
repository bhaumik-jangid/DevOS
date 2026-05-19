from django.contrib import admin
from .models import Alert


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ["subject", "alert_type", "channel", "status", "created_at"]
    list_filter = ["alert_type", "channel", "status"]
    readonly_fields = ["created_at", "sent_at"]
