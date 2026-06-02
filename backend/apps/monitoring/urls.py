from django.urls import path
from .views import (
    ProjectStatusView,
    TriggerCheckView,
    HealthCheckHistoryView,
    IncidentListView,
)

urlpatterns = [
    path("status/", ProjectStatusView.as_view()),
    path("trigger/", TriggerCheckView.as_view()),
    path("trigger/<int:project_id>/", TriggerCheckView.as_view()),
    path("history/<int:project_id>/", HealthCheckHistoryView.as_view()),
    path("incidents/", IncidentListView.as_view()),
]

from django.urls import path as dj_path
from .views import SSLStatusView

urlpatterns += [
    dj_path("ssl/", SSLStatusView.as_view()),
]
