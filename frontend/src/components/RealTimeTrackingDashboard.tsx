import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

interface GPSLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  batteryLevel?: number;
  signalStrength?: number;
}

interface UnitLocation {
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

interface DashboardData {
  summary: {
    totalUnits: number;
    activeUnits: number;
    unitsWithIssues: number;
    lastUpdated: string;
  };
  units: UnitLocation[];
  alerts: {
    lowBattery: number;
    poorSignal: number;
    offline: number;
  };
}

const RealTimeTrackingDashboard: React.FC = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Demo coordinates for map center (San Francisco area)
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      startAutoRefresh();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we're in demo mode
      const isDemoMode = token === 'demo-token';
      
      if (isDemoMode) {
        // Generate demo data for demonstration
        const demoData = generateDemoData();
        setDashboardData(demoData);
        return;
      }

      const response = await fetch('/api/real-time-tracking/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnitSelect = (unit: UnitLocation) => {
    setSelectedUnit(unit);
    // Center map on selected unit
    setMapCenter({ lat: unit.latitude, lng: unit.longitude });
    setZoom(15);
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      startAutoRefresh();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getStatusColor = (unit: UnitLocation) => {
    if (unit.batteryLevel < 20) return 'text-red-600';
    if (unit.batteryLevel < 40) return 'text-yellow-600';
    if (unit.signalStrength < 30) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusIcon = (unit: UnitLocation) => {
    if (unit.batteryLevel < 20) return '🔴';
    if (unit.batteryLevel < 40) return '🟡';
    if (unit.signalStrength < 30) return '🟠';
    return '🟢';
  };

  const formatSpeed = (speed: number) => {
    return `${Math.round(speed)} mph`;
  };

  const formatBattery = (battery: number) => {
    return `${Math.round(battery)}%`;
  };

  const formatSignal = (signal: number) => {
    return `${Math.round(signal)}%`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const generateDemoData = (): DashboardData => {
    const now = new Date();
    const demoUnits: UnitLocation[] = [
      {
        id: 'demo-1',
        unitId: 'demo-unit-1',
        unitNumber: 'DEMO-001',
        agencyName: 'Demo EMS Agency',
        latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
        speed: 25 + Math.random() * 15,
        heading: Math.random() * 360,
        batteryLevel: 80 + Math.random() * 20,
        signalStrength: 70 + Math.random() * 30,
        timestamp: now.toISOString(),
        lastUpdated: now.toISOString(),
      },
      {
        id: 'demo-2',
        unitId: 'demo-unit-2',
        unitNumber: 'DEMO-002',
        agencyName: 'Demo EMS Agency',
        latitude: 37.7849 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4094 + (Math.random() - 0.5) * 0.01,
        speed: 30 + Math.random() * 10,
        heading: Math.random() * 360,
        batteryLevel: 60 + Math.random() * 30,
        signalStrength: 80 + Math.random() * 20,
        timestamp: now.toISOString(),
        lastUpdated: now.toISOString(),
      },
      {
        id: 'demo-3',
        unitId: 'demo-unit-3',
        unitNumber: 'DEMO-003',
        agencyName: 'Demo EMS Agency',
        latitude: 37.7649 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4294 + (Math.random() - 0.5) * 0.01,
        speed: 35 + Math.random() * 10,
        heading: Math.random() * 360,
        batteryLevel: 90 + Math.random() * 10,
        signalStrength: 90 + Math.random() * 10,
        timestamp: now.toISOString(),
        lastUpdated: now.toISOString(),
      },
    ];

    return {
      summary: {
        totalUnits: demoUnits.length,
        activeUnits: demoUnits.length,
        unitsWithIssues: demoUnits.filter(u => u.batteryLevel < 20 || u.signalStrength < 30).length,
        lastUpdated: now.toISOString(),
      },
      units: demoUnits,
      alerts: {
        lowBattery: demoUnits.filter(u => u.batteryLevel < 20).length,
        poorSignal: demoUnits.filter(u => u.signalStrength < 30).length,
        offline: 0,
      },
    };
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading real-time tracking dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Real-Time Tracking Dashboard</h1>
              <p className="text-gray-600">Monitor transport units in real-time</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Auto-refresh:</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  disabled={!autoRefresh}
                >
                  <option value={2000}>2s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                </select>
              </div>
              <button
                onClick={toggleAutoRefresh}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Refresh Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🚑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary.totalUnits || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🟢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Units</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary.activeUnits || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Units with Issues</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary.unitsWithIssues || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🕒</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-bold text-gray-900">
                  {dashboardData?.summary.lastUpdated
                    ? getTimeAgo(dashboardData.summary.lastUpdated)
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Active Units</h3>
                <p className="text-sm text-gray-600">
                  {dashboardData?.units.length || 0} units currently tracked
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {dashboardData?.units.map((unit) => (
                  <div
                    key={unit.id}
                    onClick={() => handleUnitSelect(unit)}
                    className={`px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedUnit?.id === unit.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getStatusIcon(unit)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{unit.unitNumber}</p>
                          <p className="text-sm text-gray-600">{unit.agencyName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(unit)}`}>
                          {formatSpeed(unit.speed)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getTimeAgo(unit.lastUpdated)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Battery:</span>
                        <span className={`ml-1 font-medium ${unit.batteryLevel < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatBattery(unit.batteryLevel)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Signal:</span>
                        <span className={`ml-1 font-medium ${unit.signalStrength < 30 ? 'text-orange-600' : 'text-gray-900'}`}>
                          {formatSignal(unit.signalStrength)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!dashboardData?.units || dashboardData.units.length === 0) && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <span className="text-4xl mb-2 block">🚑</span>
                    <p>No units currently tracked</p>
                    <p className="text-sm">Units will appear here when they start reporting location data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map and Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedUnit ? `${selectedUnit.unitNumber} - Live Tracking` : 'Unit Map'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedUnit
                    ? `Last updated: ${formatTimestamp(selectedUnit.lastUpdated)}`
                    : 'Select a unit to view detailed tracking information'}
                </p>
              </div>
              
              <div className="p-6">
                {/* Demo Map Placeholder */}
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🗺️</span>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Interactive Map</h4>
                    <p className="text-gray-600 mb-4">
                      {selectedUnit
                        ? `Showing location of ${selectedUnit.unitNumber} at ${selectedUnit.latitude.toFixed(6)}, ${selectedUnit.longitude.toFixed(6)}`
                        : 'Select a unit to view its location on the map'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Map integration would show real-time unit locations, routes, and geofences
                    </p>
                  </div>
                </div>

                {/* Unit Details */}
                {selectedUnit && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Speed:</span>
                          <span className="font-medium">{formatSpeed(selectedUnit.speed)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heading:</span>
                          <span className="font-medium">{Math.round(selectedUnit.heading)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Battery:</span>
                          <span className={`font-medium ${selectedUnit.batteryLevel < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatBattery(selectedUnit.batteryLevel)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Signal:</span>
                          <span className={`font-medium ${selectedUnit.signalStrength < 30 ? 'text-orange-600' : 'text-gray-900'}`}>
                            {formatSignal(selectedUnit.signalStrength)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Location Info</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Latitude:</span>
                          <span className="font-mono text-sm">{selectedUnit.latitude.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Longitude:</span>
                          <span className="font-mono text-sm">{selectedUnit.longitude.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Update:</span>
                          <span className="text-sm">{formatTimestamp(selectedUnit.lastUpdated)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Update Age:</span>
                          <span className="text-sm">{getTimeAgo(selectedUnit.lastUpdated)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {dashboardData && (dashboardData.alerts.lowBattery > 0 || dashboardData.alerts.poorSignal > 0) && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Active Alerts</h3>
                <p className="text-sm text-gray-600">Units requiring attention</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dashboardData.alerts.lowBattery > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🔴</span>
                        <div>
                          <p className="font-medium text-red-800">Low Battery Alert</p>
                          <p className="text-red-600">{dashboardData.alerts.lowBattery} units affected</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {dashboardData.alerts.poorSignal > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🟠</span>
                        <div>
                          <p className="font-medium text-orange-800">Poor Signal Alert</p>
                          <p className="text-orange-600">{dashboardData.alerts.poorSignal} units affected</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeTrackingDashboard;
