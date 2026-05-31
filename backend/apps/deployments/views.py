from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.alerts.services import send_alert
from .models import Deployment
from .serializers import DeploymentSerializer, DeploymentCreateSerializer


class DeploymentListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DeploymentCreateSerializer
        return DeploymentSerializer

    def get_queryset(self):
        qs = Deployment.objects.select_related("project")
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs[:100]

    def perform_create(self, serializer):
        deployment = serializer.save()
        if deployment.status == "failed":
            send_alert(
                subject=f"Deployment failed: {deployment.project.name}",
                message=(
                    f"🚨 <b>Deployment failed</b>\n\n"
                    f"Project: <b>{deployment.project.name}</b>\n"
                    f"Branch: {deployment.branch}\n"
                    f"Commit: {deployment.commit_hash[:7] if deployment.commit_hash else 'N/A'}\n"
                    f"Source: {deployment.source}\n"
                    f"Time: {timezone.now().strftime('%Y-%m-%d %H:%M UTC')}"
                ),
                alert_type="deployment_failure",
                project=deployment.project,
            )


class DeploymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DeploymentSerializer
    queryset = Deployment.objects.select_related("project")


class FinishDeploymentView(APIView):
    """Mark a deployment as finished with final status and duration."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        deployment = generics.get_object_or_404(Deployment, pk=pk)
        new_status = request.data.get("status", "success")
        error_message = request.data.get("error_message", "")

        deployment.status = new_status
        deployment.finished_at = timezone.now()
        deployment.error_message = error_message
        deployment.duration_seconds = int(
            (deployment.finished_at - deployment.started_at).total_seconds()
        )
        deployment.save()

        if new_status == "failed":
            send_alert(
                subject=f"Deployment failed: {deployment.project.name}",
                message=(
                    f"🚨 <b>Deployment failed</b>\n\n"
                    f"Project: <b>{deployment.project.name}</b>\n"
                    f"Branch: {deployment.branch}\n"
                    f"Duration: {deployment.duration_display}\n"
                    f"Error: {error_message[:200] if error_message else 'No details'}"
                ),
                alert_type="deployment_failure",
                project=deployment.project,
            )

        return Response(DeploymentSerializer(deployment).data)


class DeploymentStatsView(APIView):
    """Summary stats for the dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count
        total = Deployment.objects.count()
        by_status = Deployment.objects.values("status").annotate(count=Count("id"))
        recent_failed = Deployment.objects.filter(
            status="failed"
        ).select_related("project").order_by("-started_at")[:5]

        return Response({
            "total": total,
            "by_status": {item["status"]: item["count"] for item in by_status},
            "recent_failed": DeploymentSerializer(recent_failed, many=True).data,
        })
