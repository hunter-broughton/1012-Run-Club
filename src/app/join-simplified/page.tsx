"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function JoinPageSimplified() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    availability: [] as string[],
    hearAboutUs: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions - simplified for Google Form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!formData.email.endsWith("@umich.edu")) {
      newErrors.email =
        "Email must be a valid University of Michigan email address ending in @umich.edu";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.grade) {
      newErrors.grade = "Class year is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear error when user starts typing
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name === "availability") {
      setFormData((prev) => ({
        ...prev,
        availability: checked
          ? [...prev.availability, value]
          : prev.availability.filter((item) => item !== value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(
          `[name="${firstErrorField}"]`
        ) as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
      return;
    }

    try {
      // Submit to backend API (which will forward to Google Forms)
      const response = await fetch("/api/register-simplified", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (result.errors && Array.isArray(result.errors)) {
          const errorObj: Record<string, string> = {};
          result.errors.forEach((error: string) => {
            if (error.includes("email")) {
              errorObj.email = error;
            } else if (
              error.includes("already exists") ||
              error.includes("already registered")
            ) {
              errorObj.email = error;
            } else {
              errorObj.general = error;
            }
          });
          setErrors(errorObj);
        } else {
          setErrors({
            general:
              result.message ||
              "There was an error submitting your application. Please try again.",
          });
        }
        return;
      }

      // Success - show confirmation
      console.log("Registration successful:", result);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        general:
          "There was an error submitting your application. Please check your internet connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navigation />
        <div
          className="min-h-screen pt-32 pb-20"
          style={{ backgroundColor: "#00274C" }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Image
              src="/HillStreetRunClub.PNG"
              alt="Hill Street Run Club Logo"
              width={200}
              height={200}
              className="mx-auto mb-8"
            />
            <h1
              className="text-4xl md:text-6xl font-bold mb-8 font-display"
              style={{ color: "#FFCB05" }}
            >
              WELCOME TO THE MOVEMENT!
            </h1>
            <p className="text-xl text-gray-200 mb-8 font-sans">
              Thank you for your interest in Hill Street Run Club! We&apos;ll
              review your info and get back to you soon!
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 text-lg font-semibold font-sans rounded-lg transition-all hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div
        className="min-h-screen pt-32 pb-20"
        style={{ backgroundColor: "#00274C" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1
              className="text-4xl md:text-6xl font-bold mb-6 font-display"
              style={{ color: "#FFCB05" }}
            >
              JOIN THE MOVEMENT
            </h1>
            <p className="text-xl text-gray-200 font-sans mb-4">
              Ready to run with Hill St. Run Club? Fill out the form below to
              get started!
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-xl p-8"
          >
            {/* Personal Information */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-6 font-display"
                style={{ color: "#00274C" }}
              >
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1 font-sans">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1 font-sans">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Email Address (must be @umich.edu) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your-uniqname@umich.edu"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1 font-sans">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1 font-sans">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Class Year */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-6 font-display"
                style={{ color: "#00274C" }}
              >
                University Information
              </h2>
              <div>
                <label
                  className="block text-sm font-semibold mb-2 font-sans"
                  style={{ color: "#00274C" }}
                >
                  Class Year *
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans ${
                    errors.grade ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select your class year...</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Other">Other</option>
                </select>
                {errors.grade && (
                  <p className="text-red-600 text-sm mt-1 font-sans">
                    {errors.grade}
                  </p>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-6 font-display"
                style={{ color: "#00274C" }}
              >
                Availability
              </h2>
              <label
                className="block text-sm font-semibold mb-4 font-sans"
                style={{ color: "#00274C" }}
              >
                Which days can you typically join group runs? (Check all that
                apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <label
                    key={day}
                    className="flex items-center space-x-2 font-sans"
                  >
                    <input
                      type="checkbox"
                      name="availability"
                      value={day}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* How did you hear about us */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-6 font-display"
                style={{ color: "#00274C" }}
              >
                Additional Information
              </h2>
              <div>
                <label
                  className="block text-sm font-semibold mb-2 font-sans"
                  style={{ color: "#00274C" }}
                >
                  How did you hear about us?
                </label>
                <select
                  name="hearAboutUs"
                  value={formData.hearAboutUs}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                >
                  <option value="">Select...</option>
                  <option value="Friend/Word of mouth">
                    Friend/Word of mouth
                  </option>
                  <option value="Social Media">Social Media</option>
                  <option value="Campus Event">Campus Event</option>
                  <option value="Website">Website</option>
                  <option value="Flyer/Poster">Flyer/Poster</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              {/* General error display */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-sans">{errors.general}</p>
                </div>
              )}

              {/* Validation summary */}
              {Object.keys(errors).length > 0 && !errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-sans font-semibold mb-2">
                    Please fix the following errors:
                  </p>
                  <ul className="text-red-600 font-sans text-sm list-disc list-inside">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-12 py-4 text-xl font-semibold font-sans rounded-lg transition-all hover:shadow-xl hover:scale-105 ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
