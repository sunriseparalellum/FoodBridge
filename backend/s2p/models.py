from django.conf import settings
from django.db import models

class Listing(models.Model):
    class Category(models.TextChoices):
        READY_FOOD = "ready_food", "Готовая еда"
        REPURPOSE = "repurpose", "На переработку"
        STORAGE = "storage", "На временное хранение"

    class Status(models.TextChoices):
        OPEN = "open", "Открыто"
        CLAIMED = "claimed", "Забронировано"
        COMPLETED = "completed", "Завершено"

    business = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listings")
    category = models.CharField(max_length=20, choices=Category.choices)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    food_type = models.CharField(max_length=100, blank=True)
    quantity = models.CharField(max_length=100)
    pickup_window_start = models.DateTimeField(null=True, blank=True)
    pickup_window_end = models.DateTimeField(null=True, blank=True)
    partner_facility = models.CharField(max_length=255, blank=True)  # актуально для repurpose/storage
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Claim(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="claims")
    volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="claims")
    claimed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.volunteer} → {self.listing}"