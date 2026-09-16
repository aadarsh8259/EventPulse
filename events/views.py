from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event
from .serializers import EventSerializer, UserRegistrationSerializer

from django.db.models import Q

events = events.filter(
    Q(title__icontains=search) |
    Q(description__icontains=search)
)


class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

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
        return Response(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            }
        )


class EventListView(APIView):
    def get(self, request):
        events = Event.objects.all()

        search = request.query_params.get("search")
        category = request.query_params.get("category")

        if search:
            events = events.filter(
                title__icontains=search
            ) | events.filter(
                description__icontains=search
            )

        if category:
            events = events.filter(category__iexact=category)

        serializer = EventSerializer(events, many=True)

        return Response(serializer.data)


class EventDetailView(APIView):
    def get(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response(
                {"detail": "Event not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = EventSerializer(event)

        return Response(serializer.data)