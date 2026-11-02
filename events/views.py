
import csv
from decimal import Decimal

from django.db import transaction
from django.db.models import Q, Sum
from django.http import HttpResponse
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
    OrganizerAttendeeSerializer,
    UserRegistrationSerializer,
)


class UserRegistrationView(APIView):
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
        bookings = Booking.objects.filter(
            ticket_type__event__organizer=request.user,
            booking_status__iexact="CONFIRMED",
        )

        summary = bookings.aggregate(
            total_revenue=Sum("total_amount"),
            tickets_sold=Sum("quantity"),
        )

        total_revenue = (
            summary["total_revenue"] or Decimal("0.00")
        )

        tickets_sold = summary["tickets_sold"] or 0

        active_events = Event.objects.filter(
            organizer=request.user,
            date__gte=timezone.now(),
        ).count()

        # Include the organizer's events so the frontend
        # can display a Manage Attendees button for each one.
        organizer_events = Event.objects.filter(
            organizer=request.user
        ).order_by("-date")

        event_list = list(
            organizer_events.values(
                "id",
                "title",
                "date",
                "location",
                "category",
                "capacity",
            )
        )

        return Response({
            "total_revenue": format(total_revenue, ".2f"),
            "tickets_sold": tickets_sold,
            "active_events": active_events,
            "events": event_list,
        })


class OrganizerEventAttendeeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):

        # Only the event's organizer can access its attendees.
        try:
            event = Event.objects.get(
                pk=event_id,
                organizer=request.user
            )

        except Event.DoesNotExist:
            return Response(
                {"detail": "Event not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Retrieve bookings for this event.
        bookings = Booking.objects.filter(
            ticket_type__event=event
        ).select_related(
            "user",
            "ticket_type",
            "ticket_type__event"
        ).order_by("-booked_at")

        # Search by username, email or ticket tier.
        search = request.query_params.get(
            "search", ""
        ).strip()

        if search:
            bookings = bookings.filter(
                Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
                | Q(ticket_type__tier_name__icontains=search)
            )

        # Export the current filtered results as CSV.
        if request.query_params.get("format") == "csv":

            response = HttpResponse(
                content_type="text/csv; charset=utf-8"
            )

            response["Content-Disposition"] = (
                f'attachment; filename="event-{event.id}-attendees.csv"'
            )

            response["Cache-Control"] = "no-store"

            # UTF-8 BOM helps spreadsheet software display characters.
            response.write("\ufeff")

            writer = csv.writer(response)

            writer.writerow([
                "Booking ID",
                "Username",
                "Email",
                "Ticket Tier",
                "Ticket Price",
                "Quantity",
                "Booking Amount",
                "Booking Status",
                "Booking Date",
            ])

            def safe_csv_value(value):
                value = str(value if value is not None else "")

                # Reduce spreadsheet formula-injection risk.
                if value.startswith(("=", "+", "-", "@", "\t", "\r")):
                    value = "'" + value

                return value

            for booking in bookings:
                writer.writerow([
                    booking.id,
                    safe_csv_value(booking.user.username),
                    safe_csv_value(booking.user.email),
                    safe_csv_value(booking.ticket_type.tier_name),
                    safe_csv_value(booking.ticket_type.price),
                    booking.quantity,
                    safe_csv_value(booking.total_amount),
                    safe_csv_value(booking.booking_status),
                    booking.booked_at.isoformat(),
                ])

            return response

        # Return JSON for the attendee table.
        summary = bookings.aggregate(
            total_tickets=Sum("quantity")
        )

        serializer = OrganizerAttendeeSerializer(
            bookings,
            many=True
        )

        return Response({
            "event_id": event.id,
            "event_title": event.title,
            "total_records": bookings.count(),
            "total_tickets": summary["total_tickets"] or 0,
            "attendees": serializer.data,
        })
