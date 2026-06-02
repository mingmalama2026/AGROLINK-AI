from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    

class Farmer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.user.username
    
    
    
class Buyer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=100)

class Product(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, default="General")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    unit = models.CharField(max_length=20, default="pcs")                  # new
    quantity = models.IntegerField(default=0)  
    image = models.ImageField(upload_to="products/", blank=True, null=True) 

    def __str__(self):
        return self.name


# Create Farmer profile when a CustomUser with role 'farmer' is created
@receiver(post_save, sender=CustomUser)
def create_farmer_profile(sender, instance, created, **kwargs):
    if created and getattr(instance, 'role', None) == 'farmer':
        # avoid creating duplicate farmer profiles
        if not hasattr(instance, 'farmer'):
            Farmer.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_farmer_profile(sender, instance, **kwargs):
    # only save if a farmer profile exists for the user
    if hasattr(instance, 'farmer'):
        instance.farmer.save()
