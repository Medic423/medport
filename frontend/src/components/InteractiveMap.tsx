import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapLocation {
  id: string;
  unitId: string;
  unitNumber: string;
  agencyName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  batteryLevel: number;
  signalStrength: number;
  timestamp: string;
  lastUpdated: string;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onUnitSelect?: (unit: MapLocation) => void;
  selectedUnitId?: string;
  showTraffic?: boolean;
  showRoutes?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 10,
  onUnitSelect,
  selectedUnitId,
  showTraffic = false,
  showRoutes = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || 'demo-key',
        version: 'weekly',
        libraries: ['places', 'geometry'],
      });

      const google = await loader.load();
      
      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: getMedicalTransportMapStyle(),
      });

      mapInstanceRef.current = map;

      // Create info window for unit details
      infoWindowRef.current = new google.maps.InfoWindow();

      // Add traffic layer if enabled
      if (showTraffic) {
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
      }

      setIsMapLoaded(true);
      setMapError(null);

      // Add map event listeners
      map.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      });

    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setMapError('Failed to load map. Please check your internet connection.');
    }
  }, [center, zoom, showTraffic]);

  // Create or update markers for units
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // Remove old markers that are no longer in locations
    markers.forEach((marker, id) => {
      if (!locations.find(loc => loc.id === id)) {
        marker.setMap(null);
        markers.delete(id);
      }
    });

    // Create or update markers for current locations
    locations.forEach((location) => {
      const existingMarker = markers.get(location.id);
      
      if (existingMarker) {
        // Update existing marker position
        existingMarker.setPosition({ lat: location.latitude, lng: location.longitude });
      } else {
        // Create new marker
        const marker = new google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map,
          title: `${location.unitNumber} - ${location.agencyName}`,
          icon: createUnitMarkerIcon(location),
          animation: google.maps.Animation.DROP,
        });

        // Add click event listener
        marker.addListener('click', () => {
          if (onUnitSelect) {
            onUnitSelect(location);
          }
          
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(createInfoWindowContent(location));
            infoWindowRef.current.open(map, marker);
          }
        });

        markers.set(location.id, marker);
      }

      // Highlight selected unit
      const marker = markers.get(location.id);
      if (marker && location.id === selectedUnitId) {
        marker.setIcon(createSelectedUnitMarkerIcon(location));
        marker.setAnimation(google.maps.Animation.BOUNCE);
      } else if (marker) {
        marker.setIcon(createUnitMarkerIcon(location));
        marker.setAnimation(null);
      }
    });
  }, [locations, isMapLoaded, onUnitSelect, selectedUnitId]);

  // Custom map styling for medical transport theme
  const getMedicalTransportMapStyle = (): google.maps.MapTypeStyle[] => {
    return [
      {
        featureType: 'poi.medical',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'on' }],
      },
      {
        featureType: 'poi.medical',
        elementType: 'labels.text',
        stylers: [{ visibility: 'on' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'on' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#ff7b7b' }],
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#ffb3b3' }],
      },
    ];
  };

  // Create custom marker icon for units
  const createUnitMarkerIcon = (location: MapLocation): google.maps.Symbol => {
    const batteryColor = location.batteryLevel > 20 ? '#22c55e' : '#ef4444';
    const signalColor = location.signalStrength > 50 ? '#22c55e' : '#f59e0b';
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: batteryColor,
      fillOpacity: 0.8,
      strokeColor: signalColor,
      strokeWeight: 2,
      scale: 8,
    };
  };

  // Create selected unit marker icon
  const createSelectedUnitMarkerIcon = (location: MapLocation): google.maps.Symbol => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#3b82f6',
      fillOpacity: 1,
      strokeColor: '#1e40af',
      strokeWeight: 3,
      scale: 10,
    };
  };

  // Create info window content
  const createInfoWindowContent = (location: MapLocation): string => {
    const batteryStatus = location.batteryLevel > 20 ? 'Good' : 'Low';
    const signalStatus = location.signalStrength > 50 ? 'Strong' : 'Weak';
    
    return `
      <div class="p-3 min-w-[250px]">
        <h3 class="font-bold text-lg text-gray-800 mb-2">${location.unitNumber}</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Agency:</span>
            <span class="font-medium">${location.agencyName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Speed:</span>
            <span class="font-medium">${location.speed} mph</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Heading:</span>
            <span class="font-medium">${location.heading}°</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Battery:</span>
            <span class="font-medium ${location.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}">${location.batteryLevel}% (${batteryStatus})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Signal:</span>
            <span class="font-medium ${location.signalStrength > 50 ? 'text-green-600' : 'text-yellow-600'}">${location.signalStrength}% (${signalStatus})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Last Update:</span>
            <span class="font-medium">${new Date(location.lastUpdated).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    `;
  };

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update markers when locations change
  useEffect(() => {
    if (isMapLoaded) {
      updateMarkers();
    }
  }, [locations, isMapLoaded, updateMarkers]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom, isMapLoaded]);

  // Update traffic layer when showTraffic changes
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      // This would need to be implemented with proper traffic layer management
      // For now, we'll just reinitialize the map if traffic setting changes
      if (showTraffic !== (mapInstanceRef.current.getLayers()?.some(layer => layer instanceof google.maps.TrafficLayer))) {
        initializeMap();
      }
    }
  }, [showTraffic, isMapLoaded, initializeMap]);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">🗺️</div>
          <p className="text-gray-600">{mapError}</p>
          <button
            onClick={initializeMap}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '500px' }}
      />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Map Controls Overlay */}
      {isMapLoaded && (
        <div className="absolute top-4 right-4 space-y-2">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom()! + 1);
                }
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              +
            </button>
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom()! - 1);
                }
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              −
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-2">
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setCenter(center);
                  mapInstanceRef.current.setZoom(zoom);
                }
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Reset View"
            >
              🏠
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
