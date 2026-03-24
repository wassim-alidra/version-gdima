from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, OrderViewSet, DeliveryViewSet, 
    ComplaintViewSet, NotificationViewSet, AdminStatsView, UserListViewSet,
    ProductCatalogViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'catalog', ProductCatalogViewSet, basename='catalog')
router.register(r'orders', OrderViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'complaints', ComplaintViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'admin-stats', AdminStatsView, basename='admin-stats')
router.register(r'users-list', UserListViewSet, basename='users-list')

urlpatterns = [
    path('', include(router.urls)),
]