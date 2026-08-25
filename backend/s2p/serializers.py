from rest_framework import serializers
from .models import Listing
from .utils import haversine

class ListingSerializer(serializers.ModelSerializer):
    distance_km = serializers.SerializerMethodField()
    is_claimed_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = "__all__"
        read_only_fields = ["business", "status"]

    def get_distance_km(self, obj):
        request = self.context.get("request")
        lat = request.query_params.get("lat") if request else None
        lng = request.query_params.get("lng") if request else None
        if lat and lng:
            return round(haversine(float(lat), float(lng), obj.latitude, obj.longitude), 2)
        return None

    def get_is_claimed_by_me(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return obj.claims.filter(volunteer=user).exists()