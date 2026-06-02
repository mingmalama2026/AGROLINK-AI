from rest_framework import serializers
from .models import CustomUser, Farmer, Buyer, Product

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        # include first_name so frontend can send it without validation error
        fields = ['id', 'username', 'email', 'first_name', 'role', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        

    def create(self, validated_data):
        # Remove password from validated_data and pass remaining fields to create_user
        password = validated_data.pop('password', None)
        user = CustomUser.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        # If the created user is a farmer, create a Farmer profile automatically
        try:
            role = validated_data.get('role') or user.role
        except Exception:
            role = getattr(user, 'role', None)
        if role == 'farmer':
            # avoid duplicate Farmer if one already exists
            if not hasattr(user, 'farmer'):
                Farmer.objects.create(user=user, phone='', address='')
        return user

class FarmerSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Farmer
        fields = ['id', 'user', 'email', 'phone', 'address']

class BuyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buyer
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    farmer = FarmerSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'unit', 'description', 'quantity', 'price', 'image', 'farmer']
