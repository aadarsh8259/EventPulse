import { useState } from "react";
import { NavLink } from "react-router";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-bold text-blue-600">
          EventPulse
        </NavLink>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/events" className={navLinkClass}>
            Events
          </NavLink>

          <NavLink to="/login" className={navLinkClass}>
            Login
          </NavLink>

          <NavLink to="/register" className={navLinkClass}>
            Register
          </NavLink>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <nav className="border-t px-4 py-3 md:hidden">
          <div className="space-y-1">
            <NavLink
              to="/"
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/events"
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Events
            </NavLink>

            <NavLink
              to="/login"
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Register
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}