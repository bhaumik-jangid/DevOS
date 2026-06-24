"""
HTTP endpoint for the DevOS AI assistant.
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

from .assistant import run_assistant

logger = logging.getLogger(__name__)


def _authenticate(request) -> bool:
    auth = JWTAuthentication()
    try:
        result = auth.authenticate(request)
        return result is not None
    except Exception:
        return False


@method_decorator(csrf_exempt, name="dispatch")
class AssistantChatView(View):
    """
    POST /api/v1/mcp/chat/

    Body:
    {
        "message": "Which projects are unhealthy?",
        "history": []  // optional conversation history
    }

    Returns:
    {
        "response": "...",
        "tools_called": ["get_project_health"],
        "error": null
    }
    """

    def post(self, request) -> JsonResponse:
        if not _authenticate(request):
            return JsonResponse({"error": "Authentication required"}, status=401)

        try:
            body: dict[str, Any] = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        message = body.get("message", "").strip()
        if not message:
            return JsonResponse({"error": "message is required"}, status=400)

        history = body.get("history", [])
        if not isinstance(history, list):
            history = []

        logger.info("Assistant query: %s", message[:100])

        result = run_assistant(
            user_message=message,
            conversation_history=history if history else None,
        )

        return JsonResponse(result)
