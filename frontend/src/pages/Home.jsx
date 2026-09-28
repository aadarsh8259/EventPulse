import { useToast } from "../context/ToastContext";

export default function Home() {
  const { showToast } = useToast();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">
        EventPulse
      </h1>

      <p className="mt-2 text-gray-600">
        Discover and book events.
      </p>

      <button
        type="button"
        onClick={() =>
          showToast(
            "Welcome to EventPulse!",
            "success"
          )
        }
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Show Toast
      </button>
    </div>
  );
}