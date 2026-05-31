from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PageView


class TrackPageView(APIView):
    """Called by the frontend on every page load. No cookies, no personal data."""
    permission_classes = [AllowAny]

    def post(self, request):
        path = request.data.get("path", "")
        referrer = request.data.get("referrer", "")[:500]
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

        if not path or path.startswith("/dashboard") or path.startswith("/admin"):
            return Response({"tracked": False})

        PageView.objects.create(
            path=path,
            referrer=referrer,
            user_agent=user_agent,
        )
        return Response({"tracked": True})


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        last_30 = now - timedelta(days=30)
        last_7 = now - timedelta(days=7)

        total_views = PageView.objects.count()
        views_30d = PageView.objects.filter(viewed_at__gte=last_30).count()
        views_7d = PageView.objects.filter(viewed_at__gte=last_7).count()

        # Top pages
        top_pages = (
            PageView.objects
            .values("path")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        # Daily breakdown for chart — last 30 days
        daily = (
            PageView.objects
            .filter(viewed_at__gte=last_30)
            .annotate(date=TruncDate("viewed_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        # Recent views
        recent = PageView.objects.order_by("-viewed_at")[:20]
        recent_data = [
            {
                "path": v.path,
                "referrer": v.referrer,
                "viewed_at": v.viewed_at.isoformat(),
            }
            for v in recent
        ]

        return Response({
            "total_views": total_views,
            "views_30d": views_30d,
            "views_7d": views_7d,
            "top_pages": list(top_pages),
            "daily_chart": [
                {"date": str(d["date"]), "count": d["count"]}
                for d in daily
            ],
            "recent": recent_data,
        })
