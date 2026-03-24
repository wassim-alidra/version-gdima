from rest_framework import serializers
from .models import Product, Order, Delivery, Complaint, Notification, ProductCatalog

class ProductCatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCatalog
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.username', read_only=True)
    name = serializers.ReadOnlyField()
    description = serializers.ReadOnlyField()
    catalog_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('farmer',)

    def get_catalog_name(self, obj):
        return obj.catalog.name if obj.catalog else "Uncategorized"

class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    delivery_status = serializers.SerializerMethodField()
    transporter_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('buyer', 'total_price')

    def get_delivery_status(self, obj):
        return getattr(obj, 'delivery').status if hasattr(obj, 'delivery') else "PENDING"

    def get_transporter_name(self, obj):
        if hasattr(obj, 'delivery') and obj.delivery.transporter:
            return obj.delivery.transporter.username
        return "Not Assigned"

class DeliverySerializer(serializers.ModelSerializer):
    transporter_name = serializers.CharField(source='transporter.username', read_only=True)
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = Delivery
        fields = '__all__'
        read_only_fields = ('transporter',)

class ComplaintSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('user',)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
