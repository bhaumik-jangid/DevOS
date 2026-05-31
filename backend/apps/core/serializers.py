from rest_framework import serializers
from .models import PageView, DailyStat


class PageViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageView
        fields = ["path", "referrer", "viewed_at"]


class DailyStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStat
        fields = "__all__"
