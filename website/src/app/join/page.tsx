"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function JoinPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isUMUndergrad: false,
    grade: "",
    major: "",
    runningExperience: "",
    fitnessLevel: "",
    goals: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalConditions: "",
    availability: [] as string[],
    hearAboutUs: "",
    additionalInfo: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
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
    if (!formData.isUMUndergrad) {
      newErrors.isUMUndergrad =
        "You must confirm that you are a current University of Michigan undergraduate student";
    }
    if (!formData.grade) {
      newErrors.grade = "Class year is required";
    }
    if (!formData.major.trim()) {
      newErrors.major = "Major/field of study is required";
    }
    if (!formData.runningExperience) {
      newErrors.runningExperience = "Running experience is required";
    }
    if (!formData.fitnessLevel) {
      newErrors.fitnessLevel = "Fitness level is required";
    }
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact name is required";
    }
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = "Emergency contact phone is required";
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
    } else if (name === "isUMUndergrad") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));

      // Clear error for this field when user checks/unchecks
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
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
      // Submit to backend API
      const response = await fetch("/api/register", {
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
              Thank you for your interest in Hill Street Run Club! We&apos;ll review
              your info and get back to you soon!
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
              Ready to run and vibe with Michigan&apos;s undergraduate running
              community? Fill out the form below to get started!
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

            {/* University Information */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-6 font-display"
                style={{ color: "#00274C" }}
              >
                University Information
              </h2>
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="isUMUndergrad"
                    checked={formData.isUMUndergrad}
                    onChange={handleCheckboxChange}
                    required
                    className={`mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 ${
                      errors.isUMUndergrad
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <label
                    className="text-sm font-semibold font-sans"
                    style={{ color: "#00274C" }}
                  >
                    I confirm that I am a current undergraduate student at the
                    University of Michigan *
                    <p className="text-xs font-normal text-gray-600 mt-1">
                      Note: Hill Street Run Club is exclusively for
                      undergraduate students at the University of Michigan.
                    </p>
                  </label>
                </div>
                {errors.isUMUndergrad && (
                  <p className="text-red-600 text-sm mt-2 font-sans">
                    {errors.isUMUndergrad}
                  </p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
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
                    <option value="freshman">Freshman</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                  </select>
                  {errors.grade && (
                    <p className="text-red-600 text-sm mt-1 font-sans">
                      {errors.grade}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Major/Field of Study *
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Computer Science, Engineering, etc."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans ${
                      errors.major ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.major && (
                    <p className="text-red-600 text-sm mt-1 font-sans">
                      {errors.major}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Running Background */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-6 font-display"
                style={{ color: "#00274C" }}
              >
                Running Background
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Running Experience *
                  </label>
                  <select
                    name="runningExperience"
                    value={formData.runningExperience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  >
                    <option value="">Select...</option>
                    <option value="beginner">
                      Beginner (just starting out)
                    </option>
                    <option value="casual">
                      Casual runner (1-2 times/week)
                    </option>
                    <option value="regular">
                      Regular runner (3-4 times/week)
                    </option>
                    <option value="competitive">
                      Competitive runner (5+ times/week)
                    </option>
                    <option value="former-athlete">
                      Former competitive athlete
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Current Fitness Level *
                  </label>
                  <select
                    name="fitnessLevel"
                    value={formData.fitnessLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low - Building basic fitness</option>
                    <option value="moderate">
                      Moderate - Can run 2-3 miles
                    </option>
                    <option value="good">Good - Can run 5+ miles</option>
                    <option value="excellent">
                      Excellent - Can run 10+ miles
                    </option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Running Goals
                  </label>
                  <textarea
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="What are you hoping to achieve? (e.g., complete a 5K, improve speed, make friends, etc.)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  />
                </div>
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

            {/* Emergency Contact */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-6 font-display"
                style={{ color: "#00274C" }}
              >
                Emergency Contact
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Medical Conditions or Injuries *
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder='Please list any medical conditions or injuries we should be aware of. If you have none, simply write "None".'
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-6 font-display"
                style={{ color: "#00274C" }}
              >
                Additional Information
              </h2>
              <div className="space-y-6">
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
                    <option value="friend">Friend/Word of mouth</option>
                    <option value="social-media">Social Media</option>
                    <option value="campus-event">Campus Event</option>
                    <option value="website">Website</option>
                    <option value="flyer">Flyer/Poster</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Anything else you&apos;d like us to know?
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell us more about yourself, your interests, or anything else you'd like to share..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  />
                </div>
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
