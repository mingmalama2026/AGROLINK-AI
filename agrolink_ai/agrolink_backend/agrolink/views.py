from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CustomUser, Farmer, Buyer, Product
from .serializers import UserSerializer, FarmerSerializer, BuyerSerializer, ProductSerializer
from rest_framework import generics
from .models import CustomUser
from rest_framework.exceptions import ValidationError
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current logged-in user's information"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @me.mapping.patch
    def me_patch(self, request):
        """Update current user's username/email/password (partial)."""
        user = request.user
        data = dict(request.data)
        # Use serializer for validation and update; handle password specially
        password = data.pop('password', None)
        serializer = self.get_serializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
        return Response(self.get_serializer(user).data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Use validated data from serializer (serializer.create handles password)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["GET", "PATCH"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get or update the current user's farmer profile."""
        try:
            farmer = request.user.farmer
        except Farmer.DoesNotExist:
            if request.method == 'PATCH':
                # create a farmer profile for the user if updating and none exists
                farmer = Farmer.objects.create(
                    user=request.user,
                    phone=request.data.get('phone', ''),
                    address=request.data.get('address', ''),
                )
                serializer = self.get_serializer(farmer)
                return Response(serializer.data)
            return Response({'detail': 'Farmer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = self.get_serializer(farmer)
            return Response(serializer.data)
        else:
            serializer = self.get_serializer(farmer, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class BuyerViewSet(viewsets.ModelViewSet):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["GET"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        """Return products for the logged-in farmer."""
        try:
            farmer = request.user.farmer
        except Farmer.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)
        qs = Product.objects.filter(farmer=farmer)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Ensure the requesting user has an associated Farmer profile; create one if missing
        try:
            farmer = self.request.user.farmer
        except Farmer.DoesNotExist:
            farmer = Farmer.objects.create(
                user=self.request.user,
                phone='',
                address=''
            )
        serializer.save(farmer=farmer)

class SignupView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
