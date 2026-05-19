from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Project
from .serializers import ProjectSerializer, ProjectDetailSerializer, ProjectWriteSerializer


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
