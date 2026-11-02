
from django.urls import path

from .views import (
    UserRegistrationView,
    ProfileView,
    EventListView,
    EventDetailView,
    BookingCreateView,
    BookingDetailView,
    OrganizerDashboardView,
    OrganizerEventAttendeeView,
)


urlpatterns = [
    # Registration and profile
    path(
        "register/",
        UserRegistrationView.as_view(),
        name="register"
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

    # Events
    path(
        "events/",
        EventListView.as_view(),
        name="event-list"
    ),

    path(
        "events/<int:pk>/",
        EventDetailView.as_view(),
        name="event-detail"
    ),

    # Bookings
    path(
        "bookings/",
        BookingCreateView.as_view(),
        name="booking-create"
    ),

    path(
        "bookings/<int:pk>/",
        BookingDetailView.as_view(),
        name="booking-detail"
    ),

    # Organizer dashboard
    path(
        "organizer/dashboard/",
        OrganizerDashboardView.as_view(),
        name="organizer-dashboard"
    ),

    # Organizer attendee management
    path(
        "organizer/events/<int:event_id>/attendees/",
        OrganizerEventAttendeeView.as_view(),
        name="organizer-event-attendees"
    ),
]
