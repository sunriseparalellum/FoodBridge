import requests
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from accounts.permissions import IsBusiness, IsVolunteer
from .models import Listing, Claim
from .serializers import ListingSerializer


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsBusiness()]
        if self.action in ("claim", "complete"):
            return [IsVolunteer()]
        if self.action in ("update", "partial_update", "destroy"):
            return [IsBusiness()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        user = self.request.user
        if self.action in ("update", "partial_update", "destroy", "retrieve") and user.is_authenticated:
            qs = Listing.objects.filter(business=user) | Listing.objects.filter(status=Listing.Status.OPEN)
        elif self.request.query_params.get("mine") == "true" and user.is_authenticated:
            qs = Listing.objects.filter(business=user)
        else:
            qs = Listing.objects.filter(status=Listing.Status.OPEN)
            if user.is_authenticated:
                qs = qs | Listing.objects.filter(status=Listing.Status.CLAIMED, claims__volunteer=user)

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs.order_by("-created_at").distinct()

    def perform_create(self, serializer):
        serializer.save(business=self.request.user)

    @action(detail=True, methods=["post"])
    def claim(self, request, pk=None):
        listing = self.get_object()
        if listing.status != Listing.Status.OPEN:
            return Response({"detail": "Уже забронировано"}, status=status.HTTP_400_BAD_REQUEST)
        Claim.objects.create(listing=listing, volunteer=request.user)
        listing.status = Listing.Status.CLAIMED
        listing.save()
        return Response({"detail": "Принято"})

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        listing = self.get_object()
        if listing.status != Listing.Status.CLAIMED:
            return Response({"detail": "Объявление сейчас не в статусе 'принято'"}, status=400)

        claim = listing.claims.filter(volunteer=request.user).order_by("-claimed_at").first()
        if not claim:
            return Response({"detail": "Вы не принимали это объявление"}, status=403)

        listing.status = Listing.Status.COMPLETED
        listing.save()
        return Response({"detail": "Заказ забран"})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def geocode_address(request):
    address = request.query_params.get("address")
    if not address:
        return Response({"detail": "Укажите адрес"}, status=400)

    resp = requests.get(
        "https://catalog.api.2gis.com/3.0/items/geocode",
        params={"q": address, "fields": "items.point", "key": settings.GIS_2GIS_KEY},
        timeout=5,
    )
    data = resp.json()
    items = data.get("result", {}).get("items", [])
    if not items:
        return Response({"detail": "Адрес не найден"}, status=404)

    item = items[0]
    point = item["point"]
    resolved_address = item.get("full_name") or item.get("address_name") or item.get("name", address)
    return Response({"latitude": point["lat"], "longitude": point["lon"], "address": resolved_address})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def reverse_geocode(request):
    lat = request.query_params.get("lat")
    lon = request.query_params.get("lon")
    if not lat or not lon:
        return Response({"detail": "Нужны координаты"}, status=400)

    resp = requests.get(
        "https://catalog.api.2gis.com/3.0/items/geocode",
        params={"lat": lat, "lon": lon, "fields": "items.point", "key": settings.GIS_2GIS_KEY},
        timeout=5,
    )
    data = resp.json()
    items = data.get("result", {}).get("items", [])
    if not items:
        return Response({"detail": "Адрес не найден для этой точки"}, status=404)

    item = items[0]
    address = item.get("full_name") or item.get("address_name") or item.get("name", "")
    return Response({"address": address})