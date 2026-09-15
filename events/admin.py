from django.contrib import admin
from .models import CustomUser, Event, TicketType, Booking


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "is_staff")
    search_fields = ("username", "email")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "location", "date", "capacity")
    search_fields = ("title", "location")


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = (
        "tier_name",
        "event",
        "price",
        "total_quantity",
        "available_quantity",
    )
    search_fields = ("tier_name",)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "ticket_type",
        "quantity",
        "total_amount",
        "booking_status",
        "booked_at",
    )
    list_filter = ("booking_status",)