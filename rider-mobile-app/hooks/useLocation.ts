import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { privateInstance } from "@/configs/axiosConfig";

interface LocationState {
  latitude: number;
  longitude: number;
}

export function useLocation(enabled: boolean = true) {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastReportRef = useRef<number>(0);

  useEffect(() => {
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

        // Check if GPS is enabled
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setError("Location services (GPS) are disabled. Please enable them in settings.");
        }

        // Get initial location with fallback
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

        // Watch position updates
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
            setError(null); // Clear errors if we successfully get location

            // Report to backend every 30 seconds
            const now = Date.now();
            if (now - lastReportRef.current > 30000) {
              lastReportRef.current = now;
              privateInstance
                .patch("/rider/location", {
                  lat: newLocation.latitude,
                  lng: newLocation.longitude,
                })
                .catch(() => {
                  // Silently fail location reporting
                });
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

    console.log("location", location, error, permissionGranted);

    return () => {
      cancelled = true;
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, [enabled]);

  return { location, error, permissionGranted };
}
