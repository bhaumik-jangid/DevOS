from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Profile, Academic, Achievement, Skill,
    Experience, Certification, BlogPost
)
from .serializers import (
    ProfileSerializer, AcademicSerializer, AchievementSerializer,
    SkillSerializer, ExperienceSerializer, CertificationSerializer,
    BlogPostSerializer, BlogPostDetailSerializer
)


class ProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        profile = Profile.objects.first()
        if not profile:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProfileSerializer(profile).data)


class AcademicListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AcademicSerializer
    queryset = Academic.objects.all()


class AchievementListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AchievementSerializer
    queryset = Achievement.objects.filter(is_visible=True)


class SkillListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SkillSerializer
    queryset = Skill.objects.filter(is_visible=True)


class ExperienceListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ExperienceSerializer
    queryset = Experience.objects.filter(is_visible=True)


class CertificationListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CertificationSerializer
    queryset = Certification.objects.filter(is_visible=True)


class BlogPostListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = BlogPostSerializer
    queryset = BlogPost.objects.filter(is_published=True)


class BlogPostDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = BlogPostDetailSerializer
    queryset = BlogPost.objects.filter(is_published=True)
    lookup_field = "slug"


class ContactFormView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key="ip", rate="5/h", method="POST", block=True))
    def post(self, request):
        name = request.data.get("name", "").strip()
        email = request.data.get("email", "").strip()
        message = request.data.get("message", "").strip()
        phone = request.data.get("phone", "").strip()

        errors = {}
        if not name:
            errors["name"] = "Name is required."
        if not email:
            errors["email"] = "Email is required."
        if not message:
            errors["message"] = "Message is required."
        elif len(message) < 10:
            errors["message"] = "Message must be at least 10 characters."
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        from apps.alerts.services import alert_contact_form
        alert = alert_contact_form(
            name=name, email=email,
            message_body=message, phone=phone
        )

        if alert.status == "failed":
            import logging
            logging.getLogger(__name__).error(
                f"Contact form alert failed for {email}: {alert.error_message}"
            )

        return Response(
            {"detail": "Message sent. I will get back to you soon."},
            status=status.HTTP_200_OK
        )
