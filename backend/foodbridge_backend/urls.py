from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import RegisterView, me, change_password

def hello(request):
    return JsonResponse({"message": "Hello from Django"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/hello/", hello),
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/me/", me),
    path("api/auth/change-password/", change_password),
    path("api/s2p/", include("s2p.urls")),
    path("api/donations/", include("donations.urls")),
    path("api/articles/", include("articles.urls")),
]