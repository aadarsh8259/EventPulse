
import { useEffect, useState } from "react";
import { Link } from "react-router";
import apiClient from "../api/client";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // STEP 7: Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/events/");
        const data = response.data;

        const uniqueCategories = [
          ...new Set(
            data.map((event) => event.category).filter(Boolean)
          ),
        ];

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Could not load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // STEP 8: Fetch filtered events
  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (category) {
          params.category = category;
        }

        const response = await apiClient.get("/events/", {
          params,
        });

        if (!cancelled) {
          setEvents(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load events. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchEvents, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, category]);

  // STEP 9, 10 AND 11: Render the page
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Discover Events
        </h1>

        <p className="mt-2 text-gray-600">
          Find your next experience with EventPulse.
        </p>

        {/* Search and category filters */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events..."
            aria-label="Search events"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter events by category"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700"
          >
            <option value="">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <p className="py-12 text-center text-gray-600">
            Loading events...
          </p>
        )}

        {/* Error state */}
        {!loading && error && (
          <p role="alert" className="py-12 text-center text-red-600">
            {error}
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="py-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No events found
            </h2>

            <p className="mt-2 text-gray-600">
              Try another search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Responsive event cards */}
        {!loading && !error && events.length > 0 && (
          <>
            <p className="mt-6 text-sm text-gray-600">
              {events.length} event
              {events.length !== 1 ? "s" : ""} found
            </p>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {event.category || "Other"}
                  </span>

                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    {event.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                    {event.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>📍 {event.location}</p>

                    <p>
                      📅{" "}
                      {new Date(event.date).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    <p>👥 Capacity: {event.capacity}</p>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="mt-5 block rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
                  >
                    View Event
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}