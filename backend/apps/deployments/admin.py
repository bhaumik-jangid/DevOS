from django.contrib import admin
from .models import Deployment


@admin.register(Deployment)
class DeploymentAdmin(admin.ModelAdmin):
    list_display = ["project", "status", "source", "branch", "started_at", "duration_seconds"]
    list_filter = ["status", "source", "environment"]
    readonly_fields = ["started_at", "finished_at"]
