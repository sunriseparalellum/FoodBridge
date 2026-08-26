from rest_framework import serializers
from .models import Listing
from .utils import haversine

class ListingSerializer(serializers.ModelSerializer):
    distance_km = serializers.SerializerMethodField()
    is_claimed_by_me = serializers.SerializerMethodField()
    business_phone = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = ["id", "business", "category", "title", "description", "food_type", "quantity", "pickup_window_start", "pickup_window_end", "partner_facility", "charity_phone", "latitude", "longitude", "charity_latitude", "charity_longitude", "status", "created_at", "distance_km", "is_claimed_by_me", "business_phone"]
        read_only_fields = ["business", "status", "business_phone"]

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

    def get_business_phone(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and user.role == "volunteer":
            return obj.business.phone
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        can_see_contacts = (
            user and user.is_authenticated and user.role == "volunteer"
            and instance.claims.filter(volunteer=user).exists()
        )
        if not can_see_contacts:
            data.pop("business_phone", None)
            data.pop("charity_phone", None)
        return data