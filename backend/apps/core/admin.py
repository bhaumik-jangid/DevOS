from django.contrib import admin
from .models import PageView, DailyStat, SiteConfig


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ["path", "ip_address", "timestamp"]
    list_filter = ["path"]
    readonly_fields = ["timestamp"]


@admin.register(DailyStat)
class DailyStatAdmin(admin.ModelAdmin):
    list_display = ["date", "page_views", "unique_visitors"]


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    pass
