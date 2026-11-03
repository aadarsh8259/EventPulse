
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useToast } from "../context/useToast";
import { registerUser } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update input values.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      submit: "",
    }));
  };

  // Validate registration form.
  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  // Handle registration.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      showToast(
        "Registration successful! Please login.",
        "success"
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );

      const backendErrors = error.response?.data;

      let message = "Registration failed. Please try again.";

      if (backendErrors?.username) {
        message = backendErrors.username[0];
      } else if (backendErrors?.email) {
        message = backendErrors.email[0];
      } else if (backendErrors?.password) {
        message = backendErrors.password[0];
      } else if (backendErrors?.detail) {
        message = backendErrors.detail;
      } else if (error.message) {
        message = error.message;
      }

      setErrors({
        submit: message,
      });

      showToast(message, "error");

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">

      {/* Registration Card */}
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-lg sm:rounded-3xl sm:p-8 lg:p-10">

        {/* Heading */}
        <div className="mb-7 text-center sm:mb-8">

          <h1 className="break-words text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Create Account
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
            Register for your EventPulse account.
          </p>

        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 sm:space-y-6"
        >

          {/* Username */}
          <div className="min-w-0">

            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-gray-800"
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
              aria-invalid={Boolean(errors.username)}
              aria-describedby={
                errors.username ? "username-error" : undefined
              }
              className={`min-h-12 w-full min-w-0 rounded-xl border bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-100 ${
                errors.username
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-600"
              }`}
            />

            {errors.username && (
              <p
                id="username-error"
                className="mt-2 break-words text-sm text-red-600"
              >
                {errors.username}
              </p>
            )}

          </div>

          {/* Email */}
          <div className="min-w-0">

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              inputMode="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "email-error" : undefined
              }
              className={`min-h-12 w-full min-w-0 rounded-xl border bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-100 ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-600"
              }`}
            />

            {errors.email && (
              <p
                id="email-error"
                className="mt-2 break-words text-sm text-red-600"
              >
                {errors.email}
              </p>
            )}

          </div>

          {/* Password */}
          <div className="min-w-0">

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "password-error" : undefined
              }
              className={`min-h-12 w-full min-w-0 rounded-xl border bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-100 ${
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-600"
              }`}
            />

            {errors.password && (
              <p
                id="password-error"
                className="mt-2 break-words text-sm text-red-600"
              >
                {errors.password}
              </p>
            )}

          </div>

          {/* Confirm Password */}
          <div className="min-w-0">

            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? "confirm-password-error"
                  : undefined
              }
              className={`min-h-12 w-full min-w-0 rounded-xl border bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-100 ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-600"
              }`}
            />

            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                className="mt-2 break-words text-sm text-red-600"
              >
                {errors.confirmPassword}
              </p>
            )}

          </div>

          {/* General Submit Error */}
          {errors.submit && (
            <div
              role="alert"
              aria-live="polite"
              className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-600 sm:p-4"
            >
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* Login Link */}
        <p className="mt-7 break-words text-center text-sm leading-relaxed text-gray-600 sm:mt-8 sm:text-base">
          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </main>
  );
}
