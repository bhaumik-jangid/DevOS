from __future__ import annotations

import logging
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views import View
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ShortLink, LinkClick
from .serializers import (
    ShortLinkSerializer, ShortLinkCreateSerializer, ShortLinkUpdateSerializer
)

logger = logging.getLogger(__name__)


class RedirectView(View):
    """GET /s/<code>/ — public redirect endpoint, no frontend needed."""

    def get(self, request, code: str) -> HttpResponse:
        try:
            link = ShortLink.objects.get(code=code, is_active=True)
        except ShortLink.DoesNotExist:
            return HttpResponse(
                "<html><body><h2>Link not found or inactive.</h2>"
                "<p>This short link does not exist.</p></body></html>",
                status=404,
                content_type="text/html"
            )

        if link.is_expired:
            return HttpResponse(
                "<html><body><h2>Link expired.</h2>"
                "<p>This short link has expired.</p></body></html>",
                status=410,
                content_type="text/html"
            )

        ip = (
            request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
            or request.META.get("REMOTE_ADDR", "")
        )

        LinkClick.objects.create(
            link=link,
            ip_address=ip or None,
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            referrer=request.META.get("HTTP_REFERER", "")[:500],
        )

        ShortLink.objects.filter(pk=link.pk).update(
            click_count=link.click_count + 1,
            last_clicked_at=timezone.now(),
        )

        return HttpResponseRedirect(link.original_url)


class ShortLinkListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ShortLinkCreateSerializer
        return ShortLinkSerializer

    def get_queryset(self):
        return ShortLink.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = ShortLinkCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        link = serializer.save()
        return Response(
            ShortLinkSerializer(link).data,
            status=status.HTTP_201_CREATED
        )


class ShortLinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ShortLink.objects.all()

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ShortLinkUpdateSerializer
        return ShortLinkSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ShortLinkUpdateSerializer(
            instance, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        link = serializer.save()
        return Response(ShortLinkSerializer(link).data)


class ShortLinkStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int) -> Response:
        link = get_object_or_404(ShortLink, pk=pk)
        clicks = LinkClick.objects.filter(link=link).order_by("-clicked_at")[:50]
        return Response({
            "link": ShortLinkSerializer(link).data,
            "total_clicks": link.click_count,
            "recent_clicks": [
                {
                    "ip": str(c.ip_address) if c.ip_address else None,
                    "referrer": c.referrer,
                    "clicked_at": c.clicked_at.isoformat(),
                }
                for c in clicks
            ],
        })
