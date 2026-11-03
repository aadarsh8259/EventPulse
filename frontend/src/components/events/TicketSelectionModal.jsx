
import { useState } from "react";

const TAX_RATE = 0.18; // Example only: 18% tax

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

export default function TicketSelectionModal({
  ticketTypes = [],
  onClose,
  onConfirm,
  isSubmitting = false,
  errorMessage = "",
}) {
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(
      ticketTypes.map((ticket) => [ticket.id, 0])
    )
  );

  // Update selected ticket quantity.
  const changeQuantity = (ticket, change) => {
    const available = Number(ticket.available_quantity) || 0;

    setQuantities((current) => {
      const currentQuantity = Number(current[ticket.id]) || 0;

      const nextQuantity = Math.max(
        0,
        Math.min(available, currentQuantity + change)
      );

      return {
        ...current,
        [ticket.id]: nextQuantity,
      };
    });
  };

  // Get selected tickets.
  const selectedTickets = ticketTypes
    .filter((ticket) => Number(quantities[ticket.id]) > 0)
    .map((ticket) => {
      const quantity = Number(quantities[ticket.id]);
      const price = Number(ticket.price);

      return {
        id: ticket.id,
        tier_name: ticket.tier_name,
        price,
        quantity,
        line_subtotal:
          Math.round(price * quantity * 100) / 100,
      };
    });

  // Calculate subtotal.
  const subtotal =
    Math.round(
      selectedTickets.reduce(
        (sum, ticket) => sum + ticket.line_subtotal,
        0
      ) * 100
    ) / 100;

  // Calculate tax and final total.
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

  const total = Math.round(
    (subtotal + tax) * 100
  ) / 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/60 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
        aria-describedby="ticket-modal-description"
        onClick={(event) => event.stopPropagation()}
        className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
      >

        {/* Modal Heading */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 p-4 sm:p-6 md:p-7">

          <div className="min-w-0">

            <h2
              id="ticket-modal-title"
              className="break-words text-xl font-bold text-gray-900 sm:text-2xl"
            >
              Select Tickets
            </h2>

            <p
              id="ticket-modal-description"
              className="mt-1 text-sm leading-relaxed text-gray-500"
            >
              Choose the quantity for each ticket tier.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close ticket selection"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>

        </div>

        {/* Scrollable Modal Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">

          {/* Ticket Tiers */}
          <div className="space-y-3 sm:space-y-4">

            {ticketTypes.length === 0 && (
              <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
                No ticket tiers are available for this event.
              </p>
            )}

            {ticketTypes.map((ticket) => {
              const quantity =
                Number(quantities[ticket.id]) || 0;

              const available =
                Number(ticket.available_quantity) || 0;

              const soldOut = available <= 0;

              return (
                <article
                  key={ticket.id}
                  className="flex min-w-0 flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5"
                >

                  {/* Ticket Information */}
                  <div className="min-w-0 flex-1">

                    <h3 className="break-words text-base font-semibold text-gray-900 sm:text-lg">
                      {ticket.tier_name}
                    </h3>

                    <p className="mt-1 text-base font-semibold text-blue-600 sm:text-lg">
                      {formatMoney(Number(ticket.price))}
                    </p>

                    <p className={`mt-1 text-xs font-medium sm:text-sm ${
                      soldOut
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}>
                      {soldOut
                        ? "Sold out"
                        : `${available} available`}
                    </p>

                  </div>

                  {/* Quantity Controls */}
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">

                    <span className="text-xs font-medium text-gray-500 sm:hidden">
                      Quantity
                    </span>

                    <div className="flex shrink-0 items-center gap-3">

                      {/* Decrease Quantity */}
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(ticket, -1)
                        }
                        disabled={quantity <= 0 || isSubmitting}
                        aria-label={`Remove one ${ticket.tier_name} ticket`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 text-xl font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>

                      {/* Selected Quantity */}
                      <span
                        className="w-8 text-center text-base font-semibold tabular-nums text-gray-900"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {quantity}
                      </span>

                      {/* Increase Quantity */}
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(ticket, 1)
                        }
                        disabled={
                          soldOut ||
                          quantity >= available ||
                          isSubmitting
                        }
                        aria-label={`Add one ${ticket.tier_name} ticket`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

          {/* Order Summary */}
          <section
            aria-label="Order total"
            className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:mt-6 sm:p-5"
          >

            <h3 className="mb-3 text-base font-bold text-gray-900">
              Order Summary
            </h3>

            <div className="flex justify-between gap-4 py-2 text-sm text-gray-600">

              <span>Subtotal</span>

              <span className="shrink-0 font-medium text-gray-900">
                {formatMoney(subtotal)}
              </span>

            </div>

            <div className="flex justify-between gap-4 py-2 text-sm text-gray-600">

              <span>Tax ({TAX_RATE * 100}%)</span>

              <span className="shrink-0 font-medium text-gray-900">
                {formatMoney(tax)}
              </span>

            </div>

            <div className="mt-2 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">

              <span className="font-bold text-gray-900">
                Total
              </span>

              <span className="shrink-0 break-words text-xl font-bold text-blue-600 sm:text-2xl">
                {formatMoney(total)}
              </span>

            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Tax is shown at an example rate of 18%. The final applicable
              rate must be confirmed before payment.
            </p>

          </section>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-4 break-words rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4"
            >
              <p className="text-sm leading-relaxed text-red-700">
                {errorMessage}
              </p>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-white p-4 sm:flex-row sm:justify-end sm:p-6">

          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-base"
          >
            Cancel
          </button>

          {/* Confirm Selection */}
          <button
            type="button"
            disabled={
              selectedTickets.length === 0 ||
              isSubmitting
            }
            onClick={() => onConfirm(selectedTickets)}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-base"
          >
            {isSubmitting
              ? "Processing Booking..."
              : "Confirm Selection"}
          </button>

        </div>

      </section>

    </div>
  );
}
