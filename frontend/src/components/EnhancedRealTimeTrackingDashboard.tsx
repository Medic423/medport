import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import InteractiveMap from './InteractiveMap';

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

const EnhancedRealTimeTrackingDashboard: React.FC = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('map');
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [mapZoom, setMapZoom] = useState(10);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [filterAgency, setFilterAgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [autoRefresh, refreshInterval, token]);

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

      console.log('🔍 Fetching dashboard data...');
      console.log('🔑 Token from useAuth:', token);
      
      // Fallback check for demo mode directly from localStorage
      const localStorageDemoMode = localStorage.getItem('demoMode');
      console.log('🎭 Demo mode from localStorage:', localStorageDemoMode);

      // Check if we're in demo mode
      const isDemoMode = token === 'demo-token' || localStorageDemoMode === 'true';
      console.log('🎭 Final demo mode decision:', isDemoMode);

      if (isDemoMode) {
        // Use demo data
        const demoData = generateDemoData();
        setDashboardData(demoData);
        
        // Update map center based on demo data
        if (demoData.units.length > 0) {
          const centerLat = demoData.units.reduce((sum, unit) => sum + unit.latitude, 0) / demoData.units.length;
          const centerLng = demoData.units.reduce((sum, unit) => sum + unit.longitude, 0) / demoData.units.length;
          setMapCenter({ lat: centerLat, lng: centerLng });
        }
      } else {
        // Real API call
        const response = await fetch('/api/real-time-tracking/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
        
        // Update map center based on real data
        if (data.units.length > 0) {
          const centerLat = data.units.reduce((sum, unit) => sum + unit.latitude, 0) / data.units.length;
          const centerLng = data.units.reduce((sum, unit) => sum + unit.longitude, 0) / data.units.length;
          setMapCenter({ lat: centerLat, lng: centerLng });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch tracking data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoData = (): DashboardData => {
    const demoUnits: UnitLocation[] = [
      {
        id: '1',
        unitId: 'unit-001',
        unitNumber: 'EMS-001',
        agencyName: 'Altoona EMS',
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        speed: Math.floor(Math.random() * 60) + 5,
        heading: Math.floor(Math.random() * 360),
        batteryLevel: Math.floor(Math.random() * 40) + 60,
        signalStrength: Math.floor(Math.random() * 30) + 70,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: '2',
        unitId: 'unit-002',
        unitNumber: 'EMS-002',
        agencyName: 'Central EMS',
        latitude: 37.7849 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4094 + (Math.random() - 0.5) * 0.1,
        speed: Math.floor(Math.random() * 60) + 5,
        heading: Math.floor(Math.random() * 360),
        batteryLevel: Math.floor(Math.random() * 40) + 60,
        signalStrength: Math.floor(Math.random() * 30) + 70,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: '3',
        unitId: 'unit-003',
        unitNumber: 'EMS-003',
        agencyName: 'Valley EMS',
        latitude: 37.7649 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4294 + (Math.random() - 0.5) * 0.1,
        speed: Math.floor(Math.random() * 60) + 5,
        heading: Math.floor(Math.random() * 360),
        batteryLevel: Math.floor(Math.random() * 40) + 60,
        signalStrength: Math.floor(Math.random() * 30) + 70,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ];

    return {
      summary: {
        totalUnits: demoUnits.length,
        activeUnits: demoUnits.length,
        unitsWithIssues: 0,
        lastUpdated: new Date().toISOString(),
      },
      units: demoUnits,
      alerts: {
        lowBattery: 0,
        poorSignal: 0,
        offline: 0,
      },
    };
  };

  const handleUnitSelect = (unit: UnitLocation) => {
    setSelectedUnit(unit);
    // Center map on selected unit
    setMapCenter({ lat: unit.latitude, lng: unit.longitude });
    setMapZoom(15);
  };

  const getFilteredUnits = () => {
    if (!dashboardData) return [];
    
    let filtered = dashboardData.units;
    
    if (filterAgency !== 'all') {
      filtered = filtered.filter(unit => unit.agencyName === filterAgency);
    }
    
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'lowBattery':
          filtered = filtered.filter(unit => unit.batteryLevel < 20);
          break;
        case 'poorSignal':
          filtered = filtered.filter(unit => unit.signalStrength < 50);
          break;
        case 'active':
          filtered = filtered.filter(unit => unit.speed > 0);
          break;
        case 'stationary':
          filtered = filtered.filter(unit => unit.speed === 0);
          break;
      }
    }
    
    return filtered;
  };

  const getAgencyOptions = () => {
    if (!dashboardData) return [];
    const agencies = [...new Set(dashboardData.units.map(unit => unit.agencyName))];
    return agencies;
  };

  // Always render the main structure, even if loading or error
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🚑</div>
              <h1 className="text-xl font-semibold text-gray-900">Enhanced Real-Time Tracking</h1>
              {token === 'demo-token' && (
                <div className="ml-4 bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-yellow-800">🎭 Demo Mode</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Demo Mode Indicator */}
              {token === 'demo-token' && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-800">🎭</span>
                    <span className="text-sm font-medium text-yellow-800">Demo Mode Active</span>
                    <span className="text-xs text-yellow-600">(No API key required)</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Auto-refresh:</span>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-3 py-1"
                >
                  <option value={2000}>2s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                </select>
              )}
              
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '🔄' : '🔄'} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !dashboardData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading tracking data...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-blue-600 mr-3">🚑</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.summary.totalUnits}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-green-600 mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Units</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.summary.activeUnits}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-yellow-600 mr-3">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Units with Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.summary.unitsWithIssues}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-gray-600 mr-3">🕒</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(dashboardData.summary.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">View Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🗺️ Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🔀 Split
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showTraffic"
                  checked={showTraffic}
                  onChange={(e) => setShowTraffic(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showTraffic" className="text-sm text-gray-600">Show Traffic</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showRoutes"
                    checked={showRoutes}
                    onChange={(e) => setShowRoutes(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showRoutes" className="text-sm text-gray-600">Show Routes</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
              <select
                value={filterAgency}
                onChange={(e) => setFilterAgency(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Agencies</option>
                {dashboardData && getAgencyOptions().map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="stationary">Stationary</option>
                <option value="lowBattery">Low Battery</option>
                <option value="poorSignal">Poor Signal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {dashboardData ? (
          <>
            {viewMode === 'map' && (
              <div className="bg-white rounded-lg shadow">
                <InteractiveMap
                  locations={getFilteredUnits()}
                  center={mapCenter}
                  zoom={mapZoom}
                  onUnitSelect={handleUnitSelect}
                  selectedUnitId={selectedUnit?.id}
                  showTraffic={showTraffic}
                  showRoutes={showRoutes}
                />
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Unit Locations</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredUnits().map((unit) => (
                        <tr
                          key={unit.id}
                          onClick={() => handleUnitSelect(unit)}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedUnit?.id === unit.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{unit.unitNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{unit.agencyName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {unit.latitude.toFixed(4)}, {unit.longitude.toFixed(4)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{unit.speed} mph</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${unit.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`}>
                              {unit.batteryLevel}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${unit.signalStrength > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {unit.signalStrength}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(unit.lastUpdated).toLocaleTimeString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow">
                  <InteractiveMap
                    locations={getFilteredUnits()}
                    center={mapCenter}
                    zoom={mapZoom}
                    onUnitSelect={handleUnitSelect}
                    selectedUnitId={selectedUnit?.id}
                    showTraffic={showTraffic}
                    showRoutes={showRoutes}
                  />
                </div>
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Unit Details</h3>
                  </div>
                  <div className="p-6">
                    {selectedUnit ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{selectedUnit.unitNumber}</h4>
                          <p className="text-sm text-gray-600">{selectedUnit.agencyName}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Speed</p>
                            <p className="text-lg text-gray-900">{selectedUnit.speed} mph</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Heading</p>
                            <p className="text-lg text-gray-900">{selectedUnit.heading}°</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Battery</p>
                            <p className={`text-lg ${selectedUnit.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedUnit.batteryLevel}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Signal</p>
                            <p className={`text-lg ${selectedUnit.signalStrength > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {selectedUnit.signalStrength}%
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600">Location</p>
                          <p className="text-sm text-gray-900">
                            {selectedUnit.latitude.toFixed(6)}, {selectedUnit.longitude.toFixed(6)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600">Last Update</p>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedUnit.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-2">📍</div>
                        <p>Select a unit on the map to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Data State */
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tracking Data Available</h3>
            <p className="text-gray-600 mb-6">
              {isLoading ? 'Loading tracking information...' : 'No units are currently being tracked.'}
            </p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🚑</div>
              <h1 className="text-xl font-semibold text-gray-900">Enhanced Real-Time Tracking</h1>
              {token === 'demo-token' && (
                <div className="ml-4 bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-yellow-800">🎭 Demo Mode</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Demo Mode Indicator */}
              {token === 'demo-token' && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-800">🎭</span>
                    <span className="text-sm font-medium text-yellow-800">Demo Mode Active</span>
                    <span className="text-xs text-yellow-600">(No API key required)</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Auto-refresh:</span>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={2000}>2s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                </select>
              )}
              
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '🔄' : '🔄'} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-blue-600 mr-3">🚑</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.summary.totalUnits}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-green-600 mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Units</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.summary.activeUnits}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-yellow-600 mr-3">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Units with Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.summary.unitsWithIssues}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-gray-600 mr-3">🕒</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(dashboardData.summary.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">View Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🗺️ Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🔀 Split
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showTraffic"
                  checked={showTraffic}
                  onChange={(e) => setShowTraffic(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showTraffic" className="text-sm text-gray-600">Show Traffic</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showRoutes"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showRoutes" className="text-sm text-gray-600">Show Routes</label>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
              <select
                value={filterAgency}
                onChange={(e) => setFilterAgency(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Agencies</option>
                {getAgencyOptions().map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="stationary">Stationary</option>
                <option value="lowBattery">Low Battery</option>
                <option value="poorSignal">Poor Signal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-lg shadow">
            <InteractiveMap
              locations={getFilteredUnits()}
              center={mapCenter}
              zoom={mapZoom}
              onUnitSelect={handleUnitSelect}
              selectedUnitId={selectedUnit?.id}
              showTraffic={showTraffic}
              showRoutes={showRoutes}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Unit Locations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredUnits().map((unit) => (
                    <tr
                      key={unit.id}
                      onClick={() => handleUnitSelect(unit)}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedUnit?.id === unit.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{unit.unitNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{unit.agencyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {unit.latitude.toFixed(4)}, {unit.longitude.toFixed(4)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{unit.speed} mph</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${unit.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`}>
                          {unit.batteryLevel}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${unit.signalStrength > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {unit.signalStrength}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(unit.lastUpdated).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <InteractiveMap
                locations={getFilteredUnits()}
                center={mapCenter}
                zoom={mapZoom}
                onUnitSelect={handleUnitSelect}
                selectedUnitId={selectedUnit?.id}
                showTraffic={showTraffic}
                showRoutes={showRoutes}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Unit Details</h3>
              </div>
              <div className="p-6">
                {selectedUnit ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedUnit.unitNumber}</h4>
                      <p className="text-sm text-gray-600">{selectedUnit.agencyName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Speed</p>
                        <p className="text-lg text-gray-900">{selectedUnit.speed} mph</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Heading</p>
                        <p className="text-lg text-gray-900">{selectedUnit.heading}°</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Battery</p>
                        <p className={`text-lg ${selectedUnit.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUnit.batteryLevel}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Signal</p>
                        <p className={`text-lg ${selectedUnit.signalStrength > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {selectedUnit.signalStrength}%
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Location</p>
                      <p className="text-sm text-gray-900">
                        {selectedUnit.latitude.toFixed(6)}, {selectedUnit.longitude.toFixed(6)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Update</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedUnit.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📍</div>
                    <p>Select a unit on the map to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRealTimeTrackingDashboard;
