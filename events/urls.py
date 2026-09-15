from django.urls import path

from .views import ProfileView, UserRegistrationView


urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
]