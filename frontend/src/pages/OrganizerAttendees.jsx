
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import apiClient from "../api/client";


export default function OrganizerAttendees() {
  const { eventId } = useParams();

  const [attendees, setAttendees] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Fetch attendees whenever the event or search changes.
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const response = await apiClient.get(
          `/organizer/events/${eventId}/attendees/`,
          {
            params: {
              search: search.trim(),
            },
          }
        );

        if (!cancelled) {
          setAttendees(response.data.attendees || []);
          setEventTitle(response.data.event_title || "");
          setTotalTickets(response.data.total_tickets || 0);
          setTotalRecords(response.data.total_records || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            "Unable to load attendee information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [eventId, search]);

  // Format amount in Indian currency.
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  // Format booking date.
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Download the current filtered attendee list.
  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      const response = await apiClient.get(
        `/organizer/events/${eventId}/attendees/`,
        {
          params: {
            format: "csv",
            search: search.trim(),
          },
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        { type: "text/csv;charset=utf-8;" }
      );

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `event-${eventId}-attendees.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      console.error(
        "CSV export error:",
        err.response?.data || err.message
      );

      setError("Unable to export attendee records.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Back navigation */}
        <Link
          to="/organizer/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </Link>

        {/* Page heading */}
        <div className="mb-8 mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            EventPulse Organizer
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Attendee Management
          </h1>

          <p className="mt-2 text-gray-600">
            {eventTitle || `Event #${eventId}`}
            {" — "}
            Manage registered attendees and bookings.
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Booking Records
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "..." : totalRecords}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Tickets Booked
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "..." : totalTickets}
            </h2>
          </div>

        </div>

        {/* Search and export */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username, email or ticket tier..."
            aria-label="Search attendees"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? "Exporting..." : "↓ Export CSV"}
          </button>

        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {/* Attendee table */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Attendees
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Loading attendee records..."
                : `${attendees.length} records displayed`}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading attendee information...
            </div>
          ) : error && attendees.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              Attendee records could not be loaded.
            </div>
          ) : attendees.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No attendee records found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-left text-sm">

                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-5 py-4">Booking ID</th>
                    <th className="px-5 py-4">Attendee</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Ticket Tier</th>
                    <th className="px-5 py-4">Quantity</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Booking Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {attendees.map((attendee) => {
                    const isConfirmed =
                      attendee.booking_status?.toUpperCase() === "CONFIRMED";

                    return (
                      <tr
                        key={attendee.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 font-medium text-gray-900">
                          #{attendee.id}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-900">
                          {attendee.attendee_username}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {attendee.attendee_email}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {attendee.ticket_tier}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {attendee.quantity}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-900">
                          {formatCurrency(attendee.total_amount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isConfirmed
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {attendee.booking_status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {formatDate(attendee.booked_at)}
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-4 text-xs text-gray-500">
          Each row represents one booking. The quantity column shows
          how many tickets were included in that booking.
        </p>

      </div>
    </main>
  );
}
