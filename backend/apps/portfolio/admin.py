from django.contrib import admin
from .models import Skill, Experience, Certification, BlogPost

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "proficiency", "order", "is_visible"]

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ["role", "company", "start_date", "is_current", "is_visible"]

@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ["name", "issuer", "issue_date", "is_visible"]

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ["title", "is_published", "published_at"]
    prepopulated_fields = {"slug": ["title"]}