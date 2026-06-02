import time
import requests
from django.utils import timezone
from apps.projects.models import Project
from .models import HealthCheck, Incident
import ssl
import socket
from datetime import datetime

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

def check_ssl_expiry(hostname: str, port: int = 443) -> dict:
    """Check SSL certificate expiry for a hostname."""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                expiry_str = cert["notAfter"]
                expiry_date = datetime.strptime(
                    expiry_str, "%b %d %H:%M:%S %Y %Z"
                ).replace(tzinfo=timezone.utc)

                now = timezone.now()
                days_remaining = (expiry_date - now).days
                return {
                    "hostname": hostname,
                    "expiry_date": expiry_date.isoformat(),
                    "days_remaining": days_remaining,
                    "is_valid": days_remaining > 0,
                    "is_expiring_soon": days_remaining <= 30,
                }
    except Exception as e:
        return {
            "hostname": hostname,
            "expiry_date": None,
            "days_remaining": None,
            "is_valid": False,
            "is_expiring_soon": False,
            "error": str(e)[:200],
        }


def check_all_ssl() -> list:
    """Check SSL for all projects with live URLs."""
    from apps.projects.models import Project
    from apps.alerts.services import send_alert

    results = []
    projects = Project.objects.filter(
        is_public=True
    ).exclude(live_url="")

    for project in projects:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(project.live_url)
            if parsed.scheme != "https":
                continue
            hostname = parsed.netloc.split(":")[0]
            result = check_ssl_expiry(hostname)
            result["project_id"] = project.id
            result["project_name"] = project.name

            if result["is_expiring_soon"] and result["days_remaining"] is not None:
                send_alert(
                    subject=f"SSL expiring: {project.name}",
                    message=(
                        f"⚠️ <b>SSL certificate expiring soon</b>\n\n"
                        f"Project: <b>{project.name}</b>\n"
                        f"Domain: {hostname}\n"
                        f"Days remaining: {result['days_remaining']}\n"
                        f"Expiry: {result['expiry_date']}"
                    ),
                    alert_type="custom",
                    project=project,
                )
            results.append(result)
        except Exception:
            pass

    return results
