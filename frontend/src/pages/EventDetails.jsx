
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import apiClient from "../api/client";

export default function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch details for the selected event
  useEffect(() => {
    let cancelled = false;

    const fetchEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(`/events/${id}/`);

        if (!cancelled) {
          setEvent(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError("Event not found.");
          } else {
            setError("Unable to load event details. Please try again.");
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

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading event details...</p>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-[60vh] bg-gray-50 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{error}</h1>
        <Link
          to="/events"
          className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          Back to Events
        </Link>
      </main>
    );
  }

  if (!event) {
    return null;
  }

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
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/events"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Events
        </Link>

        {/* Event heading */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-10 text-white sm:px-8">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
              {event.category || "Other"}
            </span>

            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
              {event.title}
            </h1>

            <p className="mt-3 text-blue-100">
              {event.location}
            </p>
          </div>

          {/* Date, time and venue */}
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <p className="text-sm font-medium text-gray-500">
                DATE
              </p>
              <p className="mt-2 font-semibold text-gray-900">
                {formattedDate}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                TIME
              </p>
              <p className="mt-2 font-semibold text-gray-900">
                {formattedTime || "Time unavailable"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                VENUE
              </p>
              <p className="mt-2 font-semibold text-gray-900">
                {event.location}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                EVENT CAPACITY
              </p>
              <p className="mt-2 font-semibold text-gray-900">
                {event.capacity}
              </p>
            </div>
          </div>
        </section>

        {/* Full description */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            About This Event
          </h2>

          <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
            {event.description || "No description available."}
          </p>
        </section>

        {/* Ticket tiers */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Ticket Tiers
          </h2>

          <p className="mt-2 text-gray-600">
            Compare ticket prices and availability.
          </p>

          {ticketTypes.length === 0 ? (
            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
              No ticket tiers are currently available for this event.
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ticketTypes.map((ticket) => {
                const available = Number(ticket.available_quantity);
                const soldOut = available <= 0;

                return (
                  <article
                    key={ticket.id}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-bold text-gray-900">
                      {ticket.tier_name}
                    </h3>

                    <p className="mt-4 text-3xl font-bold text-blue-600">
                      ₹
                      {Number(ticket.price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <p className="mt-4 text-sm text-gray-600">
                      Total tickets: {ticket.total_quantity}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Available: {ticket.available_quantity}
                    </p>

                    <p
                      className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        soldOut
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {soldOut ? "Sold Out" : "Available"}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
