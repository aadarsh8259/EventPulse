
import { useState } from "react";
import { NavLink } from "react-router";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `block w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
    }`;

  return (
    <header className="relative z-50 w-full border-b border-gray-200 bg-white shadow-sm">

      {/* Navbar container */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <NavLink
          to="/"
          onClick={closeMenu}
          className="shrink-0 text-xl font-bold text-blue-600 transition sm:text-2xl"
        >
          EventPulse
        </NavLink>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-2 md:flex">

          <NavLink to="/" end className={navLinkClass}>
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
          onClick={() => setIsOpen((previous) => !previous)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-2xl text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? "✕" : "☰"}
        </button>

      </div>

      {/* Mobile navigation */}
      <nav
        id="mobile-navigation"
        className={`absolute left-0 top-full w-full border-t border-gray-200 bg-white shadow-lg transition-all duration-200 md:hidden ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0 pointer-events-none"
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-4 sm:px-6">

          <NavLink
            to="/"
            end
            className={navLinkClass}
            onClick={closeMenu}
            tabIndex={isOpen ? 0 : -1}
          >
            Home
          </NavLink>

          <NavLink
            to="/events"
            className={navLinkClass}
            onClick={closeMenu}
            tabIndex={isOpen ? 0 : -1}
          >
            Events
          </NavLink>

          <NavLink
            to="/login"
            className={navLinkClass}
            onClick={closeMenu}
            tabIndex={isOpen ? 0 : -1}
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className={navLinkClass}
            onClick={closeMenu}
            tabIndex={isOpen ? 0 : -1}
          >
            Register
          </NavLink>

        </div>
      </nav>

    </header>
  );
}
