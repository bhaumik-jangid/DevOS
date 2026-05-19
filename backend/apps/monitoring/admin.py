from django.contrib import admin
from .models import HealthCheck, Incident


@admin.register(HealthCheck)
class HealthCheckAdmin(admin.ModelAdmin):
    list_display = ["project", "status", "status_code", "latency_ms", "checked_at"]
    list_filter = ["status", "is_healthy"]
    readonly_fields = ["checked_at"]


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ["project", "severity", "started_at", "is_resolved", "resolved_at"]
    list_filter = ["severity", "is_resolved"]
