from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, FarmerProfile, BuyerProfile, TransporterProfile

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(FarmerProfile)
admin.site.register(BuyerProfile)
admin.site.register(TransporterProfile)
