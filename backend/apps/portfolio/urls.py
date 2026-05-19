from django.urls import path
from .views import (
    SkillListView, ExperienceListView,
    CertificationListView, BlogPostListView, BlogPostDetailView
)

urlpatterns = [
    path("skills/", SkillListView.as_view()),
    path("experience/", ExperienceListView.as_view()),
    path("certifications/", CertificationListView.as_view()),
    path("blog/", BlogPostListView.as_view()),
    path("blog/<slug:slug>/", BlogPostDetailView.as_view()),
]