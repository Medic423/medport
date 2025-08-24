import React, { useState } from 'react';
import InteractiveMap from './InteractiveMap';

interface TestLocation {
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

const MapTestComponent: React.FC = () => {
  const [testLocations, setTestLocations] = useState<TestLocation[]>([
    {
      id: '1',
      unitId: 'unit-001',
      unitNumber: 'EMS-001',
      agencyName: 'Altoona EMS',
      latitude: 37.7749,
      longitude: -122.4194,
      speed: 35,
      heading: 90,
      batteryLevel: 85,
      signalStrength: 95,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      unitId: 'unit-002',
      unitNumber: 'EMS-002',
      agencyName: 'Central EMS',
      latitude: 37.7849,
      longitude: -122.4094,
      speed: 0,
      heading: 180,
      batteryLevel: 45,
      signalStrength: 75,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '3',
      unitId: 'unit-003',
      unitNumber: 'EMS-003',
      agencyName: 'Valley EMS',
      latitude: 37.7649,
      longitude: -122.4294,
      speed: 55,
      heading: 270,
      batteryLevel: 92,
      signalStrength: 88,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);

  const handleUnitSelect = (unit: TestLocation) => {
    setSelectedUnitId(unit.id);
    console.log('Selected unit:', unit);
  };

  const addRandomUnit = () => {
    const newUnit: TestLocation = {
      id: `unit-${Date.now()}`,
      unitId: `unit-${Date.now()}`,
      unitNumber: `EMS-${Math.floor(Math.random() * 1000)}`,
      agencyName: ['Altoona EMS', 'Central EMS', 'Valley EMS', 'Mountain EMS'][Math.floor(Math.random() * 4)],
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
      speed: Math.floor(Math.random() * 60) + 5,
      heading: Math.floor(Math.random() * 360),
      batteryLevel: Math.floor(Math.random() * 40) + 60,
      signalStrength: Math.floor(Math.random() * 30) + 70,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setTestLocations(prev => [...prev, newUnit]);
  };

  const removeRandomUnit = () => {
    if (testLocations.length > 1) {
      const randomIndex = Math.floor(Math.random() * testLocations.length);
      setTestLocations(prev => prev.filter((_, index) => index !== randomIndex));
    }
  };

  const updateRandomUnit = () => {
    if (testLocations.length > 0) {
      const randomIndex = Math.floor(Math.random() * testLocations.length);
      setTestLocations(prev => prev.map((unit, index) => {
        if (index === randomIndex) {
          return {
            ...unit,
            latitude: unit.latitude + (Math.random() - 0.5) * 0.01,
            longitude: unit.longitude + (Math.random() - 0.5) * 0.01,
            speed: Math.floor(Math.random() * 60) + 5,
            heading: Math.floor(Math.random() * 360),
            batteryLevel: Math.max(0, Math.min(100, unit.batteryLevel + (Math.random() - 0.5) * 10)),
            signalStrength: Math.max(0, Math.min(100, unit.signalStrength + (Math.random() - 0.5) * 10)),
            lastUpdated: new Date().toISOString(),
          };
        }
        return unit;
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🗺️ Map Integration Test</h1>
          <p className="text-gray-600 mb-4">
            This component tests the InteractiveMap integration with Google Maps API.
          </p>
          
          {/* Test Controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={addRandomUnit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ➕ Add Random Unit
            </button>
            
            <button
              onClick={removeRandomUnit}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ➖ Remove Random Unit
            </button>
            
            <button
              onClick={updateRandomUnit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Update Random Unit
            </button>
          </div>

          {/* Map Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTraffic}
                onChange={(e) => setShowTraffic(e.target.checked)}
                className="mr-2"
              />
              Show Traffic
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="mr-2"
              />
              Show Routes
            </label>
          </div>
        </div>

        {/* Map Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Interactive Map</h2>
          <div className="h-96">
            <InteractiveMap
              locations={testLocations}
              center={{ lat: 37.7749, lng: -122.4194 }}
              zoom={10}
              onUnitSelect={handleUnitSelect}
              selectedUnitId={selectedUnitId || undefined}
              showTraffic={showTraffic}
              showRoutes={showRoutes}
            />
          </div>
        </div>

        {/* Unit List */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Units ({testLocations.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testLocations.map((unit) => (
              <div
                key={unit.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedUnitId === unit.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleUnitSelect(unit)}
              >
                <h3 className="font-semibold text-gray-900">{unit.unitNumber}</h3>
                <p className="text-sm text-gray-600">{unit.agencyName}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-medium">{unit.speed} mph</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Battery:</span>
                    <span className={`font-medium ${unit.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`}>
                      {unit.batteryLevel}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signal:</span>
                    <span className={`font-medium ${unit.signalStrength > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {unit.signalStrength}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(unit.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🧪 Testing Instructions</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Click on map markers to see unit details</li>
            <li>• Use the test controls to add/remove/update units</li>
            <li>• Toggle traffic and routes layers</li>
            <li>• Check console for WebSocket connection status</li>
            <li>• Verify map responsiveness and marker updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapTestComponent;
