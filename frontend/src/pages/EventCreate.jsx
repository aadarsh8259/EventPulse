
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

  // Minimum date/time for the event
  const minDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  ).toISOString().slice(0, 16);

  // Update event fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Update ticket tier fields
  const handleTicketChange = (index, field, value) => {
    setTicketTypes((current) =>
      current.map((ticket, i) =>
        i === index
          ? { ...ticket, [field]: value }
          : ticket
      )
    );
  };

  // Add another ticket tier
  const addTicketTier = () => {
    setTicketTypes((current) => [
      ...current,
      {
        tier_name: "",
        price: "",
        total_quantity: "",
      },
    ]);
  };

  // Remove a ticket tier
  const removeTicketTier = (index) => {
    setTicketTypes((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // Validate the form
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
      (sum, ticket) => sum + Number(ticket.total_quantity),
      0
    );

    if (totalTickets > capacity) {
      return "Total ticket quantities cannot exceed event capacity.";
    }

    return "";
  };

  // Submit event to Django
  const handleSubmit = async (event) => {
    event.preventDefault();

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

      // Open newly created event
      navigate(`/events/${response.data.id}`);

    } catch (err) {
      const backendErrors = err.response?.data;

      if (backendErrors?.detail) {
        setError(backendErrors.detail);
      } else if (backendErrors) {
        const messages = Object.entries(backendErrors).map(
          ([field, value]) => {
            const message = Array.isArray(value)
              ? value.map((item) =>
                  typeof item === "string"
                    ? item
                    : JSON.stringify(item)
                ).join(", ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);

            return `${field}: ${message}`;
          }
        );

        setError(messages.join(" | "));
      } else {
        setError("Unable to create event. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Heading */}
        <div className="mb-8">
          <Link
            to="/organizer/dashboard"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Create New Event
          </h1>

          <p className="mt-2 text-gray-600">
            Enter your event details and configure ticket tiers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Event information */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-bold text-gray-900">
              Event Information
            </h2>

            <div className="mt-6 space-y-5">

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Event Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  maxLength={200}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Event Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  rows={5}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
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

          {/* Venue and schedule */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-bold text-gray-900">
              Venue & Schedule
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Venue / Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter venue address"
                  maxLength={255}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Event Date & Time
                </label>

                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  min={minDateTime}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Maximum Event Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Example: 150"
                  min="1"
                  step="1"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

            </div>
          </section>

          {/* Ticket tiers */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ticket Tiers
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure the prices and quantities of your tickets.
                </p>
              </div>

              <button
                type="button"
                onClick={addTicketTier}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                + Add Ticket Tier
              </button>
            </div>

            <div className="mt-6 space-y-5">

              {ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Ticket Tier {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeTicketTier(index)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Tier Name
                      </label>

                      <input
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
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Price (₹)
                      </label>

                      <input
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
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Quantity
                      </label>

                      <input
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
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                      />
                    </div>

                  </div>
                </div>
              ))}

            </div>

            <p className="mt-4 text-sm text-gray-500">
              Total ticket quantities must not exceed your event capacity.
            </p>

          </section>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              to="/organizer/dashboard"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Event..." : "Create Event"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}
