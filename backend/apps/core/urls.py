from django.urls import path
from .views import TrackPageView, AnalyticsSummaryView

urlpatterns = [
    path("track/", TrackPageView.as_view()),
    path("analytics/", AnalyticsSummaryView.as_view()),
]
