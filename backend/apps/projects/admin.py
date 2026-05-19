from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "status", "is_featured", "is_public", "order"]
    prepopulated_fields = {"slug": ["name"]}