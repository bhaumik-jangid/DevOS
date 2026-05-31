from django.contrib import admin
from .models import PageView, DailyStat


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ["path", "country", "viewed_at"]
    list_filter = ["path"]
    readonly_fields = ["viewed_at"]


@admin.register(DailyStat)
class DailyStatAdmin(admin.ModelAdmin):
    list_display = ["date", "total_views", "unique_paths"]
