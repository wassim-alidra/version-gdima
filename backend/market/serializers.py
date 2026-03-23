from rest_framework import serializers
from .models import Product, Order, Delivery

class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.username', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('farmer',)

class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('buyer', 'total_price')

class DeliverySerializer(serializers.ModelSerializer):
    transporter_name = serializers.CharField(source='transporter.username', read_only=True)
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = Delivery
        fields = '__all__'
        read_only_fields = ('transporter',)
