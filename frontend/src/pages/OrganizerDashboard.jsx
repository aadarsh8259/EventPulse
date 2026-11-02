
import { useEffect, useState } from "react";
import { Link } from "react-router";

import apiClient from "../api/client";


export default function OrganizerDashboard() {
  const [metrics, setMetrics] = useState({
    total_revenue: "0.00",
    tickets_sold: 0,
    active_events: 0,
  });

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch organizer dashboard data.
  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(
          "/organizer/dashboard/"
        );

        if (!cancelled) {
          setMetrics({
            total_revenue: response.data.total_revenue ?? "0.00",
            tickets_sold: response.data.tickets_sold ?? 0,
            active_events: response.data.active_events ?? 0,
          });

          setEvents(response.data.events || []);
        }

      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 401) {
            setError(
              "Please log in to access the organizer dashboard."
            );
          } else if (err.response?.status === 403) {
            setError(
              "You do not have permission to access this dashboard."
            );
          } else {
            setError(
              "Unable to load dashboard information."
            );
          }
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // Format revenue in Indian currency.
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  // Format event date.
  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Dashboard summary cards.
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.total_revenue),
      description: "From confirmed bookings",
      icon: "₹",
      color: "border-green-500",
      iconColor: "bg-green-100 text-green-700",
    },
    {
      title: "Tickets Sold",
      value: metrics.tickets_sold,
      description: "Total confirmed tickets",
      icon: "T",
      color: "border-blue-500",
      iconColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Active Events",
      value: metrics.active_events,
      description: "Upcoming events",
      icon: "E",
      color: "border-purple-500",
      iconColor: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Dashboard heading and create event button */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              EventPulse Organizer
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 text-gray-600">
              Track your revenue, ticket sales and upcoming events.
            </p>
          </div>

          <Link
            to="/organizer/events/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            + Create New Event
          </Link>

        </div>

        {/* Loading state */}
        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">
              Loading dashboard...
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {error}
          </div>
        )}

        {/* Dashboard content */}
        {!loading && !error && (
          <>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {cards.map((card) => (
                <article
                  key={card.title}
                  className={`rounded-2xl border border-gray-200 border-l-4 ${card.color} bg-white p-6 shadow-sm transition hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-gray-500">
                      {card.title}
                    </p>

                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${card.iconColor}`}
                    >
                      {card.icon}
                    </span>

                  </div>

                  <h2 className="mt-5 text-3xl font-bold text-gray-900">
                    {card.value}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {card.description}
                  </p>
                </article>
              ))}

            </div>

            {/* My Events */}
            <section className="mt-10">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Events
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage your events and their registered attendees.
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {events.length} Events
                </span>
              </div>

              {events.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

                  <h3 className="text-lg font-semibold text-gray-900">
                    No events created yet
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Create your first event to start managing attendees.
                  </p>

                  <Link
                    to="/organizer/events/create"
                    className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                  >
                    Create Your First Event
                  </Link>

                </div>
              ) : (

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                  {events.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {event.title}
                          </h3>

                          <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {event.category || "Other"}
                          </span>
                        </div>

                        <span className="text-sm font-medium text-gray-500">
                          Event #{event.id}
                        </span>

                      </div>

                      <div className="mt-5 space-y-2 text-sm text-gray-600">

                        <p>
                          <span className="font-semibold text-gray-800">
                            Date:
                          </span>{" "}
                          {formatDate(event.date)}
                        </p>

                        <p>
                          <span className="font-semibold text-gray-800">
                            Venue:
                          </span>{" "}
                          {event.location}
                        </p>

                        <p>
                          <span className="font-semibold text-gray-800">
                            Capacity:
                          </span>{" "}
                          {event.capacity} people
                        </p>

                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">

                        <Link
                          to={`/organizer/events/${event.id}/attendees`}
                          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
                        >
                          Manage Attendees
                        </Link>

                        <Link
                          to={`/events/${event.id}`}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          View Event
                        </Link>

                      </div>

                    </article>
                  ))}

                </div>
              )}

            </section>

            {/* Welcome section */}
            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                Welcome to your Organizer Portal
              </h2>

              <p className="mt-2 leading-7 text-gray-600">
                Monitor your event performance from one place.
                View attendee bookings, search registered users
                and export your attendee records.
              </p>

            </section>

          </>
        )}

      </div>
    </main>
  );
}
