from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import Project
from .models import HealthCheck, Incident
from .serializers import HealthCheckSerializer, IncidentSerializer
from .services import check_project, run_all_checks


class ProjectStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        data = []

        for project in projects:
            latest = HealthCheck.objects.filter(
                project=project
            ).order_by("-checked_at").first()

            recent = HealthCheck.objects.filter(
                project=project
            ).order_by("-checked_at")[:30]

            total = recent.count()
            healthy_count = sum(1 for c in recent if c.is_healthy)
            uptime = round((healthy_count / total * 100), 1) if total else None

            open_incident = Incident.objects.filter(
                project=project,
                is_resolved=False
            ).first()

            data.append({
                "project_id": project.id,
                "project_name": project.name,
                "project_slug": project.slug,
                "has_health_endpoint": bool(project.health_endpoint),
                "latest_check": HealthCheckSerializer(latest).data if latest else None,
                "uptime_percent": uptime,
                "open_incident": IncidentSerializer(open_incident).data if open_incident else None,
            })

        return Response(data)


class TriggerCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id=None):
        if project_id:
            project = generics.get_object_or_404(Project, id=project_id)
            check = check_project(project)
            if check is None:
                return Response({"detail": "No health endpoint configured"}, status=400)
            return Response(HealthCheckSerializer(check).data)

        results = run_all_checks()
        return Response(results)


class HealthCheckHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = HealthCheckSerializer

    def get_queryset(self):
        return HealthCheck.objects.filter(
            project_id=self.kwargs["project_id"]
        ).order_by("-checked_at")[:50]


class IncidentListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IncidentSerializer

    def get_queryset(self):
        qs = Incident.objects.select_related("project")
        if self.request.query_params.get("open"):
            qs = qs.filter(is_resolved=False)
        return qs


class SSLStatusView(APIView):
    """Returns SSL status for all projects with HTTPS URLs."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .services import check_all_ssl
        results = check_all_ssl()
        return Response(results)
