from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Order, Delivery, Complaint, Notification, ProductCatalog
from .serializers import (
    ProductSerializer, OrderSerializer, DeliverySerializer, 
    ComplaintSerializer, NotificationSerializer, ProductCatalogSerializer
)
from users.models import User
from django.db.models import Sum

class ProductCatalogViewSet(viewsets.ModelViewSet):
    queryset = ProductCatalog.objects.all()
    serializer_class = ProductCatalogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == User.Role.FARMER:
            # Farmers see all their own products (even legacy ones)
            queryset = Product.objects.filter(farmer=user)
        else:
            # Buyers and others only see properly catalogued products
            queryset = Product.objects.filter(catalog__isnull=False)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(catalog__name__icontains=search)

        return queryset

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

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Buyer-specific statistics"""
        if request.user.role != User.Role.BUYER:
             return Response({"error": "Only buyers can view these stats."}, status=403)
        
        user = request.user
        buyer_orders = Order.objects.filter(buyer=user)
        total_orders = buyer_orders.count()
        pending_deliveries = buyer_orders.filter(status__in=['ACCEPTED', 'IN_TRANSIT']).count()
        delivered_count = buyer_orders.filter(status='DELIVERED').count()
        total_spent = sum(o.total_price for o in buyer_orders.filter(status='DELIVERED'))
        
        return Response({
            "total_orders": total_orders,
            "pending_deliveries": pending_deliveries,
            "delivered_count": delivered_count,
            "total_spent": total_spent
        })

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

    def perform_update(self, serializer):
        user = self.request.user
        delivery = self.get_object()
        
        if user.role != User.Role.TRANSPORTER or delivery.transporter != user:
             raise permissions.PermissionDenied("You can only update your own assigned deliveries.")
        
        # Valid status transitions
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            if delivery.status == 'ASSIGNED' and new_status != 'IN_TRANSIT':
                raise permissions.PermissionDenied("From ASSIGNED, you must move to IN_TRANSIT.")
            if delivery.status == 'IN_TRANSIT' and new_status != 'DELIVERED':
                raise permissions.PermissionDenied("From IN_TRANSIT, you must move to DELIVERED.")
        
        serializer.save()

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

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Complaint.objects.all()
        return Complaint.objects.filter(user=user)

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise serializers.ValidationError({"detail": str(e)})

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def send_broadcast(self, request):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Only Admin can send notifications."}, status=status.HTTP_403_FORBIDDEN)
        
        message = request.data.get('message')
        if not message:
            return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Send to Farmers and Buyers
            recipients = User.objects.filter(role__in=[User.Role.FARMER, User.Role.BUYER])
            notifications = [Notification(recipient=r, message=message) for r in recipients]
            Notification.objects.bulk_create(notifications)
            return Response({"detail": f"Notification sent to {len(notifications)} users."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": f"Backend Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminStatsView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        stats = {
            "total_users": User.objects.count(),
            "farmers_count": User.objects.filter(role=User.Role.FARMER).count(),
            "buyers_count": User.objects.filter(role=User.Role.BUYER).count(),
            "transporters_count": User.objects.filter(role=User.Role.TRANSPORTER).count(),
            "total_products": Product.objects.count(),
            "total_orders": Order.objects.count(),
            "total_revenue": Order.objects.filter(status='DELIVERED').aggregate(Sum('total_price'))['total_price__sum'] or 0,
            "pending_complaints": Complaint.objects.filter(is_resolved=False).count()
        }
        return Response(stats)

class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != User.Role.ADMIN:
            return User.objects.none()
        return User.objects.all().order_by('-date_joined')

    def list(self, request):
        users = self.get_queryset()
        data = [{
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "email": u.email,
            "date_joined": u.date_joined
        } for u in users]
        return Response(data)

