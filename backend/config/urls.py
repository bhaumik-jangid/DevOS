from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "healthy", "service": "devos-api"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/v1/", include([
        path("auth/", include("apps.accounts.urls")),
        path("projects/", include("apps.projects.urls")),
        path("monitoring/", include("apps.monitoring.urls")),
        path("deployments/", include("apps.deployments.urls")),
        path("portfolio/", include("apps.portfolio.urls")),
    ])),
]
