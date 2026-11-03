
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import close_old_connections, connection
from django.db.models import Sum
from django.test import TransactionTestCase
from django.utils import timezone

from rest_framework.test import APIClient

from .models import Booking, Event, TicketType


User = get_user_model()


class BookingRaceConditionTest(TransactionTestCase):

    reset_sequences = True

    def setUp(self):

        # Make sure the test uses a database with row locking.
        if connection.vendor != "mysql":
            self.skipTest("This test requires MySQL.")

        if not connection.features.has_select_for_update:
            self.skipTest(
                "Database does not support SELECT FOR UPDATE."
            )

        # Create an organizer.
        self.organizer = User.objects.create_user(
            username="race_organizer",
            email="organizer@example.com",
            password="TestPassword123!",
        )

        # Create an event.
        self.event = Event.objects.create(
            title="Race Condition Test Event",
            description="Testing simultaneous bookings",
            location="Pune",
            date=timezone.now() + timedelta(days=30),
            capacity=5,
            category="Testing",
            organizer=self.organizer,
        )

        # Create only 5 available tickets.
        self.ticket_type = TicketType.objects.create(
            event=self.event,
            tier_name="General",
            price="100.00",
            total_quantity=5,
            available_quantity=5,
        )

        # Create 10 different attendees.
        self.users = [
            User.objects.create_user(
                username=f"race_user_{i}",
                email=f"race_user_{i}@example.com",
                password="TestPassword123!",
            )
            for i in range(10)
        ]

        # Synchronize all 10 requests.
        self.barrier = Barrier(10)

    def make_booking(self, user):

        # Ensure this worker uses its own DB connection.
        close_old_connections()

        try:
            client = APIClient()

            # Authenticate the test user.
            # JWT verification is bypassed because this
            # test focuses specifically on inventory locking.
            client.force_authenticate(user=user)

            # Wait until all workers are ready.
            self.barrier.wait(timeout=30)

            # Submit one ticket booking.
            response = client.post(
                "/api/bookings/",
                {
                    "ticket_type": self.ticket_type.pk,
                    "quantity": 1,
                },
                format="json",
            )

            return (
                response.status_code,
                getattr(response, "data", None),
            )

        except Exception as exc:
            return ("ERROR", str(exc))

        finally:
            close_old_connections()

    def test_simultaneous_bookings_cannot_oversell(self):

        total_requests = 10
        available_tickets = 5

        # Execute 10 bookings simultaneously.
        with ThreadPoolExecutor(
            max_workers=total_requests
        ) as executor:

            futures = [
                executor.submit(self.make_booking, user)
                for user in self.users
            ]

            results = [
                future.result(timeout=90)
                for future in futures
            ]

        # Separate successful and rejected requests.
        successful = [
            result for result in results
            if result[0] == 201
        ]

        rejected = [
            result for result in results
            if result[0] == 400
        ]

        unexpected = [
            result for result in results
            if result[0] not in (201, 400)
        ]

        # Fail if any request produced an unexpected result.
        self.assertEqual(
            unexpected,
            [],
            msg=f"Unexpected API responses: {unexpected}",
        )

        # Exactly 5 requests should succeed.
        self.assertEqual(
            len(successful),
            available_tickets,
        )

        # The remaining 5 should be rejected.
        self.assertEqual(
            len(rejected),
            total_requests - available_tickets,
        )

        # Get the latest inventory from the database.
        self.ticket_type.refresh_from_db()

        booking_summary = Booking.objects.filter(
            ticket_type=self.ticket_type
        ).aggregate(
            total_booked=Sum("quantity")
        )

        total_booked = (
            booking_summary["total_booked"] or 0
        )

        remaining_tickets = (
            self.ticket_type.available_quantity
        )

        # Confirm tickets have not been oversold.
        self.assertLessEqual(
            total_booked,
            self.ticket_type.total_quantity,
        )

        # Confirm exactly 5 tickets were booked.
        self.assertEqual(total_booked, 5)

        # Confirm no tickets remain.
        self.assertEqual(remaining_tickets, 0)

        # Confirm inventory and bookings are consistent.
        self.assertEqual(
            total_booked + remaining_tickets,
            self.ticket_type.total_quantity,
        )

        print("\n========== RACE CONDITION TEST ==========")
        print("Total requests:", total_requests)
        print("Successful bookings:", len(successful))
        print("Rejected bookings:", len(rejected))
        print("Total tickets booked:", total_booked)
        print("Remaining tickets:", remaining_tickets)
        print("=========================================\n")
