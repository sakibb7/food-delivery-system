import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { privateInstance } from "@/configs/axiosConfig";

interface LocationState {
  latitude: number;
  longitude: number;
}

// ─── Demo config ────────────────────────────────────────────────────────────
const DEMO_MODE = false; // flip to false when testing real GPS

const DEMO_LOCATION: LocationState = {
  latitude: 23.8103,   // Dhaka, Bangladesh
  longitude: 90.4125,
};

const DEMO_RESTAURANT_COORDS = {
  latitude: 23.8223,
  longitude: 90.4290,
};

const DEMO_CUSTOMER_COORDS = {
  latitude: 23.7968,
  longitude: 90.4042,
};
// ─────────────────────────────────────────────────────────────────────────────

export function useLocation(enabled: boolean = true) {
  const [location, setLocation] = useState<LocationState | null>(
    DEMO_MODE ? DEMO_LOCATION : null   // seed immediately in demo mode
  );
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(DEMO_MODE); // treat as granted
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastReportRef = useRef<number>(0);

  useEffect(() => {
    // In demo mode, skip all GPS logic entirely
    if (DEMO_MODE) return;
    if (!enabled) return;

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          setPermissionGranted(false);
          return;
        }

        if (cancelled) return;
        setPermissionGranted(true);

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setError("Location services (GPS) are disabled. Please enable them in settings.");
        }

        try {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (!cancelled) {
            setLocation({
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            });
          }
        } catch (initialErr: any) {
          console.warn("Failed to get initial location:", initialErr.message);
          try {
            const lastLocation = await Location.getLastKnownPositionAsync();
            if (lastLocation && !cancelled) {
              setLocation({
                latitude: lastLocation.coords.latitude,
                longitude: lastLocation.coords.longitude,
              });
            }
          } catch (e) { }
        }

        if (cancelled) return;

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (loc) => {
            const newLocation = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            setLocation(newLocation);
            setError(null);

            const now = Date.now();
            if (now - lastReportRef.current > 30000) {
              lastReportRef.current = now;
              privateInstance
                .patch("/rider/location", {
                  lat: newLocation.latitude,
                  lng: newLocation.longitude,
                })
                .catch(() => { });
            }
          }
        );

        watchRef.current = subscription;
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to get location");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, [enabled]);

  return {
    location,
    error,
    permissionGranted,
    ...(DEMO_MODE ? {
      demoRestaurantCoords: DEMO_RESTAURANT_COORDS,
      demoCustomerCoords: DEMO_CUSTOMER_COORDS,
    } : {}),
  };
}