from django.urls import path
from .views import (
    ProfileView, AcademicListView, AchievementListView,
    SkillListView, ExperienceListView, CertificationListView,
    BlogPostListView, BlogPostDetailView,
    BlogPostAdminView, BlogPostAdminDetailView,
    ContactFormView, ContactSubmissionListView
)

urlpatterns = [
    path("profile/", ProfileView.as_view()),
    path("academic/", AcademicListView.as_view()),
    path("achievements/", AchievementListView.as_view()),
    path("skills/", SkillListView.as_view()),
    path("experience/", ExperienceListView.as_view()),
    path("certifications/", CertificationListView.as_view()),
    # Public blog — read only
    path("blog/", BlogPostListView.as_view()),
    path("blog/<slug:slug>/", BlogPostDetailView.as_view()),
    # Admin blog — full CRUD by ID
    path("blog/admin/", BlogPostAdminView.as_view()),
    path("blog/<int:pk>/", BlogPostAdminDetailView.as_view()),
    path("contact/", ContactFormView.as_view()),
    path("contact/submissions/", ContactSubmissionListView.as_view()),
]
