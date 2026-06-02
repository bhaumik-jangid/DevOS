from django.urls import path
from .views import (
    DeploymentListView,
    DeploymentDetailView,
    FinishDeploymentView,
    DeploymentStatsView,
)

urlpatterns = [
    path("", DeploymentListView.as_view()),
    path("stats/", DeploymentStatsView.as_view()),
    path("<int:pk>/", DeploymentDetailView.as_view()),
    path("<int:pk>/finish/", FinishDeploymentView.as_view()),
]

from .views import DeploymentWebhookView

urlpatterns += [
    path("webhook/<str:source>/<str:token>/", DeploymentWebhookView.as_view()),
]
