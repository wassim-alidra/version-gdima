from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Order, Delivery
from .serializers import ProductSerializer, OrderSerializer, DeliverySerializer
from users.models import User

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.FARMER:
            return Product.objects.filter(farmer=user)
        return Product.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.FARMER:
             raise permissions.PermissionDenied("Only farmers can add products.")
        serializer.save(farmer=self.request.user)

    def perform_update(self, serializer):
        if self.get_object().farmer != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own products.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.farmer != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own products.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Farmer-specific statistics"""
        if request.user.role != User.Role.FARMER:
             return Response({"error": "Only farmers can view these stats."}, status=403)
        
        user = request.user
        total_products = Product.objects.filter(farmer=user).count()
        total_quantity = sum(p.quantity_available for p in Product.objects.filter(farmer=user))
        
        farmer_orders = Order.objects.filter(product__farmer=user)
        total_orders = farmer_orders.count()
        pending_orders = farmer_orders.filter(status='PENDING').count()
        completed_orders = farmer_orders.filter(status='DELIVERED').count()
        total_revenue = sum(o.total_price for o in farmer_orders.filter(status='DELIVERED'))
        
        return Response({
            "total_products": total_products,
            "total_quantity": total_quantity,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
            "total_revenue": total_revenue
        })

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.BUYER:
            return Order.objects.filter(buyer=user)
        elif user.role == User.Role.FARMER:
            return Order.objects.filter(product__farmer=user)
        elif user.role == User.Role.TRANSPORTER:
            return Order.objects.filter(delivery__transporter=user) # Only assigned
        return Order.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.BUYER:
            raise permissions.PermissionDenied("Only buyers can place orders.")
        serializer.save(buyer=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        order = self.get_object()
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            if user.role == User.Role.FARMER and order.product.farmer == user:
                 serializer.save()
            elif user.role == User.Role.BUYER and order.buyer == user:
                if order.status == 'PENDING' and new_status == 'CANCELLED':
                    serializer.save()
                else:
                    raise permissions.PermissionDenied("Buyers can only cancel PENDING orders.")
            elif user.role == User.Role.ADMIN:
                 serializer.save()
            else:
                raise permissions.PermissionDenied("You do not have permission to update this order status.")
        else:
             super().perform_update(serializer)

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Delivery.objects.all()
        if user.role == User.Role.TRANSPORTER:
            queryset = queryset.filter(transporter=user)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

    def perform_create(self, serializer):
         if self.request.user.role != User.Role.TRANSPORTER:
             raise permissions.PermissionDenied("Only transporters can accept deliveries.")
         serializer.save(transporter=self.request.user)

    @action(detail=False, methods=['get'])
    def available_orders(self, request):
        """List orders ready for delivery assignment"""
        orders = Order.objects.filter(status='ACCEPTED', delivery__isnull=True)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def earnings(self, request):
        """Calculate total earnings for the transporter"""
        if request.user.role != User.Role.TRANSPORTER:
            return Response({"error": "Only transporters can view earnings."}, status=403)
        
        completed_deliveries = Delivery.objects.filter(transporter=request.user, status='DELIVERED')
        total_earnings = sum(d.delivery_fee for d in completed_deliveries)
        
        return Response({
            "total_earnings": total_earnings,
            "completed_count": completed_deliveries.count(),
            "history": DeliverySerializer(completed_deliveries, many=True).data
        })
