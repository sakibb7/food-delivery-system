import { useEffect, useState } from "react";
import type { LocationData } from "../types";
import { AppContext } from "./app-context";

interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const [location, setLocation] = useState<LocationData | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("Fetching location...");

    useEffect(() => {
        if (!navigator.geolocation)
            return alert("Please allow location to continue");

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const res = await fetch(
                    `   https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                );
                const data = await res.json();

                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: data.display_name || "current location",
                });

                setCity(
                    data?.address.city ||
                    data.address.town ||
                    data.address.villate ||
                    "Your location",
                );
            } catch (error) {
                console.log(error);
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: "current location",
                });
                setCity("Failed to load");
            }
        });
    }, []);

    return (
        <AppContext.Provider
            value={{
                isLoading,
                setIsLoading,
                city,
                location,
                loadingLocation,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};