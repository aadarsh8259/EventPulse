
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
    <main className="min-h-screen w-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

      <div className="mx-auto w-full max-w-7xl min-w-0">

        {/* Dashboard Heading */}
        <div className="mb-7 flex min-w-0 flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">

          <div className="min-w-0">

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">
              EventPulse Organizer
            </p>

            <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
              Track your revenue, ticket sales and upcoming events.
            </p>

          </div>

          <Link
            to="/organizer/events/create"
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:text-base"
          >
            + Create New Event
          </Link>

        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <p className="text-sm text-gray-600 sm:text-base">
              Loading dashboard...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            role="alert"
            className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 sm:p-5 sm:text-base"
          >
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <>

            {/* Summary Cards */}
            <section
              aria-label="Dashboard statistics"
              className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
            >

              {cards.map((card) => (
                <article
                  key={card.title}
                  className={`min-w-0 rounded-2xl border border-gray-200 border-l-4 ${card.color} bg-white p-5 shadow-sm transition duration-200 hover:shadow-md sm:p-6`}
                >

                  <div className="flex min-w-0 items-center justify-between gap-3">

                    <p className="min-w-0 break-words text-sm font-medium text-gray-500 sm:text-base">
                      {card.title}
                    </p>

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold sm:h-11 sm:w-11 ${card.iconColor}`}
                    >
                      {card.icon}
                    </span>

                  </div>

                  <h2 className="mt-5 break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                    {card.value}
                  </h2>

                  <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                    {card.description}
                  </p>

                </article>
              ))}

            </section>

            {/* My Events */}
            <section className="mt-8 min-w-0 sm:mt-10">

              {/* Events Heading */}
              <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <h2 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">
                    My Events
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    Manage your events and their registered attendees.
                  </p>

                </div>

                <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
                  {events.length} Events
                </span>

              </div>

              {/* Empty Events State */}
              {events.length === 0 ? (

                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12">

                  <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    No events created yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
                    Create your first event to start managing attendees.
                  </p>

                  <Link
                    to="/organizer/events/create"
                    className="mt-5 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                  >
                    Create Your First Event
                  </Link>

                </div>

              ) : (

                /* Event Cards */
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">

                  {events.map((event) => (
                    <article
                      key={event.id}
                      className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md sm:p-6"
                    >

                      {/* Event Header */}
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0">

                          <h3 className="break-words text-lg font-bold leading-snug text-gray-900 sm:text-xl">
                            {event.title}
                          </h3>

                          <span className="mt-2 inline-flex max-w-full items-center break-words rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {event.category || "Other"}
                          </span>

                        </div>

                        <span className="w-fit shrink-0 break-words text-xs font-medium text-gray-500 sm:text-sm">
                          Event #{event.id}
                        </span>

                      </div>

                      {/* Event Information */}
                      <div className="mt-5 min-w-0 space-y-3 text-sm text-gray-600">

                        <p className="min-w-0 break-words leading-relaxed">
                          <span className="font-semibold text-gray-800">
                            Date:
                          </span>{" "}
                          {formatDate(event.date)}
                        </p>

                        <p className="min-w-0 break-words leading-relaxed">
                          <span className="font-semibold text-gray-800">
                            Venue:
                          </span>{" "}
                          {event.location}
                        </p>

                        <p className="min-w-0 break-words leading-relaxed">
                          <span className="font-semibold text-gray-800">
                            Capacity:
                          </span>{" "}
                          {event.capacity} people
                        </p>

                      </div>

                      {/* Event Action Buttons */}
                      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap">

                        <Link
                          to={`/organizer/events/${event.id}/attendees`}
                          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                        >
                          Manage Attendees
                        </Link>

                        <Link
                          to={`/events/${event.id}`}
                          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 sm:w-auto"
                        >
                          View Event
                        </Link>

                      </div>

                    </article>
                  ))}

                </div>

              )}

            </section>

            {/* Welcome Section */}
            <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">

              <h2 className="break-words text-lg font-semibold text-gray-900 sm:text-xl">
                Welcome to your Organizer Portal
              </h2>

              <p className="mt-2 text-sm leading-7 text-gray-600 sm:text-base">
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
