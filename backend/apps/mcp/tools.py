"""
DevOS MCP Tool Registry.

Each tool is a callable that accepts typed parameters and returns
a structured dict. Tools are registered with name, description,
and input schema — matching the MCP protocol spec.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Callable

logger = logging.getLogger(__name__)


@dataclass
class ToolSchema:
    """Defines the input schema for an MCP tool."""
    name: str
    description: str
    input_schema: dict[str, Any]
    handler: Callable[..., dict[str, Any]]


class ToolRegistry:
    """Registry of all available MCP tools."""

    def __init__(self) -> None:
        self._tools: dict[str, ToolSchema] = {}

    def register(
        self,
        name: str,
        description: str,
        input_schema: dict[str, Any],
    ) -> Callable:
        """Decorator to register a function as an MCP tool."""
        def decorator(fn: Callable[..., dict[str, Any]]) -> Callable:
            self._tools[name] = ToolSchema(
                name=name,
                description=description,
                input_schema=input_schema,
                handler=fn,
            )
            logger.debug("Registered MCP tool: %s", name)
            return fn
        return decorator

    def get(self, name: str) -> ToolSchema | None:
        return self._tools.get(name)

    def list_tools(self) -> list[dict[str, Any]]:
        """Return tool definitions in MCP protocol format."""
        return [
            {
                "name": t.name,
                "description": t.description,
                "inputSchema": t.input_schema,
            }
            for t in self._tools.values()
        ]

    def call(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Execute a tool by name with given arguments."""
        tool = self._tools.get(name)
        if not tool:
            return {
                "error": f"Tool '{name}' not found",
                "available_tools": list(self._tools.keys()),
            }
        try:
            result = tool.handler(**arguments)
            return {"result": result, "tool": name}
        except TypeError as e:
            return {"error": f"Invalid arguments for tool '{name}': {e}"}
        except Exception as e:
            logger.exception("Tool '%s' raised an exception", name)
            return {"error": f"Tool '{name}' failed: {e}"}


# Global registry instance
registry = ToolRegistry()
