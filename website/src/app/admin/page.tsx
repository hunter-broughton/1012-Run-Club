"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";

interface Registration {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  grade: string;
  major: string;
  runningExperience: string;
  fitnessLevel: string;
  goals: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions: string;
  availability: string[];
  hearAboutUs: string;
  additionalInfo: string;
  submittedAt: string;
  ipAddress: string;
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Simple password protection (in production, use proper authentication)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "hillstreet2025") {
      // Change this to a secure password
      setIsAuthenticated(true);
      fetchRegistrations();
    } else {
      setError("Invalid password");
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format: "json" }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch registrations");
      }

      const result = await response.json();
      setRegistrations(result.data || []);
    } catch (err) {
      setError("Failed to load registrations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      const response = await fetch("/api/export");

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : "registrations.csv";

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to export CSV");
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navigation />
        <div
          className="min-h-screen pt-32 pb-20"
          style={{ backgroundColor: "#00274C" }}
        >
          <div className="max-w-md mx-auto px-6">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h1
                className="text-3xl font-bold mb-6 text-center font-display"
                style={{ color: "#00274C" }}
              >
                Admin Access
              </h1>
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label
                    className="block text-sm font-semibold mb-2 font-sans"
                    style={{ color: "#00274C" }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-600 text-sm mb-4 font-sans">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-lg font-semibold font-sans rounded-lg transition-all hover:shadow-xl"
                  style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
                >
                  Access Dashboard
                </button>
              </form>
            </div>
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
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-4 font-display"
              style={{ color: "#00274C" }}
            >
              Registration Dashboard
            </h1>
            <div className="flex justify-between items-center">
              <p className="text-lg text-gray-600 font-sans">
                Total Registrations:{" "}
                <span className="font-bold">{registrations.length}</span>
              </p>
              <button
                onClick={exportToCSV}
                disabled={exporting}
                className="px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all hover:shadow-xl disabled:opacity-50"
                style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
              >
                {exporting ? "Exporting..." : "Export to CSV"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 font-sans">
                Loading registrations...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600 font-sans">{error}</p>
              <button
                onClick={fetchRegistrations}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 font-sans">
                No registrations yet.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: "#00274C" }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Class Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Major
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Medical
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(reg.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {reg.firstName} {reg.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reg.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {reg.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reg.major}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {reg.runningExperience}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reg.medicalConditions || "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
