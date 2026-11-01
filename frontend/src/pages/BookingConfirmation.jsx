
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import apiClient from "../api/client";

export default function BookingConfirmation() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);

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

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading your booking pass...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[60vh] bg-gray-50 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {error}
        </h1>

        <Link
          to="/events"
          className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
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
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
            ✓
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Booking Confirmed!
          </h1>

          <p className="mt-2 text-gray-600">
            Your EventPulse booking has been successfully created.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                EventPulse
              </h2>

              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                DIGITAL PASS
              </span>
            </div>

            <p className="mt-6 text-sm text-blue-100">
              EVENT
            </p>

            <h3 className="mt-1 text-3xl font-bold">
              {ticket?.event_title || "Event"}
            </h3>

            <p className="mt-3 text-blue-100">
              {ticket?.event_location || "Venue unavailable"}
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-500">
                Booking Status
              </span>

              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  isConfirmed
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {booking.booking_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Booking ID
                </p>
                <p className="mt-2 font-bold text-gray-900">
                  #{booking.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Ticket Tier
                </p>
                <p className="mt-2 font-bold text-gray-900">
                  {ticket?.tier_name || "Ticket"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Quantity
                </p>
                <p className="mt-2 font-bold text-gray-900">
                  {booking.quantity}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Price Per Ticket
                </p>
                <p className="mt-2 font-bold text-gray-900">
                  {formatMoney(ticket?.price)}
                </p>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 pt-5">
              <p className="text-xs font-medium uppercase text-gray-500">
                Event Date & Time
              </p>
              <p className="mt-2 font-semibold text-gray-900">
                {formatDate(ticket?.event_date)}
              </p>
            </div>

            <div className="border-t border-dashed border-gray-300 pt-5">
              <p className="text-xs font-medium uppercase text-gray-500">
                Booking Date
              </p>
              <p className="mt-2 text-gray-900">
                {formatDate(booking.booked_at)}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-gray-700">
                  Total Amount
                </span>

                <span className="text-2xl font-bold text-blue-700">
                  {formatMoney(booking.total_amount)}
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              Please keep this booking ID for future reference.
            </p>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Print Booking Pass
          </button>

          <Link
            to="/events"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
          >
            Explore More Events
          </Link>
        </div>
      </div>
    </main>
  );
}
