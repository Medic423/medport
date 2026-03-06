import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';
import { MapBounds, LatLng, calculateBoundingBox, calculateBoundsCenter, calculateZoomLevel } from '../utils/mapBounds';

export interface TripMapProps {
  trips: any[];
  onBoundsChange?: (bounds: MapBounds | null) => void;
  onTripClick?: (tripId: string) => void;
  highlightedTripId?: string;
}

const TripMap: React.FC<TripMapProps> = ({
  trips,
  onBoundsChange,
  onTripClick,
  highlightedTripId,
}) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey,
  });

  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);
  const [initialBoundsSet, setInitialBoundsSet] = useState(false);
  const [directionsResults, setDirectionsResults] = useState<Record<string, google.maps.DirectionsResult>>({});
  const mapRef = useRef<google.maps.Map | null>(null);
  const boundsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const fetchedTripIdsRef = useRef<Set<string>>(new Set());

  // Memoize all coordinates extraction to prevent unnecessary recalculations
  const allCoordinates = useMemo(() => {
    const coords: LatLng[] = [];
    trips.forEach((trip) => {
      // Pickup location coordinates
      if (trip.originFacility?.latitude && trip.originFacility?.longitude) {
        coords.push({
          lat: trip.originFacility.latitude,
          lng: trip.originFacility.longitude,
        });
      }

      // Destination facility coordinates
      if (trip.destinationFacility?.latitude && trip.destinationFacility?.longitude) {
        coords.push({
          lat: trip.destinationFacility.latitude,
          lng: trip.destinationFacility.longitude,
        });
      }
    });
    return coords;
  }, [trips]);

  // Memoize initial bounds calculation
  const initialBounds = useMemo(() => {
    if (allCoordinates.length > 0) {
      return calculateBoundingBox(allCoordinates);
    }
    return null;
  }, [allCoordinates]);

  // Set initial bounds only once
  useEffect(() => {
    if (initialBounds && !initialBoundsSet) {
      setMapBounds(initialBounds);
      setInitialBoundsSet(true);
    }
  }, [initialBounds, initialBoundsSet]);

  // Memoize default center and computed map properties
  const defaultCenter = useMemo(() => ({ lat: 40.7128, lng: -74.006 }), []); // Default to NYC

  const { mapCenter, mapZoom } = useMemo(() => {
    const center = mapBounds
      ? calculateBoundsCenter(mapBounds)
      : defaultCenter;
    const zoom = mapBounds ? calculateZoomLevel(mapBounds) : 12;
    return { mapCenter: center, mapZoom: zoom };
  }, [mapBounds, defaultCenter]);

  const containerStyle = useMemo(
    () => ({
      width: '100%',
      height: '100%',
    }),
    []
  );

  // Memoize map options to prevent control flickering
  const mapOptions = useMemo(
    () => ({
      zoom: mapZoom,
      center: mapCenter,
      mapTypeId: 'roadmap' as const,
      fullscreenControl: true,
      streetViewControl: false,
      mapTypeControl: true,
    }),
    [mapZoom, mapCenter]
  );

  // Handle map load
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (mapBounds && allCoordinates.length > 0) {
        const center = calculateBoundsCenter(mapBounds);
        const zoomLevel = calculateZoomLevel(mapBounds);
        map.setCenter(center);
        map.setZoom(zoomLevel);
      }
    },
    [mapBounds, allCoordinates.length]
  );

  // Update map bounds when bounds change
  useEffect(() => {
    if (mapRef.current && mapBounds && allCoordinates.length > 0) {
      const center = calculateBoundsCenter(mapBounds);
      const zoomLevel = calculateZoomLevel(mapBounds);
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoomLevel);
    }
  }, [mapBounds, allCoordinates.length]);

  // Cleanup bounds timeout on unmount
  useEffect(() => {
    return () => {
      if (boundsTimeoutRef.current) {
        clearTimeout(boundsTimeoutRef.current);
      }
    };
  }, []);

  // Debounced bounds change handler to prevent excessive API calls
  const handleBoundsChange = useCallback(() => {
    if (!mapRef.current) return;

    // Clear existing timeout
    if (boundsTimeoutRef.current) {
      clearTimeout(boundsTimeoutRef.current);
    }

    // Debounce for 500ms to wait until user stops panning/zooming
    boundsTimeoutRef.current = setTimeout(() => {
      const bounds = mapRef.current?.getBounds();
      if (!bounds) return;

      const newBounds: MapBounds = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng(),
      };

      onBoundsChange?.(newBounds);
    }, 500);
  }, [onBoundsChange]);

  const getColorByStatus = (status: string): string => {
    switch (status) {
      case 'PENDING':
      case 'PENDING_DISPATCH':
        return '#3B82F6'; // blue
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return '#10B981'; // green
      case 'COMPLETED':
      case 'HEALTHCARE_COMPLETED':
        return '#6B7280'; // gray
      case 'DECLINED':
      case 'CANCELLED':
        return '#EF4444'; // red
      default:
        return '#8B5CF6'; // purple
    }
  };

  const getPickupCoords = (trip: any): LatLng | null => {
    if (trip.originFacility?.latitude && trip.originFacility?.longitude) {
      return {
        lat: parseFloat(trip.originFacility.latitude),
        lng: parseFloat(trip.originFacility.longitude),
      };
    }
    return null;
  };

  const getDestinationCoords = (trip: any): LatLng | null => {
    if (trip.destinationFacility?.latitude && trip.destinationFacility?.longitude) {
      return {
        lat: parseFloat(trip.destinationFacility.latitude),
        lng: parseFloat(trip.destinationFacility.longitude),
      };
    }
    return null;
  };

  // Fetch driving directions for each trip once the Maps API is loaded
  useEffect(() => {
    if (!isLoaded) return;
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }
    trips.forEach((trip) => {
      if (fetchedTripIdsRef.current.has(trip.id)) return;
      const origin = getPickupCoords(trip);
      const destination = getDestinationCoords(trip);
      if (!origin || !destination) return;
      fetchedTripIdsRef.current.add(trip.id);
      directionsServiceRef.current!.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirectionsResults((prev) => ({ ...prev, [trip.id]: result }));
          } else {
            // Allow retry on failure
            fetchedTripIdsRef.current.delete(trip.id);
          }
        }
      );
    });
  }, [isLoaded, trips]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading Google Maps</p>
          <p className="text-sm text-gray-600 mt-2">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 font-semibold">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Google Maps API Key not configured</p>
          <p className="text-sm text-gray-600 mt-2">
            Please add VITE_GOOGLE_MAPS_API_KEY to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={mapZoom}
      onLoad={handleMapLoad}
      onBoundsChanged={handleBoundsChange}
      options={mapOptions}
    >
      {/* Render driving routes for all trips */}
      {trips.map((trip) => {
        const result = directionsResults[trip.id];
        if (!result) return null;
        return (
          <DirectionsRenderer
            key={`route-${trip.id}`}
            directions={result}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: getColorByStatus(trip.status),
                strokeOpacity: highlightedTripId === trip.id ? 1 : 0.6,
                strokeWeight: highlightedTripId === trip.id ? 4 : 2,
                clickable: true,
              },
            }}
          />
        );
      })}

      {/* Render pickup markers */}
      {trips.map((trip) => {
        const pickupCoords = getPickupCoords(trip);
        if (!pickupCoords) return null;

        return (
          <MarkerF
            key={`marker-pickup-${trip.id}`}
            position={pickupCoords}
            title={`Pickup: ${trip.patientId}`}
            onClick={() => onTripClick?.(trip.id)}
            onMouseOver={() => setHoveredTripId(trip.id)}
            onMouseOut={() => setHoveredTripId(null)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: getColorByStatus(trip.status),
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          >
            {hoveredTripId === trip.id && (
              <InfoWindowF onCloseClick={() => setHoveredTripId(null)}>
                <div className="w-48 p-2">
                  <p className="font-semibold text-sm">{trip.tripNumber || trip.patientId}</p>
                  <p className="text-xs text-gray-600">Pickup Location</p>
                  <p className="text-xs">
                    {trip.healthcareLocation?.locationName ||
                      trip.pickupLocation?.hospital?.name ||
                      'N/A'}
                  </p>
                  <p className="text-xs mt-1">Status: {trip.status}</p>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        );
      })}

      {/* Render destination markers */}
      {trips.map((trip) => {
        const destinationCoords = getDestinationCoords(trip);
        if (!destinationCoords) return null;

        return (
          <MarkerF
            key={`marker-destination-${trip.id}`}
            position={destinationCoords}
            title={`Destination: ${trip.toLocation || 'N/A'}`}
            onClick={() => onTripClick?.(trip.id)}
            onMouseOver={() => setHoveredTripId(trip.id)}
            onMouseOut={() => setHoveredTripId(null)}
            icon={{
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: getColorByStatus(trip.status),
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          >
            {hoveredTripId === trip.id && (
              <InfoWindowF onCloseClick={() => setHoveredTripId(null)}>
                <div className="w-48 p-2">
                  <p className="font-semibold text-sm">{trip.tripNumber || trip.patientId}</p>
                  <p className="text-xs text-gray-600">Destination</p>
                  <p className="text-xs">{trip.toLocation || 'N/A'}</p>
                  <p className="text-xs mt-1">Status: {trip.status}</p>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        );
      })}
    </GoogleMap>
  );
};

export default TripMap;
