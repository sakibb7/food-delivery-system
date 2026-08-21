import React, { useRef, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useLocation } from "@/hooks/useLocation";

interface Coords {
  latitude: number;
  longitude: number;
}

interface RestaurantMarker {
  latitude: number;
  longitude: number;
  name: string;
}

interface DeliveryMapProps {
  restaurantCoords?: Coords;
  customerCoords?: Coords;
  showRestaurant?: boolean;
  showCustomer?: boolean;
  showRider?: boolean;
  restaurantName?: string;
  customerLabel?: string;
  style?: any;
  enableLocationTracking?: boolean;
  restaurantMarkers?: RestaurantMarker[];
}

const DEFAULT_CENTER: Coords = {
  latitude: 23.8103,
  longitude: 90.4125,
};

const isValidCoord = (coord?: Coords | null): coord is Coords => {
  return !!(
    coord &&
    typeof coord.latitude === "number" &&
    !isNaN(coord.latitude) &&
    typeof coord.longitude === "number" &&
    !isNaN(coord.longitude)
  );
};

export default function DeliveryMap({
  restaurantCoords,
  customerCoords,
  showRestaurant = true,
  showCustomer = false,
  showRider = true,
  restaurantName = "Restaurant",
  customerLabel = "Customer",
  style,
  enableLocationTracking = true,
  restaurantMarkers = [],
}: DeliveryMapProps) {
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const { location, error } = useLocation(enableLocationTracking);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  const riderCoords: Coords | null = useMemo(() => {
    return location
      ? { latitude: location.latitude, longitude: location.longitude }
      : null;
  }, [location]);

  const origin = riderCoords;
  const destination = showCustomer ? customerCoords : restaurantCoords;
  const apiKey = process.env.EXPO_PUBLIC_GCP_API_KEY;

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const coords: Coords[] = [];
    if (showRider && isValidCoord(riderCoords)) coords.push(riderCoords);
    if (showRestaurant && isValidCoord(restaurantCoords)) coords.push(restaurantCoords);
    if (showCustomer && isValidCoord(customerCoords)) coords.push(customerCoords);

    restaurantMarkers.forEach((m) => {
      if (isValidCoord(m)) coords.push({ latitude: m.latitude, longitude: m.longitude });
    });

    setTimeout(() => {
      if (!mapRef.current) return;
      if (coords.length >= 2) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 50, bottom: 250, left: 50 },
          animated: true,
        });
      } else if (coords.length === 1) {
        mapRef.current.animateToRegion({
          ...coords[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }, 100);
  }, [
    riderCoords,
    restaurantCoords,
    customerCoords,
    showRestaurant,
    showCustomer,
    showRider,
    isMapReady,
    restaurantMarkers,
  ]);

  const initialRegion = useMemo(() => {
    let center = DEFAULT_CENTER;
    if (isValidCoord(riderCoords)) center = riderCoords;
    else if (isValidCoord(restaurantCoords)) center = restaurantCoords;
    else if (isValidCoord(customerCoords)) center = customerCoords;

    return {
      ...center,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [riderCoords, restaurantCoords, customerCoords]);

  if (enableLocationTracking && !location) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={error ? "#ef4444" : "#10b981"} />
        <Text
          style={[
            styles.loadingText,
            error ? { color: "#ef4444", textAlign: "center", paddingHorizontal: 20 } : null,
          ]}
        >
          {error ? error : "Getting your location..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsCompass={false}
        showsMyLocationButton={false}
        onMapReady={() => setIsMapReady(true)}
      >
        {showRider && isValidCoord(riderCoords) ? (
          <Marker
            coordinate={riderCoords}
            title="You"
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={10}
          >
            <View className="items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-emerald-500/20 items-center justify-center">
                <View className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg items-center justify-center">
                  <Text style={{ fontSize: 16 }}>🏍️</Text>
                </View>
              </View>
            </View>
          </Marker>
        ) : null}

        {showRestaurant && isValidCoord(restaurantCoords) ? (
          <Marker
            coordinate={restaurantCoords}
            title={restaurantName}
            description="Pickup location"
            anchor={{ x: 0.5, y: 1 }}
          >
            <View className="items-center">
              <View className="w-9 h-9 rounded-full bg-orange-500 border-2 border-white shadow-lg items-center justify-center">
                <Text style={{ fontSize: 16 }}>🍽️</Text>
              </View>
              <View className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-orange-500 -mt-1" />
            </View>
          </Marker>
        ) : null}

        {showCustomer && isValidCoord(customerCoords) ? (
          <Marker
            coordinate={customerCoords}
            title={customerLabel}
            description="Dropoff location"
            anchor={{ x: 0.5, y: 1 }}
          >
            <View className="items-center">
              <View className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-lg items-center justify-center">
                <Text style={{ fontSize: 16 }}>📍</Text>
              </View>
              <View className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-blue-600 -mt-1" />
            </View>
          </Marker>
        ) : null}

        {restaurantMarkers.map((marker, idx) => (
          <Marker
            key={`rest-marker-${idx}`}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            description="Available pickup"
            anchor={{ x: 0.5, y: 1 }}
          >
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-orange-400 border-2 border-white shadow-lg items-center justify-center">
                <Text style={{ fontSize: 14 }}>🍽️</Text>
              </View>
              <View className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-400 -mt-1" />
            </View>
          </Marker>
        ))}

        {isValidCoord(origin) && isValidCoord(destination) && apiKey ? (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={apiKey}
            strokeWidth={5}
            strokeColor={showCustomer ? "#2563eb" : "#f97316"}
            onReady={(result) => {
              setDistance(result.distance >= 1 ? `${result.distance.toFixed(1)} km` : `${(result.distance * 1000).toFixed(0)} m`);
              setDuration(`${Math.ceil(result.duration)} min`);
            }}
            onError={(errorMessage) => {
              console.error("MapViewDirections Error:", errorMessage);
            }}
          />
        ) : (
          <>
            {showRider && isValidCoord(riderCoords) && showRestaurant && isValidCoord(restaurantCoords) && !showCustomer ? (
              <Polyline
                coordinates={[riderCoords, restaurantCoords]}
                strokeColor="#f97316"
                strokeWidth={4}
                lineDashPattern={[10, 10]}
              />
            ) : null}

            {showRider && isValidCoord(riderCoords) && showCustomer && isValidCoord(customerCoords) ? (
              <Polyline
                coordinates={[riderCoords, customerCoords]}
                strokeColor="#2563eb"
                strokeWidth={4}
                lineDashPattern={[10, 10]}
              />
            ) : null}
          </>
        )}
      </MapView>

      {distance && duration && (
        <View className="absolute top-4 left-4 right-4 flex-row justify-center z-20">
          <View className="bg-white/90 px-4 py-2 rounded-full flex-row items-center shadow-lg border border-gray-100">
            <View className="flex-row items-center border-r border-gray-200 pr-3 mr-3">
              <Text className="text-gray-500 text-xs mr-1">DIST</Text>
              <Text className="text-gray-900 font-bold">{distance}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-xs mr-1">ETA</Text>
              <Text className="text-emerald-600 font-bold">{duration}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
});
