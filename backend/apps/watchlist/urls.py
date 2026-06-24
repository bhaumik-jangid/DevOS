from django.urls import path
from .views import (
    WatchItemListCreateView, WatchItemDetailView,
    WatchStatsView, WatchNoteListCreateView, WatchlistAIView,
    WatchItemAutofillView
)

urlpatterns = [
    path("", WatchItemListCreateView.as_view()),
    path("stats/", WatchStatsView.as_view()),
    path("ai/", WatchlistAIView.as_view()),
    path("<int:pk>/", WatchItemDetailView.as_view()),
    path("<int:item_pk>/notes/", WatchNoteListCreateView.as_view()),
    path("autofill/", WatchItemAutofillView.as_view()),
]
