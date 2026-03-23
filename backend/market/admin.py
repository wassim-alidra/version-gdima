from django.contrib import admin
from .models import Product, Order, Delivery

admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Delivery)
