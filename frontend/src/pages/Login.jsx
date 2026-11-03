
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import apiClient from "../api/client";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update input values.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle login.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Send login credentials to Django JWT endpoint.
      const response = await apiClient.post("/token/", {
        username: formData.username,
        password: formData.password,
      });

      const { access, refresh } = response.data;

      // Verify authentication tokens.
      if (!access || !refresh) {
        throw new Error(
          "Login response did not contain valid authentication tokens."
        );
      }

      // Store JWT tokens.
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Redirect after successful login.
      navigate("/organizer/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "Login error:",
        err.response?.data || err.message
      );

      const responseData = err.response?.data;

      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Unable to log in. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">

      {/* Login card */}
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-lg sm:rounded-3xl sm:p-8 lg:p-10">

        {/* Heading */}
        <div className="mb-7 text-center sm:mb-8">

          <h1 className="break-words text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Welcome Back
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
            Log in to your EventPulse account.
          </p>

        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6"
        >

          {/* Username */}
          <div className="min-w-0">

            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-gray-800 sm:text-base"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-base"
            />

          </div>

          {/* Password */}
          <div className="min-w-0">

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-800 sm:text-base"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-base"
            />

          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-600 sm:p-4 sm:text-base"
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Registration Link */}
        <div className="mt-7 text-center text-sm leading-relaxed text-gray-600 sm:mt-8 sm:text-base">

          <span>Don't have an account? </span>

          <Link
            to="/register"
            className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
          >
            Create Account
          </Link>

        </div>

      </div>

    </main>
  );
}
