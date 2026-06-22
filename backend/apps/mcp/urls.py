from django.urls import path
from .views import MCPListToolsView, MCPCallToolView, MCPContextView

urlpatterns = [
    path("tools/", MCPListToolsView.as_view()),
    path("call/", MCPCallToolView.as_view()),
    path("context/", MCPContextView.as_view()),
]
