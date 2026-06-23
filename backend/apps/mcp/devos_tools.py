"""
DevOS tool implementations.
Each function is registered as an MCP-callable tool.
"""
from __future__ import annotations

from typing import Any
from .tools import registry


@registry.register(
    name="get_project_health",
    description=(
        "Get the current health status of all projects or a specific project. "
        "Returns uptime percentage, last check time, open incidents, and status."
    ),
    input_schema={
        "type": "object",
        "properties": {
            "project_slug": {
                "type": "string",
                "description": "Slug of a specific project. Omit to get all projects.",
            }
        },
        "required": [],
    },
)
def get_project_health(project_slug: str = "") -> dict[str, Any]:
    from apps.projects.models import Project
    from apps.monitoring.models import HealthCheck, Incident

    qs = Project.objects.filter(is_public=True)
    if project_slug:
        qs = qs.filter(slug=project_slug)

    results = []
    for project in qs:
        latest = (
            HealthCheck.objects.filter(project=project)
            .order_by("-checked_at")
            .first()
        )
        open_incident = Incident.objects.filter(
            project=project, is_resolved=False
        ).first()

        total = HealthCheck.objects.filter(project=project).count()
        healthy = HealthCheck.objects.filter(project=project, is_healthy=True).count()
        uptime = round((healthy / total * 100), 2) if total > 0 else None

        results.append({
            "project": project.name,
            "slug": project.slug,
            "status": latest.status if latest else "unknown",
            "is_healthy": latest.is_healthy if latest else None,
            "uptime_percent": uptime,
            "last_checked": latest.checked_at.isoformat() if latest else None,
            "open_incident": open_incident.description if open_incident else None,
            "latency_ms": latest.latency_ms if latest else None,
        })

    return {"projects": results, "total": len(results)}


@registry.register(
    name="get_recent_deployments",
    description=(
        "Get recent deployments across all projects or for a specific project. "
        "Returns status, branch, commit, duration, and timestamps."
    ),
    input_schema={
        "type": "object",
        "properties": {
            "project_slug": {
                "type": "string",
                "description": "Filter by project slug. Omit for all projects.",
            },
            "limit": {
                "type": "integer",
                "description": "Number of deployments to return. Default 10, max 50.",
                "default": 10,
            },
            "status": {
                "type": "string",
                "description": "Filter by status: success, failed, in_progress, cancelled.",
                "enum": ["success", "failed", "in_progress", "cancelled"],
            },
        },
        "required": [],
    },
)
def get_recent_deployments(
    project_slug: str = "",
    limit: int = 10,
    status: str = "",
) -> dict[str, Any]:
    from apps.deployments.models import Deployment

    qs = Deployment.objects.select_related("project").order_by("-started_at")

    if project_slug:
        qs = qs.filter(project__slug=project_slug)
    if status:
        qs = qs.filter(status=status)

    limit = min(limit, 50)
    deployments = []

    for d in qs[:limit]:
        deployments.append({
            "id": d.id,
            "project": d.project.name,
            "status": d.status,
            "branch": d.branch,
            "commit": d.commit_hash[:7] if d.commit_hash else "",
            "message": d.commit_message[:100] if d.commit_message else "",
            "triggered_by": d.triggered_by,
            "started_at": d.started_at.isoformat() if d.started_at else None,
            "finished_at": d.finished_at.isoformat() if d.finished_at else None,
            "duration": d.duration_display,
        })

    return {"deployments": deployments, "count": len(deployments)}


@registry.register(
    name="get_open_incidents",
    description=(
        "Get all currently open (unresolved) incidents across all projects. "
        "Returns severity, description, affected project, and start time."
    ),
    input_schema={
        "type": "object",
        "properties": {},
        "required": [],
    },
)
def get_open_incidents() -> dict[str, Any]:
    from apps.monitoring.models import Incident

    incidents = Incident.objects.filter(
        is_resolved=False
    ).select_related("project").order_by("-started_at")

    return {
        "incidents": [
            {
                "id": i.id,
                "project": i.project.name,
                "severity": i.severity,
                "description": i.description,
                "started_at": i.started_at.isoformat(),
                "duration_minutes": i.duration_minutes,
            }
            for i in incidents
        ],
        "total_open": incidents.count(),
    }


