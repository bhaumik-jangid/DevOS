from django.urls import path
from .views import (
    ProfileUpdateView,
    SkillAdminView, SkillAdminDetailView,
    ExperienceAdminView, ExperienceAdminDetailView,
    ProfilePhotoUploadView,
    SiteConfigView,
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
    path("contact/submissions/<int:pk>/", ContactSubmissionListView.as_view()),
    path("config/", SiteConfigView.as_view()),
    path("config/update/", SiteConfigView.as_view()),
    path("skills/admin/", SkillAdminView.as_view()),
    path("skills/admin/<int:pk>/", SkillAdminDetailView.as_view()),
    path("experience/admin/", ExperienceAdminView.as_view()),
    path("experience/admin/<int:pk>/", ExperienceAdminDetailView.as_view()),
    path("profile/photo/", ProfilePhotoUploadView.as_view()),
    path("profile/update/", ProfileUpdateView.as_view()),
]
