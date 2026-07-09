from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Project
from .serializers import ProjectSerializer, ProjectDetailSerializer, ProjectWriteSerializer
from rest_framework.response import Response


class ProjectListView(generics.ListCreateAPIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProjectWriteSerializer
        return ProjectSerializer

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            qs = Project.objects.all()
        else:
            qs = Project.objects.filter(is_public=True)
        if self.request.query_params.get("featured"):
            qs = qs.filter(is_featured=True)
        return qs


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProjectWriteSerializer
        return ProjectDetailSerializer

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Project.objects.all()
        return Project.objects.filter(is_public=True)

    def get_object(self):
        queryset = self.get_queryset()
        lookup = self.kwargs.get("id") or self.kwargs.get("slug")
        if str(lookup).isdigit():
            return generics.get_object_or_404(queryset, id=lookup)
        return generics.get_object_or_404(queryset, slug=lookup)


class ProjectAliasRedirectView(generics.GenericAPIView):
    """
    GET /api/v1/projects/alias/<alias>/
    Returns the live_url for a project with the given alias (or slug).
    Used by Vercel middleware to redirect subdomain traffic.
    """
    permission_classes = [AllowAny]

    def get(self, request, alias: str):
        project = (
            Project.objects.filter(alias=alias, is_public=True).first()
            or Project.objects.filter(slug=alias, is_public=True).first()
        )
        if not project:
            return Response({"detail": "Not found"}, status=404)
        if not project.live_url:
            return Response({"detail": "No live URL configured"}, status=404)
        print(f"Redirecting alias '{alias}' to live URL: {project.live_url}")
        return Response({
            "alias": alias,
            "project": project.name,
            "live_url": project.live_url,
        })
