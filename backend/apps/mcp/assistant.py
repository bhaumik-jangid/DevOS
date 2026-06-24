"""
DevOS AI Operational Assistant — powered by Google Gemini.

Uses Gemini via google-generativeai with function calling
to answer natural language queries about the DevOS platform.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings

from .tools import registry
from . import devos_tools  # noqa: F401 — triggers tool registration

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are DevOS Assistant, an AI operational assistant for a personal
developer operations platform.

You have access to live data through function calls. Always use functions
to get current data before answering questions about projects,
deployments, monitoring, or alerts. Never make up data.

Your capabilities:
- Check project health and uptime
- Review recent deployments and their status
- Identify open incidents
- Summarize deployment statistics
- List alerts and contact submissions
- Provide operational summaries

Tone: concise, technical, professional. No filler phrases.
Lead with the most important information.

When a user asks a question, call the appropriate function first,
then synthesize the data into a clear answer.
"""


def _build_gemini_tools() -> list[dict[str, Any]]:
    """Convert DevOS tool registry to Gemini function declarations."""
    declarations = []
    for tool in registry.list_tools():
        schema = tool["inputSchema"]
        # Gemini requires properties to have no empty objects
        properties = {}
        for prop_name, prop_def in schema.get("properties", {}).items():
            prop = {"type": prop_def.get("type", "string").upper()}
            if "description" in prop_def:
                prop["description"] = prop_def["description"]
            if "enum" in prop_def:
                prop["enum"] = prop_def["enum"]
            properties[prop_name] = prop

        declaration: dict[str, Any] = {
            "name": tool["name"],
            "description": tool["description"],
        }
        if properties:
            declaration["parameters"] = {
                "type": "OBJECT",
                "properties": properties,
            }
            if schema.get("required"):
                declaration["parameters"]["required"] = schema["required"]

        declarations.append(declaration)

    return [{"function_declarations": declarations}]


def run_assistant(
    user_message: str,
    conversation_history: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """
    Run the Gemini AI assistant with function calling.

    Returns a dict with:
    - response: the assistant's text response
    - tools_called: list of functions that were invoked
    - error: error message if something failed
    """
    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        return {
            "error": "GEMINI_API_KEY is not configured",
            "response": None,
            "tools_called": [],
        }

    try:
        import google.generativeai as genai
    except ImportError:
        return {
            "error": (
                "google-generativeai package not installed. "
                "Run: pip install google-generativeai"
            ),
            "response": None,
            "tools_called": [],
        }

    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT,
        tools=_build_gemini_tools(),
    )

    # Build conversation history in Gemini format
    history = []
    if conversation_history:
        for msg in conversation_history:
            role = "user" if msg.get("role") == "user" else "model"
            content = msg.get("content", "")
            if isinstance(content, str):
                history.append({"role": role, "parts": [content]})

    chat = model.start_chat(history=history)
    tools_called: list[str] = []
    max_iterations = 5
    iteration = 0

    current_message = user_message

    while iteration < max_iterations:
        iteration += 1

        try:
            response = chat.send_message(current_message)
        except Exception as e:
            logger.exception("Gemini API call failed")
            return {
                "error": f"Gemini API error: {e}",
                "response": None,
                "tools_called": tools_called,
            }

        # Check if Gemini wants to call functions
        function_calls = []
        for part in response.parts:
            if hasattr(part, "function_call") and part.function_call.name:
                function_calls.append(part.function_call)

        if not function_calls:
            # No function calls — extract text response
            text = ""
            for part in response.parts:
                if hasattr(part, "text") and part.text:
                    text += part.text
            return {
                "response": text.strip(),
                "tools_called": tools_called,
                "error": None,
            }

        # Execute all function calls and send results back
        function_responses = []
        for fc in function_calls:
            tool_name = fc.name
            tool_args = dict(fc.args) if fc.args else {}
            tools_called.append(tool_name)

            logger.info("Gemini calling function: %s with %s", tool_name, tool_args)

            tool_result = registry.call(tool_name, tool_args)
            result_data = tool_result.get("result", tool_result)

            function_responses.append({
                "function_response": {
                    "name": tool_name,
                    "response": {"result": result_data},
                }
            })

        # Send function results back to Gemini
        try:
            import google.generativeai.types as genai_types
            response = chat.send_message(
                [genai_types.Part(**fr) for fr in function_responses]
            )
            current_message = ""
        except Exception:
            # Fallback: send as text summary
            summary = json.dumps(
                [fr["function_response"] for fr in function_responses],
                indent=2
            )
            current_message = f"Function results:\n{summary}\n\nPlease provide your final answer."

    return {
        "error": "Max function call iterations reached",
        "response": None,
        "tools_called": tools_called,
    }
