from django.urls import path
from .views import ShortLinkListCreateView, ShortLinkDetailView, ShortLinkStatsView

urlpatterns = [
    path("", ShortLinkListCreateView.as_view()),
    path("<int:pk>/", ShortLinkDetailView.as_view()),
    path("<int:pk>/stats/", ShortLinkStatsView.as_view()),
]
