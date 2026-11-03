
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-gray-800 bg-gray-900 text-white">

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6 sm:py-10 md:flex-row md:justify-between md:text-left lg:px-8">

        {/* Brand information */}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold sm:text-xl">
            EventPulse
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Discover. Connect. Experience.
          </p>
        </div>

        {/* Copyright */}
        <p className="text-xs leading-5 text-gray-400 sm:text-sm">
          © {currentYear} EventPulse. All rights reserved.
        </p>

      </div>

    </footer>
  );
}
