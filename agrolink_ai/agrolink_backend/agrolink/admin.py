from django.contrib import admin
from .models import CustomUser, Farmer, Buyer, Product

admin.site.register(CustomUser)
admin.site.register(Farmer)
admin.site.register(Buyer)
admin.site.register(Product)
