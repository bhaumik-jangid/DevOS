from django.urls import path
from .views import ServiceListView, ServiceUpdateView, TrackPageView, AnalyticsSummaryView

urlpatterns = [
    path("track/", TrackPageView.as_view()),
    path("analytics/", AnalyticsSummaryView.as_view()),
]

urlpatterns += [
    path('services/', ServiceListView.as_view()),
    path('services/update/', ServiceUpdateView.as_view()),
]
