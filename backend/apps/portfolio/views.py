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
        alert_contact_form(name=name, email=email,
                           message_body=message, phone=phone)

        return Response(
            {"detail": "Message sent. I will get back to you soon."},
            status=status.HTTP_200_OK
        )
