from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Admin')
        FARMER = 'FARMER', _('Farmer')
        BUYER = 'BUYER', _('Buyer')
        TRANSPORTER = 'TRANSPORTER', _('Transporter')

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.FARMER)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
        return super().save(*args, **kwargs)

class FarmerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile')
    farm_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.user.username} - {self.farm_name}"

class BuyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buyer_profile')
    company_name = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.user.username

class TransporterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='transporter_profile')
    vehicle_type = models.CharField(max_length=100)
    license_plate = models.CharField(max_length=50)
    capacity = models.FloatField(help_text="Capacity in tons")

    def __str__(self):
        return f"{self.user.username} - {self.vehicle_type}"
