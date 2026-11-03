
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import apiClient from "../api/client";

export default function EventCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    capacity: "",
    category: "Technology",
  });

  const [ticketTypes, setTicketTypes] = useState([
    {
      tier_name: "General",
      price: "",
      total_quantity: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Minimum date/time for the event.
  const minDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  // Update event fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  // Update ticket tier fields.
  const handleTicketChange = (index, field, value) => {
    setTicketTypes((current) =>
      current.map((ticket, i) =>
        i === index
          ? { ...ticket, [field]: value }
          : ticket
      )
    );

    setError("");
  };

  // Add another ticket tier.
  const addTicketTier = () => {
    setTicketTypes((current) => [
      ...current,
      {
        tier_name: "",
        price: "",
        total_quantity: "",
      },
    ]);

    setError("");
  };

  // Remove a ticket tier.
  const removeTicketTier = (index) => {
    setTicketTypes((current) =>
      current.filter((_, i) => i !== index)
    );

    setError("");
  };

  // Validate the form.
  const validateForm = () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.location.trim() ||
      !formData.date ||
      !formData.capacity
    ) {
      return "Please fill in all event details.";
    }

    if (new Date(formData.date) <= new Date()) {
      return "Event date must be in the future.";
    }

    const capacity = Number(formData.capacity);

    if (!Number.isInteger(capacity) || capacity < 1) {
      return "Event capacity must be a positive whole number.";
    }

    if (ticketTypes.length === 0) {
      return "Add at least one ticket tier.";
    }

    for (const ticket of ticketTypes) {
      if (!ticket.tier_name.trim()) {
        return "Every ticket tier must have a name.";
      }

      if (
        ticket.price === "" ||
        !Number.isFinite(Number(ticket.price)) ||
        Number(ticket.price) < 0
      ) {
        return "Enter a valid ticket price for every tier.";
      }

      const quantity = Number(ticket.total_quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return "Every ticket tier must have at least one ticket.";
      }
    }

    const totalTickets = ticketTypes.reduce(
      (sum, ticket) =>
        sum + Number(ticket.total_quantity),
      0
    );

    if (totalTickets > capacity) {
      return "Total ticket quantities cannot exceed event capacity.";
    }

    return "";
  };

  // Submit event to Django.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: new Date(formData.date).toISOString(),
        capacity: Number(formData.capacity),
        category: formData.category,

        ticket_types: ticketTypes.map((ticket) => ({
          tier_name: ticket.tier_name.trim(),
          price: Number(ticket.price).toFixed(2),
          total_quantity: Number(ticket.total_quantity),
        })),
      };

      const response = await apiClient.post(
        "/events/",
        payload
      );

      // Open newly created event.
      navigate(`/events/${response.data.id}`);

    } catch (err) {
      const backendErrors = err.response?.data;

      if (backendErrors?.detail) {
        setError(backendErrors.detail);

      } else if (backendErrors) {
        const messages = Object.entries(backendErrors).map(
          ([field, value]) => {
            const message = Array.isArray(value)
              ? value
                  .map((item) =>
                    typeof item === "string"
                      ? item
                      : JSON.stringify(item)
                  )
                  .join(", ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);

            return `${field}: ${message}`;
          }
        );

        setError(messages.join(" | "));

      } else {
        setError(
          "Unable to create event. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

      <div className="mx-auto w-full max-w-4xl min-w-0">

        {/* Page Heading */}
        <div className="mb-6 sm:mb-8">

          <Link
            to="/organizer/dashboard"
            className="inline-flex min-h-10 items-center text-sm font-medium text-blue-600 transition hover:text-blue-800 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 break-words text-2xl font-bold leading-tight text-gray-900 sm:mt-5 sm:text-3xl lg:text-4xl">
            Create New Event
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
            Enter your event details and configure ticket tiers.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-7"
        >

          {/* Event Information */}
          <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">

            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Event Information
            </h2>

            <div className="mt-5 space-y-5 sm:mt-6">

              {/* Event Title */}
              <div className="min-w-0">

                <label
                  htmlFor="event-title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Event Title
                </label>

                <input
                  id="event-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  maxLength={200}
                  required
                  className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Event Description */}
              <div className="min-w-0">

                <label
                  htmlFor="event-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Event Description
                </label>

                <textarea
                  id="event-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  rows={5}
                  required
                  className="min-h-32 w-full min-w-0 resize-y rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Category */}
              <div className="min-w-0">

                <label
                  htmlFor="event-category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <select
                  id="event-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Technology">Technology</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Other">Other</option>
                </select>

              </div>

            </div>
          </section>

          {/* Venue and Schedule */}
          <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">

            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Venue & Schedule
            </h2>

            <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 sm:mt-6 sm:grid-cols-2">

              {/* Venue */}
              <div className="min-w-0 sm:col-span-2">

                <label
                  htmlFor="event-location"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Venue / Location
                </label>

                <input
                  id="event-location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter venue address"
                  maxLength={255}
                  required
                  className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Date and Time */}
              <div className="min-w-0">

                <label
                  htmlFor="event-date"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Event Date & Time
                </label>

                <input
                  id="event-date"
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  min={minDateTime}
                  onChange={handleChange}
                  required
                  className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-base"
                />

              </div>

              {/* Capacity */}
              <div className="min-w-0">

                <label
                  htmlFor="event-capacity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Maximum Event Capacity
                </label>

                <input
                  id="event-capacity"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Example: 150"
                  min="1"
                  step="1"
                  required
                  className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>
          </section>

          {/* Ticket Tiers */}
          <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">

            {/* Ticket Section Header */}
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  Ticket Tiers
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Configure the prices and quantities of your tickets.
                </p>

              </div>

              <button
                type="button"
                onClick={addTicketTier}
                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 sm:w-auto"
              >
                + Add Ticket Tier
              </button>

            </div>

            {/* Ticket Tier Cards */}
            <div className="mt-6 min-w-0 space-y-4 sm:space-y-5">

              {ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5"
                >

                  {/* Tier Header */}
                  <div className="mb-5 flex min-w-0 items-center justify-between gap-3">

                    <h3 className="min-w-0 break-words text-sm font-semibold text-gray-900 sm:text-base">
                      Ticket Tier {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeTicketTier(index)}
                      className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                    >
                      Remove
                    </button>

                  </div>

                  {/* Responsive Ticket Fields */}
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Tier Name */}
                    <div className="min-w-0">

                      <label
                        htmlFor={`ticket-tier-${index}-name`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Tier Name
                      </label>

                      <input
                        id={`ticket-tier-${index}-name`}
                        type="text"
                        value={ticket.tier_name}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "tier_name",
                            event.target.value
                          )
                        }
                        placeholder="VIP / General"
                        maxLength={100}
                        required
                        className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    {/* Ticket Price */}
                    <div className="min-w-0">

                      <label
                        htmlFor={`ticket-tier-${index}-price`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Price (₹)
                      </label>

                      <input
                        id={`ticket-tier-${index}-price`}
                        type="number"
                        value={ticket.price}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "price",
                            event.target.value
                          )
                        }
                        placeholder="999"
                        min="0"
                        step="0.01"
                        required
                        className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    {/* Ticket Quantity */}
                    <div className="min-w-0 sm:col-span-2 lg:col-span-1">

                      <label
                        htmlFor={`ticket-tier-${index}-quantity`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Quantity
                      </label>

                      <input
                        id={`ticket-tier-${index}-quantity`}
                        type="number"
                        value={ticket.total_quantity}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "total_quantity",
                            event.target.value
                          )
                        }
                        placeholder="50"
                        min="1"
                        step="1"
                        required
                        className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>

                </div>
              ))}

            </div>

            <p className="mt-5 text-xs leading-relaxed text-gray-500 sm:text-sm">
              Total ticket quantities must not exceed your event capacity.
            </p>

          </section>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="min-w-0 break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
            >
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              to="/organizer/dashboard"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Creating Event..." : "Create Event"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}
