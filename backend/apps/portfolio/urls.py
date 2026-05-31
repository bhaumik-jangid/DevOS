from django.urls import path
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SiteConfig
from .views import (
    ProfileView, AcademicListView, AchievementListView,
    SkillListView, ExperienceListView, CertificationListView,
    BlogPostListView, BlogPostDetailView, ContactFormView
)


class SiteConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        configs = SiteConfig.objects.all()
        return Response({c.key: c.value for c in configs})


class SiteConfigUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        for key, value in request.data.items():
            SiteConfig.objects.update_or_create(
                key=key,
                defaults={"value": str(value)}
            )
        return Response({"detail": "Config updated."})


urlpatterns = [
    path("profile/", ProfileView.as_view()),
    path("academic/", AcademicListView.as_view()),
    path("achievements/", AchievementListView.as_view()),
    path("skills/", SkillListView.as_view()),
    path("experience/", ExperienceListView.as_view()),
    path("certifications/", CertificationListView.as_view()),
    path("blog/", BlogPostListView.as_view()),
    path("blog/<slug:slug>/", BlogPostDetailView.as_view()),
    path("contact/", ContactFormView.as_view()),
    path("config/", SiteConfigView.as_view()),
    path("config/update/", SiteConfigUpdateView.as_view()),
]
