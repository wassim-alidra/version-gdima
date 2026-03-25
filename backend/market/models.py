from django.db import models
from django.conf import settings
from users.models import User
from decimal import Decimal

class ProductCatalog(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    min_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Minimum price per kg (DA)")
    max_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Maximum price per kg (DA)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products', limit_choices_to={'role': User.Role.FARMER})
    catalog = models.ForeignKey(ProductCatalog, on_delete=models.CASCADE, related_name='instances', null=True, blank=True)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_available = models.FloatField(help_text="Quantity in kg")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def name(self):
        return self.catalog.name if self.catalog else "Unnamed Product"

    @property
    def description(self):
        return self.catalog.description if self.catalog else "No description available"

    def __str__(self):
        return f"{self.farmer.username}'s {self.catalog.name}"

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
    status = models.CharField(max_length=20, default='ASSIGNED') 
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        # Default fee is 10% of order total, min 5.00
        if not self.delivery_fee and self.order:
            self.delivery_fee = max(Decimal('5.00'), self.order.total_price * Decimal('0.10'))
        
        # Sync status with Order
        if self.status == 'IN_TRANSIT':
            self.order.status = Order.Status.IN_TRANSIT
            self.order.save()
        elif self.status == 'DELIVERED':
            self.order.status = Order.Status.DELIVERED
            self.order.save()
            if not self.delivery_date:
                from django.utils import timezone
                self.delivery_date = timezone.now()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Delivery for Order #{self.order.id}"

class Complaint(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='complaints')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.subject}"

class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"To {self.recipient.username}: {self.message[:20]}..."
