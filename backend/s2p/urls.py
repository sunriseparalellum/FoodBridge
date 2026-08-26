from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ListingViewSet, build_route, geocode_address, reverse_geocode

router = DefaultRouter()
router.register("listings", ListingViewSet, basename="listing")
urlpatterns = router.urls + [
    path("geocode/", geocode_address),
    path("reverse-geocode/", reverse_geocode),
    path("route/", build_route),
]