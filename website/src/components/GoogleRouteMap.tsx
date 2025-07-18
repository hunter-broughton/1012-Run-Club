"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

// Declare global google namespace for TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
}

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

interface RouteMapProps {
  routePoints: RoutePoint[];
  center: [number, number];
  zoom?: number;
  height?: string;
  title?: string;
  distance?: string;
  difficulty?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function GoogleRouteMap({
  routePoints,
  center,
  zoom = 15,
  height = "400px",
  title = "Running Route",
  distance,
  difficulty,
}: RouteMapProps) {
  console.log("GoogleRouteMap component rendering with props:", {
    center,
    zoom,
    height,
    title,
    routePointsLength: routePoints.length,
  });

  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeMap = async () => {
    if (!mapElementRef.current) {
      console.log("Map element not found");
      return;
    }

    if (mapInstanceRef.current) {
      console.log("Map already exists");
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is not configured");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Loading Google Maps...");

      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["geometry"],
      });

      await loader.load();
      console.log("Google Maps loaded successfully");

      const mapOptions: google.maps.MapOptions = {
        center: { lat: center[0], lng: center[1] },
        zoom: zoom,
        mapTypeId: "roadmap",
        styles: [
          // Custom styling for a cleaner look
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      };

      console.log("Creating map instance...");
      const map = new window.google.maps.Map(mapElementRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Create route path
      if (routePoints.length > 1) {
        console.log("Adding route polyline...");

        const path = routePoints.map((point) => ({
          lat: point.lat,
          lng: point.lng,
        }));

        // Create the route polyline with Michigan blue color
        const routePath = new window.google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: "#00274C", // Michigan blue
          strokeOpacity: 0.8,
          strokeWeight: 6,
        });

        routePath.setMap(map);

        // Fit map to route bounds
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds, 50);
      }

      // Add start marker (green)
      if (routePoints.length > 0) {
        console.log("Adding start marker...");

        new window.google.maps.Marker({
          position: { lat: routePoints[0].lat, lng: routePoints[0].lng },
          map: map,
          title: `Start${
            routePoints[0].name ? ` - ${routePoints[0].name}` : ""
          }`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#28a745",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
            scale: 10,
          },
        });
      }

      // Add finish marker (red) if different from start
      if (routePoints.length > 1) {
        const endPoint = routePoints[routePoints.length - 1];
        const startPoint = routePoints[0];

        // Only add finish marker if it's significantly different from start
        const distance = Math.sqrt(
          Math.pow(endPoint.lat - startPoint.lat, 2) +
            Math.pow(endPoint.lng - startPoint.lng, 2)
        );

        if (distance > 0.001) {
          console.log("Adding finish marker...");

          new window.google.maps.Marker({
            position: { lat: endPoint.lat, lng: endPoint.lng },
            map: map,
            title: `Finish${endPoint.name ? ` - ${endPoint.name}` : ""}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#dc3545",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
              scale: 10,
            },
          });
        }
      }

      // Add waypoint markers for named points
      routePoints.forEach((point, index) => {
        if (point.name && index > 0 && index < routePoints.length - 1) {
          console.log(`Adding waypoint marker for ${point.name}...`);

          new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: map,
            title: point.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#FFCB05", // Michigan maize
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8,
            },
          });
        }
      });

      console.log("Google Maps initialization completed successfully");
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading Google Maps:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load Google Maps"
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect running, checking for map element...");

    const initMap = async () => {
      if (mapElementRef.current && !mapInstanceRef.current) {
        console.log("Map element found, initializing Google Maps...");
        await initializeMap();
      } else {
        console.log("Map element not found or map already exists", {
          elementExists: !!mapElementRef.current,
          mapExists: !!mapInstanceRef.current,
        });
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initMap, 100);
  }, [center, zoom]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        console.log("Cleaning up Google Maps");
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full p-4 bg-red-100 border border-red-400 rounded-lg">
        <h3 className="text-red-800 font-bold">Map Error</h3>
        <p className="text-red-600">{error}</p>
        {error.includes("API key") && (
          <p className="text-red-600 text-sm mt-2">
            Please add your Google Maps API key to your environment variables as
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </p>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Route Info Header */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-2" style={{ color: "#00274C" }}>
          {title}
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {distance && (
            <div className="flex items-center gap-1">
              <span className="font-semibold">Distance:</span>
              <span>{distance}</span>
            </div>
          )}
          {difficulty && (
            <div className="flex items-center gap-1">
              <span className="font-semibold">Difficulty:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  difficulty.toLowerCase() === "easy"
                    ? "bg-green-100 text-green-800"
                    : difficulty.toLowerCase() === "moderate"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {difficulty}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="font-semibold">Route Type:</span>
            <span>
              {routePoints.length > 1 &&
              Math.abs(
                routePoints[0].lat - routePoints[routePoints.length - 1].lat
              ) < 0.001 &&
              Math.abs(
                routePoints[0].lng - routePoints[routePoints.length - 1].lng
              ) < 0.001
                ? "Loop"
                : "Point to Point"}
            </span>
          </div>
        </div>
      </div>

      {/* Map Container - always render but show loading overlay when needed */}
      <div className="relative">
        <div
          ref={mapElementRef}
          style={{ height, width: "100%" }}
          className="rounded-lg shadow-lg border border-gray-200"
        />

        {/* Loading overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 rounded-lg bg-gray-100 flex items-center justify-center"
            style={{ zIndex: 1000 }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading Google Maps...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1" style={{ backgroundColor: "#00274C" }}></div>
          <span>Running Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
          <span>Finish</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border border-white"
            style={{ backgroundColor: "#FFCB05" }}
          ></div>
          <span>Waypoint</span>
        </div>
      </div>
    </div>
  );
}
