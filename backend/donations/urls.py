from django.urls import path
from .views import tax_calculator

urlpatterns = [
    path("tax-calculator/", tax_calculator),
]