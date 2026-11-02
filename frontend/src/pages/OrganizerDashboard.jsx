
import { useEffect, useState } from "react";
import apiClient from "../api/client";

export default function OrganizerDashboard() {
  const [metrics, setMetrics] = useState({
    total_revenue: "0.00",
    tickets_sold: 0,
    active_events: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data from Django
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
          setMetrics(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 401) {
            setError("Please log in to access the organizer dashboard.");
          } else if (err.response?.status === 403) {
            setError("You do not have permission to access this dashboard.");
          } else {
            setError("Unable to load dashboard information.");
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

  // Format revenue in Indian currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  // Dashboard summary cards
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

        {/* Dashboard heading */}
        <div className="mb-8">
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

        {/* Summary cards */}
        {!loading && !error && (
          <>
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

            {/* Additional information */}
            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome to your Organizer Portal
              </h2>

              <p className="mt-2 leading-7 text-gray-600">
                Monitor your event performance from one place.
                Your dashboard statistics are calculated from
                your confirmed bookings and upcoming events.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
