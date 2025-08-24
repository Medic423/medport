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
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'demo-key' || apiKey === 'your-google-maps-api-key') {
        // Show demo mode instead of error
        console.log('🔑 No valid API key found, showing demo mode');
        showDemoMode();
        return;
      }

      const loader = new Loader({
        apiKey: apiKey,
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
      
      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        setMapError('Invalid Google Maps API key. Please check your configuration.');
      } else if (error.message?.includes('network')) {
        setMapError('Network error. Please check your internet connection.');
      } else {
        setMapError(`Failed to load map: ${error.message || 'Unknown error'}`);
      }
    }
  }, [center, zoom, showTraffic]);

  // Demo mode function
  const showDemoMode = useCallback(() => {
    setIsMapLoaded(true);
    setMapError(null);
    console.log('🎭 Demo mode activated - showing interactive demo map');
  }, []);

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
    const isApiKeyError = mapError.includes('API key');
    
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Loading Error</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          
          {isApiKeyError && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-semibold text-blue-800 mb-2">How to fix:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in the frontend directory</li>
                <li>2. Add: <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key</code></li>
                <li>3. Get an API key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                <li>4. Restart your development server</li>
              </ol>
            </div>
          )}
          
          <button
            onClick={initializeMap}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if we're in demo mode (no valid API key)
  const isDemoMode = !import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
                    import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'demo-key' || 
                    import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'your-google-maps-api-key';

  if (isDemoMode && isMapLoaded) {
    return (
      <div className="relative w-full h-full min-h-[500px]">
        {/* Demo Map Interface */}
        <div className="w-full h-full rounded-lg shadow-lg bg-gradient-to-br from-blue-50 to-green-50 border-2 border-dashed border-blue-300">
          {/* Demo Map Background */}
          <div className="relative w-full h-full">
            {/* Demo Grid Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }} />
            </div>
            
            {/* Demo Map Title */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-lg">
              <h3 className="text-lg font-semibold text-blue-800">🗺️ Demo Map Mode</h3>
              <p className="text-sm text-blue-600">Interactive simulation - no API key required</p>
            </div>

            {/* Demo Unit Markers */}
            {locations.map((location, index) => (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${50 + (index * 20)}%`,
                  top: `${30 + (index * 10)}%`,
                }}
                onClick={() => onUnitSelect?.(location)}
              >
                {/* Demo Marker */}
                <div className="relative">
                  <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                    location.batteryLevel > 20 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded px-2 py-1 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-medium text-gray-800">{location.unitNumber}</p>
                    <p className="text-xs text-gray-600">{location.agencyName}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Demo Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-2">
                <button
                  onClick={() => console.log('Demo: Zoom in')}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => console.log('Demo: Zoom out')}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                >
                  −
                </button>
              </div>
              
              <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-2">
                <button
                  onClick={() => console.log('Demo: Reset view')}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                  title="Reset View"
                >
                  🏠
                </button>
              </div>
            </div>

            {/* Demo Info Panel */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-4 shadow-lg max-w-xs">
              <h4 className="font-semibold text-gray-800 mb-2">🎭 Demo Mode Active</h4>
              <p className="text-sm text-gray-600 mb-2">
                This is a simulated map interface. Click on unit markers to see details.
              </p>
              <div className="text-xs text-gray-500">
                <p>• {locations.length} units displayed</p>
                <p>• Interactive markers with hover effects</p>
                <p>• Simulated map controls</p>
              </div>
            </div>

            {/* Demo Traffic Layer Toggle */}
            {showTraffic && (
              <div className="absolute bottom-4 right-4 bg-orange-100 border border-orange-300 rounded-lg px-3 py-2">
                <p className="text-sm text-orange-800">🚦 Traffic Layer (Demo)</p>
              </div>
            )}

            {/* Demo Routes Layer Toggle */}
            {showRoutes && (
              <div className="absolute bottom-20 right-4 bg-purple-100 border border-purple-300 rounded-lg px-3 py-2">
                <p className="text-sm text-purple-800">🛣️ Routes Layer (Demo)</p>
              </div>
            )}
          </div>
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
      {isMapLoaded && !isDemoMode && (
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
