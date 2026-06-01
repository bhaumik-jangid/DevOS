import logging
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit

from .models import (
    Profile, Academic, Achievement, Skill,
    Experience, Certification, BlogPost, ContactSubmission
)
from .serializers import (
    ProfileSerializer, AcademicSerializer, AchievementSerializer,
    SkillSerializer, ExperienceSerializer, CertificationSerializer,
    BlogPostSerializer, BlogPostDetailSerializer
)

logger = logging.getLogger(__name__)


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

        # Capture metadata
        ip = (
            request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
            or request.META.get("REMOTE_ADDR", "")
        )
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]
        referrer = request.META.get("HTTP_REFERER", "")[:500]

        # Save to database
        submission = ContactSubmission.objects.create(
            name=name,
            email=email,
            phone=phone,
            message=message,
            ip_address=ip or None,
            user_agent=user_agent,
            referrer=referrer,
        )

        # Send Telegram alert
        from apps.alerts.services import alert_contact_form
        alert = alert_contact_form(
            name=name,
            email=email,
            message_body=message,
            phone=phone,
        )

        submission.telegram_sent = alert.status == "sent"
        submission.save(update_fields=["telegram_sent"])

        if not submission.telegram_sent:
            logger.error(f"Telegram alert failed for contact submission {submission.id}")

        return Response(
            {"detail": "Message sent. I will get back to you soon."},
            status=status.HTTP_200_OK
        )
