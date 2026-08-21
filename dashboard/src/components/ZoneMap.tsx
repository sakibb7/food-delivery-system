import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polygon, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

const center = {
  lat: 23.8103,
  lng: 90.4125 // Dhaka coordinates
};

const libraries: ("drawing" | "places" | "geometry" | "visualization")[] = ["drawing", "places"];

interface ZoneMapProps {
  onPolygonComplete: (coords: { lat: number, lng: number }[]) => void;
  initialPolygon?: { lat: number, lng: number }[];
  isEditing?: boolean;
}

const ZoneMap: React.FC<ZoneMapProps> = ({ onPolygonComplete, initialPolygon, isEditing = true }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygon, setPolygon] = useState<{ lat: number, lng: number }[]>(initialPolygon || []);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const drawingManagerRef = useRef<any>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const onPolygonCompleteInternal = (poly: google.maps.Polygon) => {
    const path = poly.getPath();
    const coords = [];
    for (let i = 0; i < path.getLength(); i++) {
      coords.push({
        lat: path.getAt(i).lat(),
        lng: path.getAt(i).lng()
      });
    }
    setPolygon(coords);
    onPolygonComplete(coords);
    poly.setMap(null); // Remove the drawn polygon as we will render it via <Polygon />
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        map?.panTo(location);
        map?.setZoom(15);

        // If the place has viewport bounds, use them to create a square polygon
        if (place.geometry.viewport) {
          const bounds = place.geometry.viewport;
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();

          const coords = [
            { lat: ne.lat(), lng: ne.lng() }, // Top Right
            { lat: ne.lat(), lng: sw.lng() }, // Top Left
            { lat: sw.lat(), lng: sw.lng() }, // Bottom Left
            { lat: sw.lat(), lng: ne.lng() }, // Bottom Right
          ];

          setPolygon(coords);
          onPolygonComplete(coords);
        } else {
          // Fallback: Create a small 500m square around the point if no viewport exists
          const lat = location.lat();
          const lng = location.lng();
          const offset = 0.005; // Approx 500m

          const coords = [
            { lat: lat + offset, lng: lng + offset },
            { lat: lat + offset, lng: lng - offset },
            { lat: lat - offset, lng: lng - offset },
            { lat: lat - offset, lng: lng + offset },
          ];

          setPolygon(coords);
          onPolygonComplete(coords);
        }
      }
    }
  };

  const clearPolygon = () => {
    setPolygon([]);
    onPolygonComplete([]);
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="space-y-4">
      {isEditing && (
        <div className="flex gap-2">
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Search area to add zone..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
          </Autocomplete>
          <button
            type="button"
            onClick={clearPolygon}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Clear Zone
          </button>
        </div>
      )}

      <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {isEditing && (
            <DrawingManager
              onLoad={(manager) => (drawingManagerRef.current = manager)}
              onPolygonComplete={onPolygonCompleteInternal}
              options={{
                drawingControl: true,
                drawingControlOptions: {
                  position: window.google.maps.ControlPosition.TOP_CENTER,
                  drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
                },
                polygonOptions: {
                  fillColor: '#f97316',
                  fillOpacity: 0.3,
                  strokeWeight: 2,
                  strokeColor: '#f97316',
                  clickable: true,
                  editable: true,
                  zIndex: 1,
                },
              }}
            />
          )}

          {polygon.length > 0 && (
            <Polygon
              path={polygon}
              options={{
                fillColor: '#f97316',
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: '#f97316',
              }}
            />
          )}
        </GoogleMap>
      </div>

      {isEditing && (
        <p className="text-xs text-gray-500 italic">
          Use the polygon tool at the top of the map to draw your business operation area.
        </p>
      )}
    </div>
  );
};

export default ZoneMap;
