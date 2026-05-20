from django.contrib import admin
from .models import (
    Profile, Academic, Achievement, Skill,
    Experience, Certification, BlogPost
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "available_for_work", "updated_at"]


@admin.register(Academic)
class AcademicAdmin(admin.ModelAdmin):
    list_display = ["level", "institution", "percentage_or_cgpa", "start_year", "end_year"]


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ["title", "date", "order", "is_visible"]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "proficiency", "order", "is_visible"]


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ["role", "company", "start_date", "is_current"]


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ["name", "issuer", "issue_date", "is_visible"]


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ["title", "is_published", "published_at"]
    prepopulated_fields = {"slug": ["title"]}
