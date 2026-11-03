
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import apiClient from "../api/client";

export default function BookingConfirmation() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch booking information.
  useEffect(() => {
    let cancelled = false;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(`/bookings/${id}/`);

        if (!cancelled) {
          setBooking(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError("Booking not found.");
          } else if (err.response?.status === 401) {
            setError("Please log in to view your booking pass.");
          } else {
            setError("Unable to load booking confirmation.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBooking();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Format currency.
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);

  // Format event and booking dates.
  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Loading State.
  if (loading) {
    return (
      <main className="flex min-h-[60vh] w-full items-center justify-center bg-gray-50 px-4 py-10">
        <p className="text-center text-sm text-gray-600 sm:text-base">
          Loading your booking pass...
        </p>
      </main>
    );
  }

  // Error State.
  if (error) {
    return (
      <main className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center">

        <h1 className="max-w-lg break-words text-2xl font-bold text-gray-900 sm:text-3xl">
          {error}
        </h1>

        <Link
          to="/events"
          className="mt-5 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
        >
          Browse Events
        </Link>

      </main>
    );
  }

  if (!booking) return null;

  const ticket = booking.ticket_type;

  const isConfirmed =
    booking.booking_status?.toUpperCase() === "CONFIRMED";

  return (
    <main className="min-h-screen w-full bg-gray-50 px-4 py-7 sm:px-6 sm:py-10 lg:py-12 print:min-h-0 print:bg-white print:p-0">

      <div className="mx-auto w-full max-w-2xl min-w-0">

        {/* Confirmation Heading */}
        <div className="mb-7 text-center sm:mb-8 print:hidden">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-600 sm:h-16 sm:w-16">
            ✓
          </div>

          <h1 className="mt-4 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
            Booking Confirmed!
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base">
            Your EventPulse booking has been successfully created.
          </p>

        </div>

        {/* Digital Booking Pass */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg print:rounded-none print:border print:shadow-none">

          {/* Pass Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white sm:p-8 print:bg-blue-700">

            <div className="flex min-w-0 items-center justify-between gap-3">

              <h2 className="text-lg font-bold sm:text-xl">
                EventPulse
              </h2>

              <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold tracking-wider sm:px-3 sm:text-xs">
                DIGITAL PASS
              </span>

            </div>

            <div className="mt-6 min-w-0 sm:mt-8">

              <p className="text-xs font-medium uppercase tracking-wider text-blue-100 sm:text-sm">
                Event
              </p>

              <h3 className="mt-2 break-words text-2xl font-bold leading-tight sm:text-3xl">
                {ticket?.event_title || "Event"}
              </h3>

              <p className="mt-3 break-words text-sm leading-relaxed text-blue-100 sm:text-base">
                {ticket?.event_location || "Venue unavailable"}
              </p>

            </div>

          </div>

          {/* Pass Details */}
          <div className="space-y-5 p-4 sm:space-y-6 sm:p-7 md:p-8">

            {/* Booking Status */}
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">

              <span className="text-sm font-medium text-gray-500">
                Booking Status
              </span>

              <span
                className={`inline-flex max-w-full break-words rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                  isConfirmed
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {booking.booking_status}
              </span>

            </div>

            {/* Booking Details Grid */}
            <div className="grid min-w-0 grid-cols-1 gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">

              {/* Booking ID */}
              <div className="min-w-0">

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Booking ID
                </p>

                <p className="mt-2 break-all text-base font-bold text-gray-900 sm:text-lg">
                  #{booking.id}
                </p>

              </div>

              {/* Ticket Tier */}
              <div className="min-w-0">

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ticket Tier
                </p>

                <p className="mt-2 break-words text-base font-bold text-gray-900 sm:text-lg">
                  {ticket?.tier_name || "Ticket"}
                </p>

              </div>

              {/* Quantity */}
              <div className="min-w-0">

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Quantity
                </p>

                <p className="mt-2 text-base font-bold text-gray-900 sm:text-lg">
                  {booking.quantity}
                </p>

              </div>

              {/* Price Per Ticket */}
              <div className="min-w-0">

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price Per Ticket
                </p>

                <p className="mt-2 break-words text-base font-bold text-gray-900 sm:text-lg">
                  {formatMoney(ticket?.price)}
                </p>

              </div>

            </div>

            {/* Event Date */}
            <div className="min-w-0 border-t border-dashed border-gray-300 pt-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Event Date & Time
              </p>

              <p className="mt-2 break-words text-sm font-semibold leading-relaxed text-gray-900 sm:text-base">
                {formatDate(ticket?.event_date)}
              </p>

            </div>

            {/* Booking Date */}
            <div className="min-w-0 border-t border-dashed border-gray-300 pt-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Booking Date
              </p>

              <p className="mt-2 break-words text-sm leading-relaxed text-gray-900 sm:text-base">
                {formatDate(booking.booked_at)}
              </p>

            </div>

            {/* Total Amount */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm font-semibold text-gray-700 sm:text-base">
                  Total Amount
                </span>

                <span className="break-words text-2xl font-bold text-blue-700 sm:text-2xl">
                  {formatMoney(booking.total_amount)}
                </span>

              </div>

            </div>

            {/* Booking Reminder */}
            <p className="break-words text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
              Please keep this booking ID for future reference.
            </p>

          </div>

        </section>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-12 w-full flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-base"
          >
            Print Booking Pass
          </button>

          <Link
            to="/events"
            className="inline-flex min-h-12 w-full flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:text-base"
          >
            Explore More Events
          </Link>

        </div>

      </div>

    </main>
  );
}
