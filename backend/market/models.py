from django.db import models
from django.conf import settings
from users.models import User
from decimal import Decimal

class Product(models.Model):
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products', limit_choices_to={'role': User.Role.FARMER})
    name = models.CharField(max_length=255)
    description = models.TextField()
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_available = models.FloatField(help_text="Quantity in kg")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders', limit_choices_to={'role': User.Role.BUYER})
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders')
    quantity = models.FloatField(help_text="Quantity in kg")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.product.price_per_kg * Decimal(str(self.quantity)) # Basic calculation
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.id} - {self.product.name}"

class Delivery(models.Model):
    transporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='deliveries', limit_choices_to={'role': User.Role.TRANSPORTER})
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    pickup_date = models.DateTimeField(null=True, blank=True)
    delivery_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='ASSIGNED') # Could reuse Order status logic or separate

    def __str__(self):
        return f"Delivery for Order #{self.order.id}"
