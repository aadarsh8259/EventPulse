from django.urls import path

from .views import (
    EventDetailView,
    EventListView,
    ProfileView,
    UserRegistrationView,
)


urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),

    path("events/", EventListView.as_view(), name="event-list"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
]