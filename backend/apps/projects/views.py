from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Project
from .serializers import ProjectSerializer, ProjectDetailSerializer


class ProjectListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        qs = Project.objects.filter(is_public=True)
        if self.request.query_params.get("featured"):
            qs = qs.filter(is_featured=True)
        return qs


class ProjectDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectDetailSerializer
    queryset = Project.objects.filter(is_public=True)
    lookup_field = "slug"