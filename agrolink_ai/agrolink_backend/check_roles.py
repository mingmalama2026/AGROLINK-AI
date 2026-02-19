from django.contrib.auth import get_user_model

User = get_user_model()
for u in User.objects.all():
    print(f'User: {u.username}, Role: "{u.role}" (length: {len(u.role)})')
