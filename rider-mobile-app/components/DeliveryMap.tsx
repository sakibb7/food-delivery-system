import React, { useRef, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useLocation } from "@/hooks/useLocation";

interface Coords {
  latitude: number;
  longitude: number;
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
}

// Default fallback center (Dhaka)
const DEFAULT_CENTER: Coords = {
  latitude: 23.8103,
  longitude: 90.4125,
};

function generateMapHTML(
  center: Coords,
  riderCoords: Coords | null,
  restaurantCoords: Coords | undefined,
  customerCoords: Coords | undefined,
  showRestaurant: boolean,
  showCustomer: boolean,
  showRider: boolean,
  restaurantName: string,
  customerLabel: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    
    .rider-marker {
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
    }
    .rider-dot {
      width: 32px; height: 32px; border-radius: 50%;
      background: #10b981; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; color: white; z-index: 10;
      position: relative;
    }
    .rider-pulse {
      position: absolute; width: 48px; height: 48px;
      border-radius: 50%; background: rgba(16,185,129,0.25);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s ease-out infinite;
    }
    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
    }
    
    .pin-marker {
      display: flex; flex-direction: column; align-items: center;
    }
    .pin-circle {
      width: 34px; height: 34px; border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; color: white;
    }
    .pin-triangle {
      width: 0; height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      margin-top: -3px;
    }
    .restaurant-circle { background: #f97316; }
    .restaurant-triangle { border-top: 10px solid #f97316; }
    .customer-circle { background: #2563eb; }
    .customer-triangle { border-top: 10px solid #2563eb; }
    
    .leaflet-control-attribution { font-size: 8px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${center.latitude}, ${center.longitude}], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM',
      maxZoom: 19
    }).addTo(map);

    var bounds = [];

    ${showRider && riderCoords ? `
    var riderIcon = L.divIcon({
      html: '<div class="rider-marker"><div class="rider-pulse"></div><div class="rider-dot">🏍️</div></div>',
      className: '',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
    var riderMarker = L.marker([${riderCoords.latitude}, ${riderCoords.longitude}], { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
    riderMarker.bindPopup('<b>You</b>');
    bounds.push([${riderCoords.latitude}, ${riderCoords.longitude}]);
    ` : ''}

    ${showRestaurant && restaurantCoords ? `
    var restaurantIcon = L.divIcon({
      html: '<div class="pin-marker"><div class="pin-circle restaurant-circle">🍽️</div><div class="pin-triangle restaurant-triangle"></div></div>',
      className: '',
      iconSize: [34, 46],
      iconAnchor: [17, 46]
    });
    var restMarker = L.marker([${restaurantCoords.latitude}, ${restaurantCoords.longitude}], { icon: restaurantIcon }).addTo(map);
    restMarker.bindPopup('<b>${restaurantName.replace(/'/g, "\\'")}</b><br>Pickup location');
    bounds.push([${restaurantCoords.latitude}, ${restaurantCoords.longitude}]);
    ` : ''}

    ${showCustomer && customerCoords ? `
    var customerIcon = L.divIcon({
      html: '<div class="pin-marker"><div class="pin-circle customer-circle">📍</div><div class="pin-triangle customer-triangle"></div></div>',
      className: '',
      iconSize: [34, 46],
      iconAnchor: [17, 46]
    });
    var custMarker = L.marker([${customerCoords.latitude}, ${customerCoords.longitude}], { icon: customerIcon }).addTo(map);
    custMarker.bindPopup('<b>${customerLabel.replace(/'/g, "\\'")}</b><br>Dropoff location');
    bounds.push([${customerCoords.latitude}, ${customerCoords.longitude}]);
    ` : ''}

    ${showRider && riderCoords && showRestaurant && restaurantCoords && !showCustomer ? `
    L.polyline([
      [${riderCoords.latitude}, ${riderCoords.longitude}],
      [${restaurantCoords.latitude}, ${restaurantCoords.longitude}]
    ], { color: '#f97316', weight: 4, dashArray: '10, 8', opacity: 0.8 }).addTo(map);
    ` : ''}

    ${showRider && riderCoords && showCustomer && customerCoords ? `
    L.polyline([
      [${riderCoords.latitude}, ${riderCoords.longitude}],
      [${customerCoords.latitude}, ${customerCoords.longitude}]
    ], { color: '#2563eb', weight: 4, dashArray: '10, 8', opacity: 0.8 }).addTo(map);
    ` : ''}

    if (bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }

    // Listen for location updates from React Native
    window.addEventListener('message', function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'locationUpdate' && riderMarker) {
          riderMarker.setLatLng([data.lat, data.lng]);
        }
      } catch(e) {}
    });
  </script>
</body>
</html>`;
}

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
}: DeliveryMapProps) {
  const webViewRef = useRef<WebView>(null);
  const { location, permissionGranted } = useLocation(enableLocationTracking);

  const riderCoords: Coords | null = location
    ? { latitude: location.latitude, longitude: location.longitude }
    : null;

  // Send location updates to the WebView
  useEffect(() => {
    if (riderCoords && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "locationUpdate",
          lat: riderCoords.latitude,
          lng: riderCoords.longitude,
        })
      );
    }
  }, [riderCoords?.latitude, riderCoords?.longitude]);

  const initialCenter =
    riderCoords || restaurantCoords || customerCoords || DEFAULT_CENTER;

  const html = useMemo(
    () =>
      generateMapHTML(
        initialCenter,
        riderCoords,
        restaurantCoords,
        customerCoords,
        showRestaurant,
        showCustomer,
        showRider,
        restaurantName,
        customerLabel
      ),
    [
      initialCenter.latitude,
      initialCenter.longitude,
      riderCoords?.latitude,
      riderCoords?.longitude,
      restaurantCoords?.latitude,
      restaurantCoords?.longitude,
      customerCoords?.latitude,
      customerCoords?.longitude,
      showRestaurant,
      showCustomer,
      showRider,
    ]
  );

  if (enableLocationTracking && !permissionGranted && !location) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.map}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
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
