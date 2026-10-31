
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
}) {
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(ticketTypes.map((ticket) => [ticket.id, 0]))
  );

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
        line_subtotal: Math.round(price * quantity * 100) / 100,
      };
    });

  const subtotal =
    Math.round(
      selectedTickets.reduce(
        (sum, ticket) => sum + ticket.line_subtotal,
        0
      ) * 100
    ) / 100;

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
      >
        {/* Modal heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="ticket-modal-title"
              className="text-2xl font-bold text-gray-900"
            >
              Select Tickets
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose the quantity for each ticket tier.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close ticket selection"
            className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* Ticket tiers */}
        <div className="mt-6 space-y-4">
          {ticketTypes.length === 0 && (
            <p className="rounded-lg bg-gray-50 p-4 text-gray-600">
              No ticket tiers are available for this event.
            </p>
          )}

          {ticketTypes.map((ticket) => {
            const quantity = Number(quantities[ticket.id]) || 0;
            const available = Number(ticket.available_quantity) || 0;
            const soldOut = available <= 0;

            return (
              <article
                key={ticket.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {ticket.tier_name}
                  </h3>

                  <p className="mt-1 font-medium text-blue-600">
                    {formatMoney(Number(ticket.price))}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {soldOut ? "Sold out" : `${available} available`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => changeQuantity(ticket, -1)}
                    disabled={quantity <= 0}
                    aria-label={`Remove one ${ticket.tier_name} ticket`}
                    className="h-10 w-10 rounded-lg border border-gray-300 text-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <span
                    className="w-8 text-center font-semibold tabular-nums"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => changeQuantity(ticket, 1)}
                    disabled={soldOut || quantity >= available}
                    aria-label={`Add one ${ticket.tier_name} ticket`}
                    className="h-10 w-10 rounded-lg bg-blue-600 text-lg text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Live price calculation */}
        <section
          aria-label="Order total"
          className="mt-6 rounded-xl bg-gray-50 p-5"
        >
          <div className="flex justify-between gap-4 py-2 text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatMoney(subtotal)}
            </span>
          </div>

          <div className="flex justify-between gap-4 py-2 text-sm text-gray-600">
            <span>Tax ({TAX_RATE * 100}%)</span>
            <span className="font-medium text-gray-900">
              {formatMoney(tax)}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-4 border-t border-gray-200 pt-4">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-blue-600">
              {formatMoney(total)}
            </span>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Tax is shown at an example rate of 18%. The final applicable
            rate must be confirmed before payment.
          </p>
        </section>

        {/* Modal actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={selectedTickets.length === 0}
            onClick={() => onConfirm(selectedTickets)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Selection
          </button>
        </div>
      </section>
    </div>
  );
}
