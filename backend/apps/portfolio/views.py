import logging
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Profile, Academic, Achievement, Skill,
    Experience, Certification, BlogPost, ContactSubmission
)
from .serializers import (
    ProfileSerializer, AcademicSerializer, AchievementSerializer,
    SkillSerializer, ExperienceSerializer, CertificationSerializer,
    BlogPostSerializer, BlogPostDetailSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser
from apps.alerts.services import alert_contact_form


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

    def get_queryset(self):
        qs = BlogPost.objects.filter(is_published=True)
        tag = self.request.query_params.get("tag")
        category = self.request.query_params.get("category")
        featured = self.request.query_params.get("featured")
        if tag:
            qs = qs.filter(tags__contains=[tag])
        if category:
            qs = qs.filter(category__iexact=category)
        if featured:
            qs = qs.filter(featured=True)
        return qs


class BlogPostDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = BlogPostDetailSerializer
    queryset = BlogPost.objects.filter(is_published=True)
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        BlogPost.objects.filter(pk=instance.pk).update(
            view_count=instance.view_count + 1
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BlogPostAdminView(generics.ListCreateAPIView):
    """Admin — list all posts including drafts, create new posts."""
    permission_classes = [IsAuthenticated]
    serializer_class = BlogPostDetailSerializer
    queryset = BlogPost.objects.all()


class BlogPostAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin — retrieve, update, delete individual post by ID."""
    permission_classes = [IsAuthenticated]
    serializer_class = BlogPostDetailSerializer

    def get_queryset(self):
        return BlogPost.objects.all()

    def get_object(self):
        queryset = self.get_queryset()
        pk = self.kwargs.get("pk")
        return generics.get_object_or_404(queryset, pk=pk)


class ContactFormView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key="ip", rate="5/h", method="POST", block=True))
    def post(self, request):
        name = request.data.get("name", "").strip()
        email = request.data.get("email", "").strip()
        message = request.data.get("message", "").strip()
        phone = request.data.get("phone", "").strip()
        page = request.data.get("page", "/").strip()
        referrer = request.data.get("referrer", "").strip()

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

        ip = (
            request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
            or request.META.get("REMOTE_ADDR", "")
        )
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

        submission = ContactSubmission.objects.create(
            name=name,
            email=email,
            phone=phone,
            message=message,
            ip_address=ip or None,
            user_agent=user_agent,
            referrer=referrer[:500],
            page=page[:200],
        )

        alert = alert_contact_form(
            name=name,
            email=email,
            message_body=message,
            phone=phone,
        )

        submission.telegram_sent = alert.status == "sent"
        submission.save(update_fields=["telegram_sent"])

        if alert.status == "failed":
            logger.error("Contact form Telegram alert failed for %s", email)

        return Response(
            {"detail": "Message sent. I will get back to you soon."},
            status=status.HTTP_200_OK
        )


class ContactSubmissionListView(APIView):
    """Admin only — view all contact submissions."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        submissions = ContactSubmission.objects.all()
        data = [
            {
                "id": s.id,
                "name": s.name,
                "email": s.email,
                "phone": s.phone,
                "message": s.message,
                "page": s.page,
                "ip_address": str(s.ip_address) if s.ip_address else None,
                "submitted_at": s.submitted_at.isoformat(),
                "is_read": s.is_read,
                "telegram_sent": s.telegram_sent,
            }
            for s in submissions
        ]
        return Response(data)


class SiteConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        profile = Profile.objects.first()
        if not profile:
            return Response({})
        return Response({
            "name": profile.name,
            "tagline": profile.tagline,
            "github_url": profile.github_url,
            "linkedin_url": profile.linkedin_url,
            "twitter_url": profile.twitter_url,
            "email": profile.email,
            "phone": profile.phone,
            "leetcode_username": profile.leetcode_username,
            "available_for_work": profile.available_for_work,
            "location": profile.location,
        })

    def _update_profile(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=401)
        profile = Profile.objects.first()
        if not profile:
            return Response({"detail": "No profile found"}, status=404)
        allowed = [
            "name", "tagline", "bio", "email", "phone",
            "github_url", "linkedin_url", "available_for_work", "location"
        ]
        for field in allowed:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()
        return Response(ProfileSerializer(profile).data)

    def patch(self, request):
        return self._update_profile(request)

    def post(self, request):
        return self._update_profile(request)


class ProfilePhotoUploadView(APIView):
    """POST /api/v1/portfolio/profile/photo/ — upload photo to Cloudinary."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = Profile.objects.first()
        if not profile:
            return Response({"detail": "No profile found"}, status=404)

        photo = request.FILES.get("photo")
        if not photo:
            return Response({"detail": "No photo file provided"}, status=400)

        profile.photo_primary = photo
        profile.save()

        return Response({
            "photo_primary": profile.photo_primary.url if profile.photo_primary else None,
            "detail": "Photo updated successfully"
        })


class SkillAdminView(generics.ListCreateAPIView):
    """Admin — full CRUD for skills."""
    permission_classes = [IsAuthenticated]
    serializer_class = SkillSerializer
    queryset = Skill.objects.all().order_by("category", "order", "name")


class SkillAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin — edit/delete individual skill."""
    permission_classes = [IsAuthenticated]
    serializer_class = SkillSerializer
    queryset = Skill.objects.all()


class ExperienceAdminView(generics.ListCreateAPIView):
    """Admin — full CRUD for experience."""
    permission_classes = [IsAuthenticated]
    serializer_class = ExperienceSerializer
    queryset = Experience.objects.all().order_by("-start_date")


class ExperienceAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin — edit/delete individual experience."""
    permission_classes = [IsAuthenticated]
    serializer_class = ExperienceSerializer
    queryset = Experience.objects.all()


class ProfileUpdateView(APIView):
    """PATCH /api/v1/portfolio/profile/update/ — update profile fields."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile = Profile.objects.first()
        if not profile:
            return Response({"detail": "No profile found"}, status=404)

        allowed_fields = [
            "name", "tagline", "bio", "email", "phone",
            "github_url", "linkedin_url", "twitter_url",
            "location", "available_for_work",
            "video_tooltips", "hero_video"
        ]

        for field in allowed_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])

        profile.save()
        return Response(ProfileSerializer(profile).data)
