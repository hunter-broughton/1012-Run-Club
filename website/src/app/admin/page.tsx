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

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

interface RunRoute {
  id?: number;
  name: string;
  description: string;
  distance: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  estimatedTime: string;
  points: RoutePoint[];
  isUpcoming?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Event {
  id?: number;
  badge: string;
  title: string;
  description: string;
  date: string;
  location: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [routes, setRoutes] = useState<RunRoute[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "registrations" | "routes" | "events"
  >("registrations");
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RunRoute | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [routeForm, setRouteForm] = useState<
    Omit<RunRoute, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    distance: "",
    difficulty: "Easy",
    estimatedTime: "",
    points: [],
    isUpcoming: false,
  });

  const [eventForm, setEventForm] = useState<
    Omit<Event, "id" | "createdAt" | "updatedAt">
  >({
    badge: "",
    title: "",
    description: "",
    date: "",
    location: "",
    isActive: true,
    sortOrder: 0,
  });

  // Simple password protection (in production, use proper authentication)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        fetchRegistrations();
        fetchRoutes();
        fetchEvents();
        setError(null);
      } else {
        const result = await response.json();
        setError(result.error || "Invalid password");
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
      console.error("Auth error:", err);
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

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/routes");
      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }
      const routesData = await response.json();
      setRoutes(routesData);
    } catch (err) {
      setError("Failed to load routes");
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const eventsData = await response.json();
      setEvents(eventsData);
    } catch (err) {
      setError("Failed to load events");
      console.error(err);
    }
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one route point is provided
    if (routeForm.points.length === 0) {
      setError("At least one route point is required");
      return;
    }

    // Validate that all route points have valid coordinates
    const invalidPoints = routeForm.points.some(
      (point) =>
        isNaN(point.lat) ||
        isNaN(point.lng) ||
        point.lat === 0 ||
        point.lng === 0
    );

    if (invalidPoints) {
      setError(
        "All route points must have valid latitude and longitude coordinates"
      );
      return;
    }

    try {
      const method = editingRoute ? "PUT" : "POST";
      const url = editingRoute
        ? `/api/routes?id=${editingRoute.id}`
        : "/api/routes";

      console.log("Submitting route:", { method, url, routeForm });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeForm),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.details ||
            responseData.error ||
            `Failed to ${editingRoute ? "update" : "create"} route`
        );
      }

      await fetchRoutes();
      setShowRouteForm(false);
      setEditingRoute(null);
      setRouteForm({
        name: "",
        description: "",
        distance: "",
        difficulty: "Easy",
        estimatedTime: "",
        points: [],
        isUpcoming: false,
      });
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Route submit error:", err);
      setError(
        `Failed to ${editingRoute ? "update" : "create"} route: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const handleDeleteRoute = async (id: number) => {
    if (!confirm("Are you sure you want to delete this route?")) return;

    try {
      const response = await fetch(`/api/routes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete route");
      }

      await fetchRoutes();
    } catch (err) {
      setError("Failed to delete route");
      console.error(err);
    }
  };

  const handleSetUpcoming = async (id: number) => {
    try {
      const response = await fetch(`/api/routes?id=${id}&action=set-upcoming`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to set upcoming route");
      }

      await fetchRoutes();
    } catch (err) {
      setError("Failed to set upcoming route");
      console.error(err);
    }
  };

  const handleEditRoute = (route: RunRoute) => {
    setEditingRoute(route);
    setRouteForm({
      name: route.name,
      description: route.description,
      distance: route.distance,
      difficulty: route.difficulty,
      estimatedTime: route.estimatedTime,
      points: route.points,
      isUpcoming: route.isUpcoming || false,
    });
    setShowRouteForm(true);
  };

  // Event management functions
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingEvent ? "PUT" : "POST";
      const url = editingEvent
        ? `/api/events?id=${editingEvent.id}`
        : "/api/events";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventForm),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(
          responseData.error ||
            `Failed to ${editingEvent ? "update" : "create"} event`
        );
      }

      await fetchEvents();
      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({
        badge: "",
        title: "",
        description: "",
        date: "",
        location: "",
        isActive: true,
        sortOrder: 0,
      });
      setError(null);
    } catch (err) {
      console.error("Event submit error:", err);
      setError(
        `Failed to ${editingEvent ? "update" : "create"} event: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      await fetchEvents();
    } catch (err) {
      setError("Failed to delete event");
      console.error(err);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      badge: event.badge,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      isActive: event.isActive || true,
      sortOrder: event.sortOrder || 0,
    });
    setShowEventForm(true);
  };

  const addRoutePoint = () => {
    setRouteForm({
      ...routeForm,
      points: [...routeForm.points, { lat: 0, lng: 0, name: "" }],
    });
  };

  const updateRoutePoint = (
    index: number,
    field: keyof RoutePoint,
    value: string | number
  ) => {
    const updatedPoints = [...routeForm.points];
    updatedPoints[index] = { ...updatedPoints[index], [field]: value };
    setRouteForm({ ...routeForm, points: updatedPoints });
  };

  const removeRoutePoint = (index: number) => {
    const updatedPoints = routeForm.points.filter((_, i) => i !== index);
    setRouteForm({ ...routeForm, points: updatedPoints });
  };

  const moveRoutePoint = (fromIndex: number, toIndex: number) => {
    const updatedPoints = [...routeForm.points];
    const [movedPoint] = updatedPoints.splice(fromIndex, 1);
    updatedPoints.splice(toIndex, 0, movedPoint);
    setRouteForm({ ...routeForm, points: updatedPoints });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    // Prevent drag if the target is an input or textarea
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex !== dropIndex) {
      moveRoutePoint(dragIndex, dropIndex);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent drag initiation when clicking on input fields
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      e.stopPropagation();
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
              Admin Dashboard
            </h1>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab("registrations")}
                className={`px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all ${
                  activeTab === "registrations"
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={
                  activeTab === "registrations"
                    ? { backgroundColor: "#00274C" }
                    : { backgroundColor: "#e9ecef" }
                }
              >
                Registrations ({registrations.length})
              </button>
              <button
                onClick={() => setActiveTab("routes")}
                className={`px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all ${
                  activeTab === "routes"
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={
                  activeTab === "routes"
                    ? { backgroundColor: "#00274C" }
                    : { backgroundColor: "#e9ecef" }
                }
              >
                Routes ({routes.length})
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all ${
                  activeTab === "events"
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={
                  activeTab === "events"
                    ? { backgroundColor: "#00274C" }
                    : { backgroundColor: "#e9ecef" }
                }
              >
                Events ({events.length})
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right text-red-500 hover:text-red-700 ml-4"
              >
                ×
              </button>
            </div>
          )}

          {activeTab === "registrations" ? (
            // Registrations Tab Content
            <div>
              <div className="flex justify-between items-center mb-6">
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

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 font-sans">
                    Loading registrations...
                  </p>
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
          ) : activeTab === "routes" ? (
            // Routes Tab Content
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-lg text-gray-600 font-sans">
                  Total Routes:{" "}
                  <span className="font-bold">{routes.length}</span>
                </p>
                <button
                  onClick={() => {
                    setShowRouteForm(true);
                    setEditingRoute(null);
                    setRouteForm({
                      name: "",
                      description: "",
                      distance: "",
                      difficulty: "Easy",
                      estimatedTime: "",
                      points: [
                        { lat: 42.278, lng: -83.7382, name: "Start Point" },
                      ], // Add a default point
                      isUpcoming: false,
                    });
                  }}
                  className="px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all hover:shadow-xl"
                  style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
                >
                  Add New Route
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 font-sans">
                    Loading routes...
                  </p>
                </div>
              ) : routes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 font-sans">
                    No routes created yet. Create your first route!
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead style={{ backgroundColor: "#00274C" }}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Distance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Difficulty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {routes.map((route) => (
                          <tr key={route.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {route.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {route.description.substring(0, 60)}...
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {route.distance}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  route.difficulty === "Easy"
                                    ? "bg-green-100 text-green-800"
                                    : route.difficulty === "Moderate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {route.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {route.isUpcoming ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Upcoming
                                </span>
                              ) : (
                                <span className="text-gray-500">Inactive</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditRoute(route)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                {!route.isUpcoming && (
                                  <button
                                    onClick={() => handleSetUpcoming(route.id!)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Set Upcoming
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteRoute(route.id!)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "events" ? (
            // Events Tab Content
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-lg text-gray-600 font-sans">
                  Total Events:{" "}
                  <span className="font-bold">{events.length}</span>
                </p>
                <button
                  onClick={() => {
                    setShowEventForm(true);
                    setEditingEvent(null);
                    setEventForm({
                      badge: "",
                      title: "",
                      description: "",
                      date: "",
                      location: "",
                      isActive: true,
                      sortOrder: events.length + 1,
                    });
                  }}
                  className="px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all hover:shadow-xl"
                  style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
                >
                  Add New Event
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 font-sans">
                    Loading events...
                  </p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 font-sans">
                    No events created yet. Create your first event!
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead style={{ backgroundColor: "#00274C" }}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Badge
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  event.badge === "WEEKLY"
                                    ? "bg-blue-100 text-blue-800"
                                    : event.badge === "WEEKEND"
                                    ? "bg-green-100 text-green-800"
                                    : event.badge === "MONTHLY"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {event.badge}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {event.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {event.description.substring(0, 60)}...
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.isActive ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditEvent(event)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id!)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Route Form Modal */}
      {showRouteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "#00274C" }}>
                  {editingRoute ? "Edit Route" : "Add New Route"}
                </h2>
                <button
                  onClick={() => setShowRouteForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleRouteSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#00274C" }}
                    >
                      Route Name
                    </label>
                    <input
                      type="text"
                      value={routeForm.name}
                      onChange={(e) =>
                        setRouteForm({ ...routeForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#00274C" }}
                    >
                      Distance
                    </label>
                    <input
                      type="text"
                      value={routeForm.distance}
                      onChange={(e) =>
                        setRouteForm({ ...routeForm, distance: e.target.value })
                      }
                      placeholder="e.g., 5.0 miles"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#00274C" }}
                    >
                      Difficulty
                    </label>
                    <select
                      value={routeForm.difficulty}
                      onChange={(e) =>
                        setRouteForm({
                          ...routeForm,
                          difficulty: e.target.value as
                            | "Easy"
                            | "Moderate"
                            | "Hard",
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#00274C" }}
                    >
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      value={routeForm.estimatedTime}
                      onChange={(e) =>
                        setRouteForm({
                          ...routeForm,
                          estimatedTime: e.target.value,
                        })
                      }
                      placeholder="e.g., 40-50 minutes"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#00274C" }}
                  >
                    Description
                  </label>
                  <textarea
                    value={routeForm.description}
                    onChange={(e) =>
                      setRouteForm({
                        ...routeForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label
                      className="block text-sm font-semibold"
                      style={{ color: "#00274C" }}
                    >
                      Route Points
                    </label>
                    <button
                      type="button"
                      onClick={addRoutePoint}
                      className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                      style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
                    >
                      Add Point
                    </button>
                  </div>

                  {routeForm.points.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No route points added yet.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {routeForm.points.map((point, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-6 gap-3 items-center p-3 bg-gray-50 rounded-lg border-2 border-transparent hover:border-blue-200 transition-all"
                        >
                          <div
                            className="flex items-center justify-center text-gray-500 cursor-move hover:text-blue-600 transition-colors"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            title="Drag to reorder"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                            </svg>
                            <span className="ml-1 text-sm font-medium">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <input
                              type="number"
                              step="any"
                              value={point.lat === 0 ? "" : point.lat}
                              onChange={(e) =>
                                updateRoutePoint(
                                  index,
                                  "lat",
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value) || 0
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              onMouseDown={handleMouseDown}
                              placeholder="Latitude"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              step="any"
                              value={point.lng === 0 ? "" : point.lng}
                              onChange={(e) =>
                                updateRoutePoint(
                                  index,
                                  "lng",
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value) || 0
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              onMouseDown={handleMouseDown}
                              placeholder="Longitude"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={point.name || ""}
                              onChange={(e) =>
                                updateRoutePoint(index, "name", e.target.value)
                              }
                              onMouseDown={handleMouseDown}
                              placeholder="Point name (optional)"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (index > 0) moveRoutePoint(index, index - 1);
                              }}
                              disabled={index === 0}
                              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (index < routeForm.points.length - 1)
                                  moveRoutePoint(index, index + 1);
                              }}
                              disabled={index === routeForm.points.length - 1}
                              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              ↓
                            </button>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => removeRoutePoint(index)}
                              className="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition-all"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isUpcoming"
                    checked={routeForm.isUpcoming}
                    onChange={(e) =>
                      setRouteForm({
                        ...routeForm,
                        isUpcoming: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isUpcoming"
                    className="ml-2 text-sm font-semibold"
                    style={{ color: "#00274C" }}
                  >
                    Set as upcoming route
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowRouteForm(false)}
                    className="px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all border border-gray-300 hover:bg-gray-50"
                    style={{ color: "#00274C" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all hover:shadow-xl"
                    style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
                  >
                    {editingRoute ? "Update Route" : "Create Route"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "#00274C" }}>
                  {editingEvent ? "Edit Event" : "Add New Event"}
                </h2>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#00274C" }}
                    >
                      Badge
                    </label>
                    <select
                      value={eventForm.badge}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, badge: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Badge</option>
                      <option value="WEEKLY">WEEKLY</option>
                      <option value="WEEKEND">WEEKEND</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="SPECIAL">SPECIAL</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#00274C" }}
                    >
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={eventForm.sortOrder}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          sortOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#00274C" }}
                  >
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#00274C" }}
                  >
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#00274C" }}
                  >
                    Date & Time
                  </label>
                  <input
                    type="text"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                    placeholder="e.g., Every Wednesday, 6:00 PM"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#00274C" }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, location: e.target.value })
                    }
                    placeholder="e.g., Ann Arbor - Meet at TBD"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={eventForm.isActive}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm font-semibold"
                    style={{ color: "#00274C" }}
                  >
                    Active (show on website)
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all border border-gray-300 hover:bg-gray-50"
                    style={{ color: "#00274C" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-lg font-semibold font-sans rounded-lg transition-all hover:shadow-xl"
                    style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
