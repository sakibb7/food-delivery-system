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
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          setPermissionGranted(false);
          return;
        }

        if (cancelled) return;
        setPermissionGranted(true);

        // Get initial location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled) return;
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

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
