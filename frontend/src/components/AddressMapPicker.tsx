"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";

interface AddressMapPickerProps {
  center?: [number, number];
  onLocationSelect: (
    lat: number,
    lng: number,
    addressData: {
      address: string;
      city: string;
      state: string;
      country: string;
      zipcode: string;
    }
  ) => void;
  draggable?: boolean;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125]; // Dhaka, Bangladesh

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Load the Google Maps script globally once
let googleMapsPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;

  if (typeof window !== "undefined" && window.google?.maps) {
    googleMapsPromise = Promise.resolve();
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export default function AddressMapPicker({
  center = DEFAULT_CENTER,
  onLocationSelect,
  draggable = true,
  className = "",
}: AddressMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Reverse geocode using Google Geocoding API
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocoderRef.current) return;

      try {
        const response = await geocoderRef.current.geocode({
          location: { lat, lng },
        });

        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          const components = result.address_components;

          let address = "";
          let city = "";
          let state = "";
          let country = "";
          let zipcode = "";

          // Extract structured address components
          const streetNumber = components.find((c) =>
            c.types.includes("street_number")
          )?.long_name;
          const route = components.find((c) =>
            c.types.includes("route")
          )?.long_name;
          const neighborhood = components.find((c) =>
            c.types.includes("neighborhood")
          )?.long_name;
          const sublocality = components.find((c) =>
            c.types.includes("sublocality") || c.types.includes("sublocality_level_1")
          )?.long_name;

          const addressParts = [streetNumber, route, neighborhood, sublocality].filter(Boolean);
          address = addressParts.length > 0
            ? addressParts.join(", ")
            : result.formatted_address?.split(",").slice(0, 3).join(",") || "";

          city =
            components.find((c) => c.types.includes("locality"))?.long_name ||
            components.find((c) => c.types.includes("administrative_area_level_2"))?.long_name ||
            "";

          state =
            components.find((c) => c.types.includes("administrative_area_level_1"))?.long_name || "";

          country =
            components.find((c) => c.types.includes("country"))?.long_name || "";

          zipcode =
            components.find((c) => c.types.includes("postal_code"))?.long_name || "";

          onLocationSelect(lat, lng, { address, city, state, country, zipcode });
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
      }
    },
    [onLocationSelect]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        await loadGoogleMaps();
      } catch (err) {
        console.error("Google Maps failed to load:", err);
        return;
      }

      if (cancelled || !mapContainerRef.current) return;

      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: center[0], lng: center[1] },
        zoom: 15,
        disableDefaultUI: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      const marker = new google.maps.Marker({
        position: { lat: center[0], lng: center[1] },
        map,
        draggable,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0, // hidden, we use a custom label instead
        },
        label: {
          text: "📍",
          fontSize: "32px",
        },
      });

      const geocoder = new google.maps.Geocoder();

      if (draggable) {
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) {
            map.panTo(pos);
            reverseGeocode(pos.lat(), pos.lng());
          }
        });
      }

      // Click to place marker
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          marker.setPosition(e.latLng);
          map.panTo(e.latLng);
          reverseGeocode(e.latLng.lat(), e.latLng.lng());
        }
      });

      mapRef.current = map;
      markerRef.current = marker;
      geocoderRef.current = geocoder;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        // Google Maps doesn't have a .remove() — just clear references
        mapRef.current = null;
        markerRef.current = null;
        geocoderRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []); // intentionally empty — only init once

  // Update map center when prop changes
  useEffect(() => {
    if (mapRef.current && markerRef.current && isMapReady) {
      const newCenter = { lat: center[0], lng: center[1] };
      mapRef.current.setCenter(newCenter);
      mapRef.current.setZoom(15);
      (markerRef.current as google.maps.Marker).setPosition(newCenter);
    }
  }, [center, isMapReady]);

  // Use current location
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapRef.current && markerRef.current) {
          const pos = { lat, lng };
          mapRef.current.setCenter(pos);
          mapRef.current.setZoom(16);
          (markerRef.current as google.maps.Marker).setPosition(pos);
        }

        reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location permission denied. Please enable it in your browser settings."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [reverseGeocode]);

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[300px] rounded-2xl overflow-hidden border-2 border-gray-200 relative z-0"
        style={{ minHeight: "300px" }}
      />

      {/* Use Current Location Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className="absolute top-3 left-3 z-[5] flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLocating ? (
          <>
            <Loader2 size={16} className="animate-spin text-red-500" />
            <span>Locating...</span>
          </>
        ) : (
          <>
            <Crosshair size={16} className="text-red-500" />
            <span>Use Current Location</span>
          </>
        )}
      </button>

      {/* Instructions Pill */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[5] bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2">
        <MapPin size={12} />
        Click or drag the pin to set location
      </div>

      {/* Error Message */}
      {locationError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {locationError}
        </div>
      )}
    </div>
  );
}
