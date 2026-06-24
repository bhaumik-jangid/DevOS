from __future__ import annotations

import logging
from typing import Any
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count, QuerySet

from .models import WatchItem, WatchNote
from .serializers import WatchItemSerializer, WatchItemListSerializer, WatchNoteSerializer

logger = logging.getLogger(__name__)


class WatchItemListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return WatchItemListSerializer
        return WatchItemSerializer

    def get_queryset(self) -> QuerySet:
        qs = WatchItem.objects.all()
        status_filter = self.request.query_params.get("status")
        media_type = self.request.query_params.get("type")
        platform = self.request.query_params.get("platform")
        search = self.request.query_params.get("q")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if media_type:
            qs = qs.filter(media_type=media_type)
        if platform:
            qs = qs.filter(platform=platform)
        if search:
            qs = qs.filter(title__icontains=search)
        return qs


class WatchItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WatchItemSerializer
    queryset = WatchItem.objects.all()


class WatchStatsView(APIView):
    """GET /api/v1/watchlist/stats/ — aggregated watching statistics."""
    permission_classes = [IsAuthenticated]

    def get(self, request) -> Response:
        qs = WatchItem.objects.all()
        total = qs.count()
        completed = qs.filter(status="completed").count()
        watching = qs.filter(status="watching").count()
        dropped = qs.filter(status="dropped").count()
        plan = qs.filter(status="plan_to_watch").count()

        avg_rating = qs.filter(
            personal_rating__isnull=False
        ).aggregate(avg=Avg("personal_rating"))["avg"]

        by_platform = list(
            qs.values("platform")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        by_genre_raw: dict[str, int] = {}
        for item in qs.exclude(genres=[]):
            for genre in item.genres:
                by_genre_raw[genre] = by_genre_raw.get(genre, 0) + 1

        by_genre = sorted(
            [{"genre": k, "count": v} for k, v in by_genre_raw.items()],
            key=lambda x: x["count"],
            reverse=True,
        )[:10]

        top_rated = list(
            qs.filter(personal_rating__isnull=False)
            .order_by("-personal_rating")[:5]
            .values("id", "title", "personal_rating", "media_type", "platform")
        )

        return Response({
            "total": total,
            "completed": completed,
            "watching": watching,
            "dropped": dropped,
            "plan_to_watch": plan,
            "average_rating": round(float(avg_rating), 2) if avg_rating else None,
            "by_platform": by_platform,
            "by_genre": by_genre,
            "top_rated": top_rated,
        })


class WatchNoteListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WatchNoteSerializer

    def get_queryset(self) -> QuerySet:
        return WatchNote.objects.filter(item_id=self.kwargs["item_pk"])

    def perform_create(self, serializer: WatchNoteSerializer) -> None:
        serializer.save(item_id=self.kwargs["item_pk"])


class WatchlistAIView(APIView):
    """POST /api/v1/watchlist/ai/ — AI recommendations and pattern analysis."""
    permission_classes = [IsAuthenticated]

    def post(self, request) -> Response:
        query_type = request.data.get("type", "recommend")

        items = WatchItem.objects.filter(
            status__in=["completed", "watching"]
        ).order_by("-personal_rating")

        if not items.exists():
            return Response({
                "error": "No watched items found. Add some content first."
            }, status=400)

        # Build context for AI
        watch_context = []
        for item in items[:30]:
            watch_context.append({
                "title": item.title,
                "type": item.media_type,
                "platform": item.platform,
                "status": item.status,
                "rating": float(item.personal_rating) if item.personal_rating else None,
                "genres": item.genres,
                "seasons_watched": item.watched_seasons,
                "notes": item.notes[:200] if item.notes else "",
            })

        if query_type == "recommend":
            prompt = f"""Based on this user's streaming history, recommend 5 movies or series they would enjoy.

Watched content (rated by user out of 10):
{watch_context}

Provide specific recommendations with:
- Title
- Why they would like it (based on their patterns)
- Platform availability
- Genre

Be concise and specific. Base recommendations on actual patterns in their ratings and genres."""

        elif query_type == "pattern":
            prompt = f"""Analyze this user's streaming patterns and preferences.

Watch history:
{watch_context}

Provide:
1. Genre preferences (what they actually rate highly vs just watch)
2. Platform distribution
3. Content type preferences
4. Viewing patterns
5. What types of content they tend to drop

Keep analysis factual and based on the data."""

        elif query_type == "summary":
            prompt = f"""Create a brief, interesting summary of this user's streaming life.

Watch history:
{watch_context}

Include: total content, favorite genres, highest rated, longest ongoing series, etc.
Keep it concise and personal."""

        else:
            return Response({"error": "Invalid type. Use: recommend, pattern, summary"}, status=400)

        result = self._call_ai(prompt)
        return Response({"response": result, "type": query_type})

    def _call_ai(self, prompt: str) -> str:
        from django.conf import settings
        api_key = getattr(settings, "GEMINI_API_KEY", "")
        if not api_key:
            return "GEMINI_API_KEY not configured."
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.exception("Watchlist AI failed")
            return f"AI query failed: {e}"


class WatchItemAutofillView(APIView):
    """POST /api/v1/watchlist/autofill/ — AI auto-fills item details from title."""
    permission_classes = [IsAuthenticated]

    def post(self, request) -> Response:
        title = request.data.get("title", "").strip()
        if not title:
            return Response({"error": "Title is required"}, status=400)

        from django.conf import settings
        api_key = getattr(settings, "GEMINI_API_KEY", "")
        if not api_key:
            return Response({"error": "GEMINI_API_KEY not configured"}, status=503)

        prompt = f"""For the movie or TV series titled "{title}", provide the following details in JSON format only. Return ONLY valid JSON, no explanation, no markdown.

{{
  "title": "exact title",
  "media_type": "series" or "movie" or "anime" or "documentary",
  "release_year": number or null,
  "total_seasons": number or null (null for movies),
  "genres": ["genre1", "genre2"],
  "platform": "netflix" or "prime" or "hotstar" or "jiocinema" or "youtube" or "other",
  "language": "English" or other language,
  "country": "country of origin",
  "suggested_rating": number between 1-10 based on general reception or null
}}

For platform, pick the most popular streaming platform where this is commonly available in India."""

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            text = response.text.strip()

            # Strip markdown code blocks if present
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(
                    line for line in lines
                    if not line.startswith("```")
                )

            import json
            data = json.loads(text.strip())
            return Response({"data": data})

        except Exception as e:
            return Response(
                {"error": f"AI fetch failed: {e}"},
                status=500
            )
