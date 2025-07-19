"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/utils/googleMapsLoader";

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

interface InteractiveRouteMapProps {
  points: RoutePoint[];
  onPointsChange: (points: RoutePoint[]) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

interface PointPopup {
  point: RoutePoint;
  index: number;
  position: { x: number; y: number };
  isNew?: boolean;
}

export default function InteractiveRouteMap({
  points,
  onPointsChange,
  center = { lat: 42.278, lng: -83.7382 }, // Ann Arbor default
  zoom = 13,
}: InteractiveRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [popup, setPopup] = useState<PointPopup | null>(null);
  const [editingName, setEditingName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initializeMap = async () => {
      console.log("Loading Google Maps for InteractiveRouteMap...");
      const loaded = await loadGoogleMaps();
      console.log("Google Maps loaded:", loaded);
      if (loaded) {
        setIsLoaded(true);
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      console.log("Initializing InteractiveRouteMap...");

      // Initialize map
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: false,
      });

      console.log("Map instance created");

      // Initialize Places Autocomplete
      if (searchInputRef.current) {
        console.log("Setting up Places Autocomplete...");
        try {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            searchInputRef.current,
            {
              componentRestrictions: { country: "us" },
              fields: ["place_id", "geometry", "name", "formatted_address"],
              types: ["establishment", "geocode"], // This covers most locations
            }
          );

          // Bias the autocomplete towards the map's viewport
          autocompleteRef.current.bindTo("bounds", mapInstanceRef.current);

          autocompleteRef.current.addListener("place_changed", () => {
            console.log("Place changed triggered");
            const place = autocompleteRef.current?.getPlace();
            console.log("Selected place:", place);

            if (place && place.geometry && place.geometry.location) {
              const location = place.geometry.location;
              console.log(
                "Moving to location:",
                location.lat(),
                location.lng()
              );

              // Pan to the searched location
              mapInstanceRef.current?.panTo(location);
              mapInstanceRef.current?.setZoom(16);

              // Clear previous search marker
              if (searchMarkerRef.current) {
                searchMarkerRef.current.setMap(null);
              }

              // Add search result marker
              searchMarkerRef.current = new google.maps.Marker({
                position: location,
                map: mapInstanceRef.current,
                title: place.name || place.formatted_address || "Search Result",
                icon: {
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 6,
                  fillColor: "#FF6B35",
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#ffffff",
                },
                animation: google.maps.Animation.BOUNCE,
              });

              // Stop bouncing after 2 seconds
              setTimeout(() => {
                if (searchMarkerRef.current) {
                  searchMarkerRef.current.setAnimation(null);
                }
              }, 2000);

              // Clear search marker after 10 seconds
              setTimeout(() => {
                if (searchMarkerRef.current) {
                  searchMarkerRef.current.setMap(null);
                  searchMarkerRef.current = null;
                }
              }, 10000);
            } else {
              console.log("No valid geometry found for place");
              alert("Location not found. Please try a different search term.");
            }
          });
        } catch (error) {
          console.error("Failed to initialize Places Autocomplete:", error);
          alert(
            "Search functionality is not available. Please check your Google Maps API configuration."
          );
        }
      }

      // Add click listener to add new points
      mapInstanceRef.current.addListener(
        "click",
        (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const newPoint: RoutePoint = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
              name: `Point ${points.length + 1}`,
            };

            // Get screen position for popup
            const overlay = new google.maps.OverlayView();
            overlay.setMap(mapInstanceRef.current);
            overlay.onAdd = function () {
              const projection = this.getProjection();
              if (projection) {
                const pixelPosition = projection.fromLatLngToContainerPixel(
                  event.latLng!
                );
                if (pixelPosition) {
                  setPopup({
                    point: newPoint,
                    index: points.length,
                    position: { x: pixelPosition.x, y: pixelPosition.y },
                    isNew: true,
                  });
                  setEditingName(newPoint.name || "");
                }
              }
              overlay.setMap(null);
            };
            overlay.draw = function () {};
          }
        }
      );
    }
  }, [isLoaded, center, zoom, points.length]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkersAndPolyline();
    }
  }, [points]);

  const updateMarkersAndPolyline = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Add new markers
    points.forEach((point, index) => {
      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: mapInstanceRef.current,
        title: point.name || `Point ${index + 1}`,
        label: {
          text: `${index + 1}`,
          color: "white",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor:
            index === 0
              ? "#00ff00"
              : index === points.length - 1
              ? "#ff0000"
              : "#0066ff",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      });

      // Add click listener to marker for editing
      marker.addListener("click", (event: google.maps.MapMouseEvent) => {
        const overlay = new google.maps.OverlayView();
        overlay.setMap(mapInstanceRef.current);
        overlay.onAdd = function () {
          const projection = this.getProjection();
          if (projection && event.latLng) {
            const pixelPosition = projection.fromLatLngToContainerPixel(
              event.latLng
            );
            if (pixelPosition) {
              setPopup({
                point,
                index,
                position: { x: pixelPosition.x, y: pixelPosition.y },
                isNew: false,
              });
              setEditingName(point.name || "");
            }
          }
          overlay.setMap(null);
        };
        overlay.draw = function () {};
      });

      markersRef.current.push(marker);
    });

    // Add polyline connecting all points
    if (points.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: points.map((point) => ({ lat: point.lat, lng: point.lng })),
        geodesic: true,
        strokeColor: "#0066ff",
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      polylineRef.current.setMap(mapInstanceRef.current);
    }
  };

  const handleAddPoint = () => {
    if (popup && popup.isNew) {
      const newPoints = [...points, { ...popup.point, name: editingName }];
      onPointsChange(newPoints);
    }
    setPopup(null);
    setEditingName("");
  };

  const handleUpdatePoint = () => {
    if (popup && !popup.isNew) {
      const newPoints = [...points];
      newPoints[popup.index] = { ...popup.point, name: editingName };
      onPointsChange(newPoints);
    }
    setPopup(null);
    setEditingName("");
  };

  const handleDeletePoint = () => {
    if (popup && !popup.isNew) {
      const newPoints = points.filter((_, index) => index !== popup.index);
      onPointsChange(newPoints);
    }
    setPopup(null);
    setEditingName("");
  };

  const handleMoveUp = () => {
    if (popup && !popup.isNew && popup.index > 0) {
      const newPoints = [...points];
      [newPoints[popup.index - 1], newPoints[popup.index]] = [
        newPoints[popup.index],
        newPoints[popup.index - 1],
      ];
      onPointsChange(newPoints);
      setPopup({ ...popup, index: popup.index - 1 });
    }
  };

  const handleMoveDown = () => {
    if (popup && !popup.isNew && popup.index < points.length - 1) {
      const newPoints = [...points];
      [newPoints[popup.index], newPoints[popup.index + 1]] = [
        newPoints[popup.index + 1],
        newPoints[popup.index],
      ];
      onPointsChange(newPoints);
      setPopup({ ...popup, index: popup.index + 1 });
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for locations (e.g., 'Michigan Stadium', 'Diag', 'State Street')"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Start typing to see location suggestions, then select one to navigate
          to it
        </p>
      </div>

      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border-2 border-gray-300"
      />

      {/* Instructions */}
      <div className="mt-2 text-sm text-gray-600">
        <p>• Search for locations using the search bar above</p>
        <p>• Click anywhere on the map to add a new route point</p>
        <p>• Click on existing markers to edit, reorder, or delete points</p>
        <p>
          • Points are connected in order (green = start, red = end, blue =
          waypoints)
        </p>
      </div>

      {/* Popup for adding/editing points */}
      {popup && (
        <div
          className="absolute z-10 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 min-w-64"
          style={{
            left: Math.min(popup.position.x, window.innerWidth - 280),
            top: Math.max(popup.position.y - 100, 10),
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                {popup.isNew
                  ? "Add New Point"
                  : `Edit Point ${popup.index + 1}`}
              </h3>
              <button
                onClick={() => setPopup(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Point Name
              </label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter point name..."
                autoFocus
              />
            </div>

            <div className="text-xs text-gray-500">
              <p>Lat: {popup.point.lat.toFixed(6)}</p>
              <p>Lng: {popup.point.lng.toFixed(6)}</p>
            </div>

            <div className="flex gap-2">
              {popup.isNew ? (
                <button
                  onClick={handleAddPoint}
                  className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Point
                </button>
              ) : (
                <>
                  <button
                    onClick={handleUpdatePoint}
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={handleDeletePoint}
                    className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={() => setPopup(null)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            {!popup.isNew && (
              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={handleMoveUp}
                  disabled={popup.index === 0}
                  className="px-2 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Move Up
                </button>
                <button
                  onClick={handleMoveDown}
                  disabled={popup.index === points.length - 1}
                  className="px-2 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Move Down
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
