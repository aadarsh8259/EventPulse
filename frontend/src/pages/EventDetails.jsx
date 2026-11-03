
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import TicketSelectionModal from "../components/events/TicketSelectionModal";
import apiClient from "../api/client";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState("");

  // Fetch event details.
  useEffect(() => {
    let cancelled = false;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(`/events/${id}/`);

        if (!cancelled) {
          setEvent(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError("Event not found.");
          } else {
            setError(
              "Unable to load event details. Please try again."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEvent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Handle booking confirmation.
  const handleConfirmSelection = async (selection) => {
    if (bookingLoading) return;

    if (!selection || !selection.length) {
      return;
    }

    // Backend currently supports one ticket tier per booking.
    if (selection.length !== 1) {
      setSelectionMessage(
        "Please select one ticket tier per booking."
      );
      return;
    }

    const ticket = selection[0];

    try {
      setBookingLoading(true);
      setSelectionMessage("");

      // Send booking request to Django.
      const response = await apiClient.post("/bookings/", {
        ticket_type: ticket.id,
        quantity: ticket.quantity,
      });

      const booking = response.data;

      if (!booking.id) {
        throw new Error(
          "The server did not return a booking ID."
        );
      }

      // Navigate to booking confirmation.
      navigate(`/booking-confirmation/${booking.id}`);

    } catch (err) {
      const data = err.response?.data;

      const message =
        data?.quantity?.[0] ||
        data?.ticket_type?.[0] ||
        data?.detail ||
        err.message ||
        "Booking failed. Please try again.";

      setSelectionMessage(
        typeof message === "string"
          ? message
          : "Booking failed. Please try again."
      );

    } finally {
      setBookingLoading(false);
    }
  };

  // Loading state.
  if (loading) {
    return (
      <main className="flex min-h-[60vh] w-full items-center justify-center bg-gray-50 px-4">
        <p className="text-center text-sm text-gray-600 sm:text-base">
          Loading event details...
        </p>
      </main>
    );
  }

  // Error state.
  if (error) {
    return (
      <main className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center">

        <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
          {error}
        </h1>

        <Link
          to="/events"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Events
        </Link>

      </main>
    );
  }

  if (!event) {
    return null;
  }

  // Format event date and time.
  const eventDate = new Date(event.date);
  const validDate = !Number.isNaN(eventDate.getTime());

  const formattedDate = validDate
    ? eventDate.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date unavailable";

  const formattedTime = validDate
    ? eventDate.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const ticketTypes = event.ticket_types ?? [];

  return (
    <main className="min-h-screen w-full bg-gray-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

      <div className="mx-auto w-full max-w-5xl">

        {/* Back navigation */}
        <Link
          to="/events"
          className="inline-flex min-h-10 items-center text-sm font-medium text-blue-600 transition hover:text-blue-800 hover:underline"
        >
          ← Back to Events
        </Link>

        {/* Event heading and basic information */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Event banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-10">

            <span className="inline-block max-w-full break-words rounded-full bg-white/20 px-3 py-1 text-xs font-medium sm:text-sm">
              {event.category || "Other"}
            </span>

            <h1 className="mt-5 break-words text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
              {event.title}
            </h1>

            <p className="mt-3 break-words text-sm leading-relaxed text-blue-100 sm:text-base">
              {event.location}
            </p>

          </div>

          {/* Date, time, venue and capacity */}
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-8">

            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-gray-500 sm:text-sm">
                DATE
              </p>

              <p className="mt-2 break-words text-sm font-semibold text-gray-900 sm:text-base">
                {formattedDate}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-gray-500 sm:text-sm">
                TIME
              </p>

              <p className="mt-2 break-words text-sm font-semibold text-gray-900 sm:text-base">
                {formattedTime || "Time unavailable"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-gray-500 sm:text-sm">
                VENUE
              </p>

              <p className="mt-2 break-words text-sm font-semibold text-gray-900 sm:text-base">
                {event.location}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-gray-500 sm:text-sm">
                EVENT CAPACITY
              </p>

              <p className="mt-2 text-sm font-semibold text-gray-900 sm:text-base">
                {event.capacity}
              </p>
            </div>

          </div>

        </section>

        {/* Event description */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-8">

          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            About This Event
          </h2>

          <p className="mt-4 break-words whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
            {event.description || "No description available."}
          </p>

        </section>

        {/* Ticket tiers */}
        <section className="mt-7 sm:mt-8">

          {/* Section heading and button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Available Ticket Tiers
              </h2>

              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Compare ticket prices and availability.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectionMessage("");
                setShowTicketModal(true);
              }}
              disabled={ticketTypes.length === 0}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:shrink-0"
            >
              Select Tickets
            </button>

          </div>

          {/* No tickets available */}
          {ticketTypes.length === 0 ? (

            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 sm:p-6 sm:text-base">
              No ticket tiers are currently available for this event.
            </div>

          ) : (

            /* Responsive ticket cards */
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {ticketTypes.map((ticket) => {

                const available = Number(ticket.available_quantity);
                const soldOut = available <= 0;

                return (
                  <article
                    key={ticket.id}
                    className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md sm:p-6"
                  >

                    <h3 className="break-words text-lg font-bold text-gray-900 sm:text-xl">
                      {ticket.tier_name}
                    </h3>

                    <p className="mt-4 break-words text-2xl font-bold text-blue-600 sm:text-3xl">
                      ₹
                      {Number(ticket.price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <div className="mt-5 space-y-2 text-sm text-gray-600">

                      <p>
                        Total tickets: {ticket.total_quantity}
                      </p>

                      <p>
                        Available: {ticket.available_quantity}
                      </p>

                    </div>

                    <div className="mt-auto pt-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
                          soldOut
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {soldOut ? "Sold Out" : "Available"}
                      </span>
                    </div>

                  </article>
                );
              })}

            </div>

          )}

        </section>

      </div>

      {/* Ticket selection modal */}
      {showTicketModal && (
        <TicketSelectionModal
          ticketTypes={ticketTypes}
          onClose={() => {
            if (!bookingLoading) {
              setShowTicketModal(false);
              setSelectionMessage("");
            }
          }}
          onConfirm={handleConfirmSelection}
          isSubmitting={bookingLoading}
          errorMessage={selectionMessage}
        />
      )}

    </main>
  );
}
