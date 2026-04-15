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

export default function AddressMapPicker({
  center = DEFAULT_CENTER,
  onLocationSelect,
  draggable = true,
  className = "",
}: AddressMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Reverse geocode using Nominatim
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
        );
        const data = await res.json();

        if (data && data.address) {
          const addr = data.address;
          const addressParts = [
            addr.house_number,
            addr.road,
            addr.neighbourhood,
            addr.suburb,
          ]
            .filter(Boolean)
            .join(", ");

          onLocationSelect(lat, lng, {
            address: addressParts || data.display_name?.split(",").slice(0, 3).join(",") || "",
            city:
              addr.city ||
              addr.town ||
              addr.village ||
              addr.county ||
              "",
            state: addr.state || "",
            country: addr.country || "",
            zipcode: addr.postcode || "",
          });
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
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapContainerRef.current) return;

      // Create custom marker icon
      const markerIcon = L.divIcon({
        html: `<div style="
          width: 40px; height: 40px; 
          display: flex; align-items: center; justify-content: center;
          position: relative;
        ">
          <div style="
            width: 20px; height: 20px; 
            background: #dc2626; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            bottom: 2px;
            width: 10px; height: 3px;
            background: rgba(0,0,0,0.2);
            border-radius: 50%;
          "></div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 38],
        className: "custom-marker",
      });

      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(center, {
        draggable: draggable,
        icon: markerIcon,
      }).addTo(map);

      if (draggable) {
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          map.panTo(pos);
          reverseGeocode(pos.lat, pos.lng);
        });
      }

      // Click to place marker
      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        map.panTo(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []); // intentionally empty — only init once

  // Update map center when prop changes
  useEffect(() => {
    if (mapRef.current && markerRef.current && isMapReady) {
      mapRef.current.setView(center, 15);
      markerRef.current.setLatLng(center);
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
          mapRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
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
        className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2">
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
