
from decimal import Decimal

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Event
from .serializers import (
    BookingDetailSerializer,
    BookingSerializer,
    EventCreateSerializer,
    EventDetailSerializer,
    EventSerializer,
    UserRegistrationSerializer,
)


class UserRegistrationView(APIView):
    # Registration is public. Do not validate an old JWT here.
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "User registered successfully",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        })


class EventListView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]

        return [AllowAny()]

    def get(self, request):
        events = Event.objects.all()

        search = request.query_params.get("search")
        category = request.query_params.get("category")

        if search:
            events = events.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
            )

        if category:
            events = events.filter(
                category__iexact=category
            )

        serializer = EventSerializer(
            events,
            many=True
        )

        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        serializer = EventCreateSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        event = serializer.save(
            organizer=request.user
        )

        response_serializer = EventDetailSerializer(event)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class EventDetailView(APIView):

    def get(self, request, pk):
        try:
            event = Event.objects.prefetch_related(
                "ticket_types"
            ).get(pk=pk)

        except Event.DoesNotExist:
            return Response(
                {"detail": "Event not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = EventDetailSerializer(event)

        return Response(serializer.data)


class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingSerializer(
            data=request.data
        )

        if serializer.is_valid():
            booking = serializer.save(
                user=request.user
            )

            return Response(
                BookingSerializer(booking).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.select_related(
                "ticket_type",
                "ticket_type__event",
            ).get(
                pk=pk,
                user=request.user,
            )

        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BookingDetailSerializer(booking)

        return Response(serializer.data)


class OrganizerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get confirmed bookings for this organizer's events.
        bookings = Booking.objects.filter(
            ticket_type__event__organizer=request.user,
            booking_status__iexact="CONFIRMED",
        )

        # Calculate revenue and tickets sold.
        summary = bookings.aggregate(
            total_revenue=Sum("total_amount"),
            tickets_sold=Sum("quantity"),
        )

        total_revenue = (
            summary["total_revenue"] or Decimal("0.00")
        )

        tickets_sold = summary["tickets_sold"] or 0

        # Count upcoming events belonging to this organizer.
        active_events = Event.objects.filter(
            organizer=request.user,
            date__gte=timezone.now(),
        ).count()

        return Response({
            "total_revenue": format(total_revenue, ".2f"),
            "tickets_sold": tickets_sold,
            "active_events": active_events,
        })
