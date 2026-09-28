import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Events() {
  return (
    <div>
      <h1 className="p-8 text-3xl font-bold">
        Events
      </h1>

      <LoadingSpinner text="Loading events..." />
    </div>
  );
}