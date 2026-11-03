
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

    const timer = setTimeout(async () => {
      if (cancelled) return;

      setLoading(true);
      setError("");

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

  // Get attendee booking status styling.
  const getStatusStyle = (status) => {
    const isConfirmed =
      status?.toUpperCase() === "CONFIRMED";

    return isConfirmed
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

      <div className="mx-auto w-full max-w-7xl min-w-0">

        {/* Back Navigation */}
        <Link
          to="/organizer/dashboard"
          className="inline-flex min-h-10 items-center text-sm font-medium text-blue-600 transition hover:text-blue-800 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        {/* Page Heading */}
        <div className="mb-7 mt-5 min-w-0 sm:mb-8 sm:mt-6">

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">
            EventPulse Organizer
          </p>

          <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Attendee Management
          </h1>

          <p className="mt-2 break-words text-sm leading-relaxed text-gray-600 sm:text-base">
            {eventTitle || `Event #${eventId}`}
            {" — "}
            Manage registered attendees and bookings.
          </p>

        </div>

        {/* Summary Cards */}
        <section
          aria-label="Attendee statistics"
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
        >

          {/* Booking Records */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <p className="text-sm font-medium text-gray-500">
              Booking Records
            </p>

            <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              {loading ? "..." : totalRecords}
            </h2>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Total booking entries
            </p>

          </article>

          {/* Tickets Booked */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <p className="text-sm font-medium text-gray-500">
              Tickets Booked
            </p>

            <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              {loading ? "..." : totalTickets}
            </h2>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Total tickets included in bookings
            </p>

          </article>

        </section>

        {/* Search and Export */}
        <section className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">

          <div className="min-w-0 flex-1">

            <label
              htmlFor="attendee-search"
              className="sr-only"
            >
              Search attendees
            </label>

            <input
              id="attendee-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username, email or ticket tier..."
              aria-label="Search attendees"
              className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || loading || attendees.length === 0}
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-base"
          >
            {exporting ? "Exporting..." : "↓ Export CSV"}
          </button>

        </section>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-5 min-w-0 break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 sm:text-base"
          >
            {error}
          </div>
        )}

        {/* Registered Attendees Section */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Section Header */}
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">

            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Registered Attendees
            </h2>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {loading
                ? "Loading attendee records..."
                : `${attendees.length} records displayed`}
            </p>

          </div>

          {/* Loading State */}
          {loading ? (

            <div className="p-8 text-center sm:p-10">
              <p className="text-sm text-gray-500 sm:text-base">
                Loading attendee information...
              </p>
            </div>

          ) : error && attendees.length === 0 ? (

            /* Error State */
            <div className="p-8 text-center text-sm text-gray-500 sm:p-10 sm:text-base">
              Attendee records could not be loaded.
            </div>

          ) : attendees.length === 0 ? (

            /* Empty State */
            <div className="px-5 py-10 text-center sm:px-8">

              <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                No attendee records found
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {search
                  ? "Try changing your search keywords."
                  : "No bookings have been made for this event yet."}
              </p>

            </div>

          ) : (

            <>
              {/* Mobile and Tablet Card Layout */}
              <div className="divide-y divide-gray-100 xl:hidden">

                {attendees.map((attendee) => (
                  <article
                    key={attendee.id}
                    className="min-w-0 p-4 sm:p-5"
                  >

                    {/* Attendee Header */}
                    <div className="flex min-w-0 items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="break-words text-base font-semibold text-gray-900">
                          {attendee.attendee_username}
                        </h3>

                        <p className="mt-1 break-all text-sm text-gray-500">
                          {attendee.attendee_email}
                        </p>

                      </div>

                      <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700">
                        #{attendee.id}
                      </span>

                    </div>

                    {/* Ticket Information */}
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">

                      <div className="min-w-0">

                        <p className="text-xs font-medium text-gray-500">
                          Ticket Tier
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
                          {attendee.ticket_tier}
                        </p>

                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-medium text-gray-500">
                          Quantity
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {attendee.quantity}
                        </p>

                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-medium text-gray-500">
                          Amount
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                          {formatCurrency(attendee.total_amount)}
                        </p>

                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-medium text-gray-500">
                          Status
                        </p>

                        <div className="mt-1.5">
                          <span
                            className={`inline-flex max-w-full break-words rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              attendee.booking_status
                            )}`}
                          >
                            {attendee.booking_status || "Unknown"}
                          </span>
                        </div>

                      </div>

                    </div>

                    {/* Booking Date */}
                    <div className="mt-4 border-t border-gray-100 pt-3">

                      <p className="text-xs font-medium text-gray-500">
                        Booking Date
                      </p>

                      <p className="mt-1 break-words text-sm text-gray-700">
                        {formatDate(attendee.booked_at)}
                      </p>

                    </div>

                  </article>
                ))}

              </div>

              {/* Desktop Table Layout */}
              <div className="hidden overflow-x-auto xl:block">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="bg-gray-50 text-gray-600">

                    <tr>
                      <th className="whitespace-nowrap px-5 py-4 font-semibold">
                        Booking ID
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 font-semibold">
                        Attendee
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 font-semibold">
                        Email
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 font-semibold">
                        Ticket Tier
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 font-semibold">
                        Quantity
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 font-semibold">
                        Amount
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 font-semibold">
                        Status
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 font-semibold">
                        Booking Date
                      </th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {attendees.map((attendee) => (

                      <tr
                        key={attendee.id}
                        className="transition hover:bg-gray-50"
                      >

                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
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

                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                          {formatCurrency(attendee.total_amount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              attendee.booking_status
                            )}`}
                          >
                            {attendee.booking_status || "Unknown"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                          {formatDate(attendee.booked_at)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            </>

          )}

        </section>

        {/* Information Note */}
        <p className="mt-4 break-words text-xs leading-relaxed text-gray-500 sm:text-sm">
          Each row represents one booking. The quantity column shows
          how many tickets were included in that booking.
        </p>

      </div>

    </main>
  );
}
