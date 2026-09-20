from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import Booking, Event, TicketType

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "description",
            "location",
            "date",
            "capacity",
            "category",
        )
class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = (
            "id",
            "ticket_type",
            "quantity",
            "total_amount",
            "booking_status",
            "booked_at",
        )
        read_only_fields = (
            "id",
            "total_amount",
            "booking_status",
            "booked_at",
        )

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )

        return value

    def validate(self, attrs):
        ticket_type = attrs["ticket_type"]
        quantity = attrs["quantity"]

        if quantity > ticket_type.available_quantity:
            raise serializers.ValidationError(
                {
                    "quantity": (
                        f"Only {ticket_type.available_quantity} "
                        "tickets are available."
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        user = validated_data.pop("user")
        ticket_type = validated_data["ticket_type"]
        quantity = validated_data["quantity"]

        with transaction.atomic():
            ticket_type = (
                TicketType.objects
                .select_for_update()
                .get(pk=ticket_type.pk)
            )

            if quantity > ticket_type.available_quantity:
                raise serializers.ValidationError(
                    {
                        "quantity": (
                            f"Only {ticket_type.available_quantity} "
                            "tickets are available."
                        )
                    }
                )

            total_amount = ticket_type.price * quantity

            booking = Booking.objects.create(
                user=user,
                ticket_type=ticket_type,
                quantity=quantity,
                total_amount=total_amount,
            )

            ticket_type.available_quantity -= quantity
            ticket_type.save(
                update_fields=["available_quantity"]
            )

        return booking
