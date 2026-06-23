"""
Production health check endpoint.
Returns service status, database connectivity, and version info.
"""
from __future__ import annotations

import time
from django.http import JsonResponse
from django.views import View
from django.db import connection, OperationalError


class HealthView(View):
    """GET /api/health/ — used by Render and monitoring tools."""

    def get(self, request) -> JsonResponse:
        start = time.monotonic()

        db_ok = False
        db_latency_ms = None
        try:
            t0 = time.monotonic()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_latency_ms = round((time.monotonic() - t0) * 1000)
            db_ok = True
        except OperationalError:
            db_ok = False

        total_ms = round((time.monotonic() - start) * 1000)
        status = "healthy" if db_ok else "degraded"

        return JsonResponse(
            {
                "status": status,
                "service": "devos-api",
                "database": "ok" if db_ok else "error",
                "db_latency_ms": db_latency_ms,
                "response_ms": total_ms,
            },
            status=200 if db_ok else 503,
        )
