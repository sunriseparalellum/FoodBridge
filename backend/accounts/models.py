from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        BUSINESS = "business", "Предприниматель"
        VOLUNTEER = "volunteer", "Волонтёр"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.VOLUNTEER)

class Role(models.TextChoices):
    BUSINESS = "business", "Предприниматель"
    VOLUNTEER = "volunteer", "Волонтёр"
    ADMIN = "admin", "Администратор"