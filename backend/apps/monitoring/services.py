import time
import requests
from django.utils import timezone
from apps.projects.models import Project
from .models import HealthCheck, Incident

TIMEOUT_SECONDS = 10


def check_project(project: Project) -> HealthCheck:
    if not project.health_endpoint:
        return None

    start = time.monotonic()
    status = "error"
    status_code = None
    is_healthy = False
    error_message = ""

    try:
        response = requests.get(
            project.health_endpoint,
            timeout=TIMEOUT_SECONDS,
            headers={"User-Agent": "DevOS-Monitor/1.0"},
        )
        latency_ms = int((time.monotonic() - start) * 1000)
        status_code = response.status_code
        is_healthy = 200 <= status_code < 300
        status = "healthy" if is_healthy else "unhealthy"

    except requests.Timeout:
        latency_ms = TIMEOUT_SECONDS * 1000
        status = "timeout"
        error_message = "Request timed out"

    except requests.ConnectionError as e:
        latency_ms = int((time.monotonic() - start) * 1000)
        status = "error"
        error_message = str(e)[:200]

    except Exception as e:
        latency_ms = int((time.monotonic() - start) * 1000)
        status = "error"
        error_message = str(e)[:200]

    health_check = HealthCheck.objects.create(
        project=project,
        status=status,
        status_code=status_code,
        latency_ms=latency_ms,
        is_healthy=is_healthy,
        error_message=error_message,
    )

    _handle_incident(project, is_healthy, status)
    return health_check


def _handle_incident(project: Project, is_healthy: bool, status: str):
    from apps.alerts.services import alert_downtime, alert_recovery

    open_incident = Incident.objects.filter(
        project=project,
        is_resolved=False
    ).first()

    if not is_healthy and not open_incident:
        Incident.objects.create(
            project=project,
            severity="high" if status == "timeout" else "medium",
            description=f"Health check failed with status: {status}",
        )
        alert_downtime(project)

    elif is_healthy and open_incident:
        open_incident.resolved_at = timezone.now()
        open_incident.is_resolved = True
        open_incident.save()

        downtime_minutes = open_incident.duration_minutes
        alert_recovery(project, downtime_minutes)


def run_all_checks() -> dict:
    projects = Project.objects.filter(
        is_public=True
    ).exclude(health_endpoint="")

    results = {"checked": 0, "healthy": 0, "unhealthy": 0, "skipped": 0}

    for project in projects:
        check = check_project(project)
        if check is None:
            results["skipped"] += 1
        else:
            results["checked"] += 1
            if check.is_healthy:
                results["healthy"] += 1
            else:
                results["unhealthy"] += 1

    return results
