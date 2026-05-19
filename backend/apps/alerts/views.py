from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Alert
from .serializers import AlertSerializer


class AlertListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AlertSerializer

    def get_queryset(self):
        qs = Alert.objects.all()
        alert_type = self.request.query_params.get("type")
        if alert_type:
            qs = qs.filter(alert_type=alert_type)
        return qs
