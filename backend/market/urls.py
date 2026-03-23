from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet, DeliveryViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet)
router.register(r'deliveries', DeliveryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]