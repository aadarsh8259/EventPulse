from django.urls import path

from .views import (
    EventDetailView,
    EventListView,
    ProfileView,
    UserRegistrationView,
)
from .views import (
    BookingCreateView,
    EventDetailView,
    EventListView,
    ProfileView,
    UserRegistrationView,
    BookingCreateView,
)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),

    path("events/", EventListView.as_view(), name="event-list"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
]
path(
    "bookings/",
    BookingCreateView.as_view(),
    name="booking-create",
),