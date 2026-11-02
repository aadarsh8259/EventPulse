
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

  // Update input values
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Send login credentials to Django JWT endpoint
      const response = await apiClient.post("/token/", {
        username: formData.username,
        password: formData.password,
      });

      const { access, refresh } = response.data;

      // Verify that Django returned both tokens
      if (!access || !refresh) {
        throw new Error(
          "Login response did not contain valid authentication tokens."
        );
      }

      // Store JWT tokens in browser local storage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Redirect after successful login
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
    <main className="min-h-screen bg-gray-50 px-4 py-12 flex items-center justify-center">

      <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-lg sm:p-12">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            Log in to your EventPulse account.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block font-semibold text-gray-800"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-4 text-lg outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-semibold text-gray-800"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-4 text-lg outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600"
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Registration Link */}
        <div className="mt-8 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Create Account
          </Link>
        </div>

      </div>
    </main>
  );
}
