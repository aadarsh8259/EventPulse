
import { useToast } from "../context/useToast";

export default function Home() {
  const { showToast } = useToast();

  return (
    <main className="min-h-[70vh] w-full bg-gray-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center text-center">

        {/* Home heading */}
        <div className="w-full max-w-3xl">
          <h1 className="break-words text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
            EventPulse
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:mt-5 sm:text-lg md:text-xl">
            Discover and book events.
          </p>
        </div>

        {/* Welcome Toast Button */}
        <button
          type="button"
          onClick={() =>
            showToast(
              "Welcome to EventPulse!",
              "success"
            )
          }
          className="mt-7 inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] sm:mt-8 sm:w-auto sm:min-w-40 sm:text-base"
        >
          Show Toast
        </button>

      </div>
    </main>
  );
}