@registry.register(
    name="get_project_list",
    description="Get a list of all projects with their basic info and current status.",
    input_schema={
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "description": "Filter by project status: active,in_progress,maintenance,archived.",
            }
        },
        "required": [],
    },
)
def get_project_list(status: str = "") -> dict[str, Any]:
    from apps.projects.models import Project

    qs = Project.objects.all().order_by("name")
    if status:
        qs = qs.filter(status=status)

    return {
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "status": p.status,
                "stack": p.stack_tags,
                "live_url": p.live_url,
                "is_featured": p.is_featured,
            }
            for p in qs
        ],
        "total": qs.count(),
    }


@registry.register(
    name="get_deployment_stats",
    description=(
        "Get deployment statistics: total count, success rate, "
        "failed count, and recent failure details."
    ),
    input_schema={
        "type": "object",
        "properties": {
            "days": {
                "type": "integer",
                "description": "Number of days to look back. Default 7.",
                "default": 7,
            }
        },
        "required": [],
    },
)
def get_deployment_stats(days: int = 7) -> dict[str, Any]:
    from django.utils import timezone
    from datetime import timedelta
    from apps.deployments.models import Deployment

    since = timezone.now() - timedelta(days=days)
    qs = Deployment.objects.filter(started_at__gte=since)

    total = qs.count()
    success = qs.filter(status="success").count()
    failed = qs.filter(status="failed").count()
    in_progress = qs.filter(status="in_progress").count()

    success_rate = round((success / total * 100), 1) if total > 0 else 0

    recent_failures = []
    for d in qs.filter(status="failed").order_by("-started_at")[:5]:
        recent_failures.append({
            "project": d.project.name,
            "branch": d.branch,
            "started_at": d.started_at.isoformat() if d.started_at else None,
            "error": d.error_message[:200] if d.error_message else "",
        })

    return {
        "period_days": days,
        "total": total,
        "success": success,
        "failed": failed,
        "in_progress": in_progress,
        "success_rate_percent": success_rate,
        "recent_failures": recent_failures,
    }


@registry.register(
    name="get_alerts",
    description="Get recent alerts sent via Telegram and their delivery status.",
    input_schema={
        "type": "object",
        "properties": {
            "limit": {
                "type": "integer",
                "description": "Number of alerts to return. Default 10.",
                "default": 10,
            },
            "status": {
                "type": "string",
                "description": "Filter by status: sent, failed, pending.",
            },
        },
        "required": [],
    },
)
def get_alerts(limit: int = 10, status: str = "") -> dict[str, Any]:
    from apps.alerts.models import Alert

    qs = Alert.objects.order_by("-created_at")
    if status:
        qs = qs.filter(status=status)

    return {
        "alerts": [
            {
                "id": a.id,
                "type": a.alert_type,
                "subject": a.subject,
                "status": a.status,
                "project": a.project.name if a.project else None,
                "created_at": a.created_at.isoformat(),
                "sent_at": a.sent_at.isoformat() if a.sent_at else None,
            }
            for a in qs[:limit]
        ]
    }


@registry.register(
    name="get_contact_submissions",
    description="Get recent contact form submissions with their metadata.",
    input_schema={
        "type": "object",
        "properties": {
            "limit": {
                "type": "integer",
                "description": "Number of submissions to return. Default 10.",
                "default": 10,
            },
            "unread_only": {
                "type": "boolean",
                "description": "Return only unread submissions.",
                "default": False,
            },
        },
        "required": [],
    },
)
def get_contact_submissions(
    limit: int = 10,
    unread_only: bool = False,
) -> dict[str, Any]:
    from apps.portfolio.models import ContactSubmission

    qs = ContactSubmission.objects.order_by("-submitted_at")
    if unread_only:
        qs = qs.filter(is_read=False)

    return {
        "submissions": [
            {
                "id": s.id,
                "name": s.name,
                "email": s.email,
                "phone": s.phone,
                "message": s.message[:200],
                "page": s.page,
                "submitted_at": s.submitted_at.isoformat(),
                "is_read": s.is_read,
                "telegram_sent": s.telegram_sent,
            }
            for s in qs[:limit]
        ]
    }
