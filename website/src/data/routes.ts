// Route types for Hill Street Run Club
// Routes are now managed through the admin dashboard instead of being hardcoded

export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface RunRoute {
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

// Legacy function - routes are now fetched from API
// This file is kept for type definitions only
export const runningRoutes: RunRoute[] = [];

// Get the next upcoming route - now handled by API
export const getUpcomingRoute = (): RunRoute => {
  // This function is deprecated - use /api/upcoming-route instead
  return (
    runningRoutes[0] || {
      id: 0,
      name: "No Route Available",
      description: "No upcoming route has been set by the admin.",
      distance: "0 miles",
      difficulty: "Easy",
      estimatedTime: "0 minutes",
      points: [{ lat: 42.278, lng: -83.7382, name: "Default Location" }],
      isUpcoming: false,
    }
  );
};

// Get route by ID - now handled by API
export const getRouteById = (id: string): RunRoute | undefined => {
  // This function is deprecated - use /api/routes instead
  return runningRoutes.find((route) => route.id?.toString() === id);
};
