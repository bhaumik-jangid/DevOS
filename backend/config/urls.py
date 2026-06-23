from django.contrib import admin
from django.urls import path, include
from apps.core.health import HealthView
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def health_check(request):
    return JsonResponse({"status": "healthy", "service": "devos-api"})


urlpatterns = [
    path("devos-control/", admin.site.urls),
    path("api/health/", HealthView.as_view(), name="health"),
    # old: health_check, name="health-check"),
    path("api/v1/", include([
        path("auth/", include("apps.accounts.urls")),
        path("projects/", include("apps.projects.urls")),
        path("monitoring/", include("apps.monitoring.urls")),
        path("deployments/", include("apps.deployments.urls")),
        path("portfolio/", include("apps.portfolio.urls")),
        path("alerts/", include("apps.alerts.urls")),
        path("core/", include("apps.core.urls")),
        path("mcp/", include("apps.mcp.urls")),
    ])),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
