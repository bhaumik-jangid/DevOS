from django.urls import path
from .views import ProjectListView, ProjectDetailView

urlpatterns = [
    path("", ProjectListView.as_view()),
    path("<int:id>/", ProjectDetailView.as_view()),
    path("<slug:slug>/", ProjectDetailView.as_view()),
]
