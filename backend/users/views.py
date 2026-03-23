from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        if request.user.role == User.Role.FARMER and hasattr(request.user, 'farmer_profile'):
            data['profile'] = {'id': request.user.farmer_profile.id, 'farm_name': request.user.farmer_profile.farm_name, 'location': request.user.farmer_profile.location}
        elif request.user.role == User.Role.BUYER and hasattr(request.user, 'buyer_profile'):
            data['profile'] = {'id': request.user.buyer_profile.id, 'company_name': request.user.buyer_profile.company_name}
        elif request.user.role == User.Role.TRANSPORTER and hasattr(request.user, 'transporter_profile'):
            data['profile'] = {
                'id': request.user.transporter_profile.id,
                'vehicle_type': request.user.transporter_profile.vehicle_type,
                'license_plate': request.user.transporter_profile.license_plate,
                'capacity': request.user.transporter_profile.capacity
            }
        return Response(data)

    def patch(self, request):
        user = request.user
        if user.role == User.Role.TRANSPORTER:
            profile = user.transporter_profile
            serializer = TransporterProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Profile update only implemented for transporters for now."}, status=403)
