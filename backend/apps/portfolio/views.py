from rest_framework import generics
from rest_framework.permissions import AllowAny
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