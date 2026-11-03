
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

  // Fetch available event categories.
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/events/");
        const data = response.data;

        const uniqueCategories = [
          ...new Set(
            data.map((event) => event.category).filter(Boolean)
          ),
        ];

        if (!cancelled) {
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Could not load categories:", err);
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch events according to search and category filters.
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
        console.error("Could not load events:", err);

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

  // Format event date.
  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Clear search and category filters.
  const clearFilters = () => {
    setSearch("");
    setCategory("");
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

      <div className="mx-auto w-full max-w-7xl">

        {/* Page heading */}
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Discover Events
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg">
            Find your next experience with EventPulse.
          </p>
        </div>

        {/* Search and category filters */}
        <div className="mt-7 grid min-w-0 grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">

          {/* Search input */}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events..."
            aria-label="Search events"
            className="h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-base"
          />

          {/* Category filter */}
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter events by category"
            className="h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:w-auto sm:min-w-48 sm:text-base"
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
          <div className="py-16 text-center">
            <p className="text-sm text-gray-600 sm:text-base">
              Loading events...
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="my-8 rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-600 sm:text-base"
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="my-8 rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center sm:px-8">

            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              No events found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 sm:text-base">
              Try another search or select a different category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Clear Filters
            </button>

          </div>
        )}

        {/* Event results */}
        {!loading && !error && events.length > 0 && (
          <section className="mt-7 sm:mt-9">

            {/* Result count */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600 sm:text-base">
                <span className="font-semibold text-gray-900">
                  {events.length}
                </span>{" "}
                event{events.length !== 1 ? "s" : ""} found
              </p>

              {(search || category) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Responsive event cards */}
            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">

              {events.map((event) => (
                <article
                  key={event.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6"
                >

                  {/* Category */}
                  <div>
                    <span className="inline-block max-w-full break-words rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {event.category || "Other"}
                    </span>
                  </div>

                  {/* Event title */}
                  <h2 className="mt-4 break-words text-lg font-bold leading-snug text-gray-900 sm:text-xl">
                    {event.title}
                  </h2>

                  {/* Event description */}
                  <p className="mt-2 break-words text-sm leading-6 text-gray-600">
                    {event.description}
                  </p>

                  {/* Event information */}
                  <div className="mt-5 min-w-0 space-y-3 text-sm text-gray-600">

                    <p className="flex min-w-0 items-start gap-2">
                      <span className="shrink-0" aria-hidden="true">
                        📍
                      </span>
                      <span className="min-w-0 break-words">
                        {event.location}
                      </span>
                    </p>

                    <p className="flex min-w-0 items-start gap-2">
                      <span className="shrink-0" aria-hidden="true">
                        📅
                      </span>
                      <span className="min-w-0 break-words">
                        {formatDate(event.date)}
                      </span>
                    </p>

                    <p className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0" aria-hidden="true">
                        👥
                      </span>
                      <span>
                        Capacity: {event.capacity}
                      </span>
                    </p>

                  </div>

                  {/* View event button */}
                  <div className="mt-auto pt-6">
                    <Link
                      to={`/events/${event.id}`}
                      className="flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-base"
                    >
                      View Event
                    </Link>
                  </div>

                </article>
              ))}

            </div>
          </section>
        )}

      </div>
    </main>
  );
}
