// Google Maps loader utility to prevent multiple script loads
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
    googleMapsLoaded: boolean;
  }
}

let isLoading = false;
let isLoaded = false;
const loadPromises: ((value: boolean) => void)[] = [];

export function loadGoogleMaps(): Promise<boolean> {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (
      isLoaded ||
      (typeof window !== "undefined" && window.google && window.google.maps)
    ) {
      isLoaded = true;
      resolve(true);
      return;
    }

    // If currently loading, add to promise queue
    if (isLoading) {
      loadPromises.push(resolve);
      return;
    }

    // Start loading
    isLoading = true;
    loadPromises.push(resolve);

    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      // Script exists, wait for it to load
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          isLoaded = true;
          isLoading = false;
          loadPromises.forEach((promiseResolve) => promiseResolve(true));
          loadPromises.length = 0;
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Create and load the script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&v=weekly`;
    script.async = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      loadPromises.forEach((promiseResolve) => promiseResolve(true));
      loadPromises.length = 0;
    };

    script.onerror = () => {
      isLoading = false;
      loadPromises.forEach((promiseResolve) => promiseResolve(false));
      loadPromises.length = 0;
    };

    document.head.appendChild(script);
  });
}

export function isGoogleMapsLoaded(): boolean {
  return (
    isLoaded ||
    (typeof window !== "undefined" && window.google && !!window.google.maps)
  );
}
