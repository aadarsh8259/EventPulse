export default function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">EventPulse</h2>
            <p className="mt-1 text-sm text-gray-400">
              Discover. Connect. Experience.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} EventPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}