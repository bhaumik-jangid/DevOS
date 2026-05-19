from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Skill, Experience, Certification, BlogPost
from .serializers import (
    SkillSerializer, ExperienceSerializer,
    CertificationSerializer, BlogPostSerializer, BlogPostDetailSerializer
)


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

    def post(self, request):
        name = request.data.get("name", "").strip()
        email = request.data.get("email", "").strip()
        message = request.data.get("message", "").strip()
        phone = request.data.get("phone", "").strip()

        if not name or not email or not message:
            return Response(
                {"detail": "Name, email, and message are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(message) < 10:
            return Response(
                {"detail": "Message is too short."},
                status=status.HTTP_400_BAD_REQUEST
            )

        from apps.alerts.services import alert_contact_form
        alert = alert_contact_form(
            name=name,
            email=email,
            message_body=message,
            phone=phone,
        )

        if alert.status == "failed":
            # Still return success to the user — don't expose internal failures
            pass

        return Response(
            {"detail": "Message sent successfully. I will get back to you soon."},
            status=status.HTTP_200_OK
        )
