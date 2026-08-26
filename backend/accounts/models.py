from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        BUSINESS = "business", "Предприниматель"
        VOLUNTEER = "volunteer", "Волонтёр"
        CHARITY = "charity", "получатель"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.VOLUNTEER)
    phone = models.CharField(max_length=30, blank=True, default="")

class Role(models.TextChoices):
    BUSINESS = "business", "Предприниматель"
    VOLUNTEER = "volunteer", "Волонтёр"
    CHARITY = "charity", "получатель"
    ADMIN = "admin", "Администратор"