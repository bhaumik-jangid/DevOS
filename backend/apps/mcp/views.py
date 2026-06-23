"""
MCP HTTP transport layer.
Exposes DevOS tools over HTTP following the MCP protocol JSON structure.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.authentication import JWTAuthentication

from .tools import registry
# Import tools module to trigger registration via decorators
from . import devos_tools  # noqa: F401

logger = logging.getLogger(__name__)


def _authenticate(request) -> bool:
    """Validate JWT token from Authorization header."""
    auth = JWTAuthentication()
    try:
        result = auth.authenticate(request)
        return result is not None
    except Exception:
        return False


@method_decorator(csrf_exempt, name="dispatch")
class MCPListToolsView(View):
    """GET /api/v1/mcp/tools/ — list all available tools."""

    def get(self, request) -> JsonResponse:
        if not _authenticate(request):
            return JsonResponse({"error": "Authentication required"}, status=401)

        return JsonResponse({
            "tools": registry.list_tools(),
            "total": len(registry.list_tools()),
        })


@method_decorator(csrf_exempt, name="dispatch")
class MCPCallToolView(View):
    """POST /api/v1/mcp/call/ — execute a tool."""

    def post(self, request) -> JsonResponse:
        if not _authenticate(request):
            return JsonResponse({"error": "Authentication required"}, status=401)

        try:
            body: dict[str, Any] = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON body"}, status=400)

        tool_name = body.get("tool")
        arguments = body.get("arguments", {})

        if not tool_name:
            return JsonResponse(
                {"error": "Missing 'tool' field in request body"},
                status=400,
            )

        if not isinstance(arguments, dict):
            return JsonResponse(
                {"error": "'arguments' must be an object"},
                status=400,
            )

        logger.info("MCP tool call: %s with args %s", tool_name, arguments)
        result = registry.call(tool_name, arguments)

        if "error" in result:
            return JsonResponse(result, status=400)

        return JsonResponse(result)


@method_decorator(csrf_exempt, name="dispatch")
class MCPContextView(View):
    """GET /api/v1/mcp/context/ — get full DevOS operational context."""

    def get(self, request) -> JsonResponse:
        if not _authenticate(request):
            return JsonResponse({"error": "Authentication required"}, status=401)

        health = registry.call("get_project_health", {})
        incidents = registry.call("get_open_incidents", {})
        deployments = registry.call("get_recent_deployments", {"limit": 5})
        stats = registry.call("get_deployment_stats", {"days": 7})

        return JsonResponse({
            "context": {
                "health": health.get("result", {}),
                "incidents": incidents.get("result", {}),
                "recent_deployments": deployments.get("result", {}),
                "deployment_stats": stats.get("result", {}),
            },
            "available_tools": [t["name"] for t in registry.list_tools()],
        })
