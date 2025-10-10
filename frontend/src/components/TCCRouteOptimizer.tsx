import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Navigation,
  Settings,
  Clock,
  MapPin,
  DollarSign,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import optimizationApi from '../services/optimizationApi';
import {
  Unit,
  TransportRequest,
  OptimizationResponse,
  BackhaulAnalysisResponse,
  RevenueAnalyticsResponse,
  PerformanceMetricsResponse,
  OptimizationSettings
} from '../types/optimization';

const TCCRouteOptimizer: React.FC = () => {
  // State management
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TransportRequest[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResponse | null>(null);
  const [backhaulAnalysis, setBackhaulAnalysis] = useState<BackhaulAnalysisResponse | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalyticsResponse | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsResponse | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    weights: {
      deadheadMiles: 0.5,
      waitTime: 0.1,
      backhaulBonus: 25.0,
      overtimeRisk: 2.0,
      baseRevenue: 1.0
    },
    constraints: {
      maxDeadheadMiles: 50,
      maxWaitTime: 120,
      maxOvertimeHours: 2,
      maxBackhaulDistance: 15,
      maxBackhaulTimeWindow: 90
    },
    autoOptimize: false,
    refreshInterval: 30
  });

  // Load initial data and settings
  useEffect(() => {
    loadInitialData();
    loadSavedSettings();
  }, []);

  const loadSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('tcc_optimization_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setOptimizationSettings(prev => ({ ...prev, ...parsed }));
        console.log('TCC_DEBUG: Loaded saved optimization settings');
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error loading saved settings:', error);
    }
  };

  // Auto-refresh when enabled
  useEffect(() => {
    if (optimizationSettings.autoOptimize) {
      const interval = setInterval(() => {
        if (selectedUnit && selectedRequests.length > 0) {
          handleOptimize();
        }
      }, optimizationSettings.refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [optimizationSettings.autoOptimize, optimizationSettings.refreshInterval, selectedUnit, selectedRequests]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadUnits(),
        loadPendingRequests(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('TCC_DEBUG: Error loading initial data:', error);
      setError('Failed to load initial data');
    }
  };

  const loadUnits = async () => {
    setLoadingUnits(true);
    try {
      console.log('TCC_DEBUG: Loading system-wide units for TCC optimization');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/api/tcc/units');

      if (!response.data?.success) {
        throw new Error(`Failed to fetch units: ${response.data?.message || 'Unknown error'}`);
      }

      const data = response.data;
      console.log('TCC_DEBUG: Units API response:', data);
      
      if (data.success) {
        console.log('TCC_DEBUG: Units loaded:', data.data?.length || 0);
        setAvailableUnits(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load units');
      }
    } catch (err) {
      setError('Failed to load units');
      console.error('TCC_DEBUG: Units loading error:', err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const loadPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      console.log('TCC_DEBUG: Loading system-wide pending requests for TCC optimization');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // For now, we'll load trips that are pending as transport requests
      const response = await api.get('/api/trips?status=PENDING');

      if (!response.data?.success) {
        throw new Error(`Failed to fetch pending requests: ${response.data?.message || 'Unknown error'}`);
      }

      const data = response.data;
      console.log('TCC_DEBUG: Pending requests API response:', data);
      
      if (data.success) {
        // Convert trips to transport requests format
        const transportRequests = (data.data || []).map((trip: any) => ({
          id: trip.id,
          patientId: trip.patientId,
          originFacilityId: trip.fromFacilityId || trip.fromLocation || 'Unknown',
          destinationFacilityId: trip.toFacilityId || trip.toLocation || 'Unknown',
          transportLevel: trip.transportLevel || 'BLS',
          priority: trip.priority || 'MEDIUM',
          status: trip.status || 'PENDING',
          specialRequirements: trip.specialNeeds || trip.specialRequirements || '',
          requestTimestamp: new Date(trip.requestTimestamp || trip.createdAt),
          readyStart: new Date(trip.scheduledTime || trip.createdAt),
          readyEnd: new Date(new Date(trip.scheduledTime || trip.createdAt).getTime() + 60 * 60 * 1000), // 1 hour window
          originLocation: {
            lat: trip.originLatitude || 40.7128,
            lng: trip.originLongitude || -74.0060
          },
          destinationLocation: {
            lat: trip.destinationLatitude || 40.7589,
            lng: trip.destinationLongitude || -73.9851
          }
        }));
        
        console.log('TCC_DEBUG: Pending requests loaded:', transportRequests.length);
        setPendingRequests(transportRequests);
      } else {
        throw new Error(data.error || 'Failed to load pending requests');
      }
    } catch (err) {
      setError('Failed to load pending requests');
      console.error('TCC_DEBUG: Requests loading error:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      console.log('TCC_DEBUG: Loading analytics data...');
      const [revenueData, performanceData] = await Promise.all([
        optimizationApi.getRevenueAnalytics('24h'),
        optimizationApi.getPerformanceMetrics('24h')
      ]);

      console.log('TCC_DEBUG: Revenue analytics response:', revenueData);
      console.log('TCC_DEBUG: Performance metrics response:', performanceData);

      setRevenueAnalytics(revenueData);
      setPerformanceMetrics(performanceData);
    } catch (err) {
      console.error('TCC_DEBUG: Analytics loading error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedUnit || selectedRequests.length === 0) {
      setError('Please select a unit and at least one request');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await optimizationApi.optimizeRoutes({
        unitId: selectedUnit,
        requestIds: selectedRequests,
        constraints: optimizationSettings.constraints
      });

      setOptimizationResults(response);
    } catch (err) {
      setError('Failed to optimize routes');
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackhaulAnalysis = async () => {
    if (selectedRequests.length < 2) {
      setError('Please select at least 2 requests for backhaul analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('TCC_DEBUG: Starting backhaul analysis with selected requests:', selectedRequests);
      const response = await optimizationApi.analyzeBackhaul(selectedRequests);
      console.log('TCC_DEBUG: Backhaul analysis response:', response);

      setBackhaulAnalysis(response);
    } catch (err) {
      setError('Failed to analyze backhaul opportunities');
      console.error('TCC_DEBUG: Backhaul analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnTripAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('TCC_DEBUG: Starting return trip analysis...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/api/optimize/return-trips');

      if (!response.data?.success) {
        throw new Error(`Failed to fetch return trips: ${response.data?.message || 'Unknown error'}`);
      }

      const data = response.data;
      console.log('TCC_DEBUG: Return trips response:', data);
      
      if (data.success) {
        // Convert return trips to backhaul analysis format for display
        const backhaulResponse = {
          success: true,
          data: {
            pairs: data.data.returnTrips || [],
            statistics: data.data.statistics || {},
            recommendations: data.data.recommendations || []
          }
        };
        setBackhaulAnalysis(backhaulResponse);
      } else {
        throw new Error(data.error || 'Failed to load return trips');
      }
    } catch (err) {
      setError('Failed to analyze return trip opportunities');
      console.error('TCC_DEBUG: Return trip analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestToggle = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Route Optimization</h1>
          <p className="mt-1 text-sm text-gray-500">
            Optimize routes across all agencies and units in the system.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button
            onClick={loadInitialData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Settings</h3>
          
          {/* Auto-optimization Settings */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Auto-Optimization</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-optimize every {optimizationSettings.refreshInterval} seconds
                </label>
                <input
                  type="checkbox"
                  checked={optimizationSettings.autoOptimize}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    autoOptimize: e.target.checked
                  }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  value={optimizationSettings.refreshInterval}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    refreshInterval: parseInt(e.target.value) || 30
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="10"
                  max="300"
                />
              </div>
            </div>
          </div>

          {/* Optimization Weights */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Optimization Weights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadhead Miles Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={optimizationSettings.weights.deadheadMiles}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    weights: { ...prev.weights, deadheadMiles: parseFloat(e.target.value) || 0.5 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wait Time Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={optimizationSettings.weights.waitTime}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    weights: { ...prev.weights, waitTime: parseFloat(e.target.value) || 0.1 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backhaul Bonus ($)
                </label>
                <input
                  type="number"
                  step="5"
                  value={optimizationSettings.weights.backhaulBonus}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    weights: { ...prev.weights, backhaulBonus: parseFloat(e.target.value) || 25.0 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Risk Weight
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={optimizationSettings.weights.overtimeRisk}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    weights: { ...prev.weights, overtimeRisk: parseFloat(e.target.value) || 2.0 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="5"
                />
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Constraints</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Deadhead Miles
                </label>
                <input
                  type="number"
                  value={optimizationSettings.constraints.maxDeadheadMiles}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxDeadheadMiles: parseInt(e.target.value) || 50 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="10"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Wait Time (minutes)
                </label>
                <input
                  type="number"
                  value={optimizationSettings.constraints.maxWaitTime}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxWaitTime: parseInt(e.target.value) || 120 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="30"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Overtime Hours
                </label>
                <input
                  type="number"
                  value={optimizationSettings.constraints.maxOvertimeHours}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxOvertimeHours: parseInt(e.target.value) || 2 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Backhaul Distance (miles)
                </label>
                <input
                  type="number"
                  value={optimizationSettings.constraints.maxBackhaulDistance}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxBackhaulDistance: parseInt(e.target.value) || 15 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="5"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                // Save settings to localStorage
                localStorage.setItem('tcc_optimization_settings', JSON.stringify(optimizationSettings));
                setShowSettings(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Unit and Request Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Unit</h3>
          {loadingUnits ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600">Loading units...</span>
            </div>
          ) : (
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Select a unit...</option>
              {availableUnits && availableUnits.length > 0 ? availableUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNumber || 'Unknown'} ({unit.type || 'Unknown'}) - {unit.currentStatus || 'Unknown'}
                </option>
              )) : (
                <option disabled>No units available</option>
              )}
            </select>
          )}
        </div>

        {/* Request Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Requests</h3>
          {loadingRequests ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600">Loading requests...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pendingRequests && pendingRequests.length > 0 ? pendingRequests.map((request) => (
                <label key={request.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleRequestToggle(request.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {request.patientId || 'Unknown'} - {request.originFacilityId || 'Unknown'} → {request.destinationFacilityId || 'Unknown'}
                  </span>
                </label>
              )) : (
                <p className="text-sm text-gray-500">No pending requests available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleOptimize}
          disabled={loading || !selectedUnit || selectedRequests.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 mr-2" />
          )}
          Optimize Routes
        </button>

        <button
          onClick={handleBackhaulAnalysis}
          disabled={loading || selectedRequests.length < 2}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Target className="h-4 w-4 mr-2" />
          Analyze Backhaul
        </button>

        <button
          onClick={handleReturnTripAnalysis}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Find Return Trips
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Results */}
      {optimizationResults && optimizationResults.success && optimizationResults.data && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Total Revenue</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ${typeof optimizationResults.data.totalRevenue === 'number' ? optimizationResults.data.totalRevenue.toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Total Distance</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {typeof optimizationResults.data.totalDeadheadMiles === 'number' ? optimizationResults.data.totalDeadheadMiles.toFixed(1) : '0.0'} mi
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Total Wait Time</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {typeof optimizationResults.data.totalWaitTime === 'number' ? optimizationResults.data.totalWaitTime.toFixed(0) : '0'} min
              </p>
            </div>
          </div>
          
          {/* Optimization Details */}
          {optimizationResults.data.optimizedRequests && optimizationResults.data.optimizedRequests.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Optimized Requests</h4>
              <div className="space-y-2">
                {optimizationResults.data.optimizedRequests.map((request: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Request {index + 1}</span>
                      <span className="text-sm text-gray-500 ml-2">Score: {typeof request.score === 'number' ? request.score.toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Revenue: ${typeof request.revenue === 'number' ? request.revenue.toFixed(2) : '0.00'} | 
                      Deadhead: {typeof request.deadheadMiles === 'number' ? request.deadheadMiles.toFixed(1) : '0.0'} mi
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backhaul Analysis Results */}
      {backhaulAnalysis && backhaulAnalysis.success && backhaulAnalysis.data && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Backhaul Analysis</h3>
          <div className="space-y-4">
            {backhaulAnalysis.data.pairs && backhaulAnalysis.data.pairs.map((pair: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pair.request1?.patientId || 'Unknown'} → {pair.request2?.patientId || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Potential savings: ${typeof pair.revenueBonus === 'number' ? pair.revenueBonus.toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Distance: {typeof pair.distance === 'number' ? pair.distance.toFixed(1) : '0.0'} mi | 
                      Time Window: {pair.timeWindow || '0'} min | 
                      Efficiency: {typeof pair.efficiency === 'number' ? (pair.efficiency * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
            {(!backhaulAnalysis.data.pairs || backhaulAnalysis.data.pairs.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No backhaul opportunities found</p>
            )}
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Performance Analytics</h3>
        
        {loadingAnalytics ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            {revenueAnalytics && revenueAnalytics.success && revenueAnalytics.data && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">System Revenue (24h)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="text-sm font-medium">${typeof revenueAnalytics.data.totalRevenue === 'number' ? revenueAnalytics.data.totalRevenue.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue per Hour:</span>
                    <span className="text-sm font-medium">${typeof revenueAnalytics.data.revenuePerHour === 'number' ? revenueAnalytics.data.revenuePerHour.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loaded Mile Ratio:</span>
                    <span className="text-sm font-medium">{typeof revenueAnalytics.data.loadedMileRatio === 'number' ? (revenueAnalytics.data.loadedMileRatio * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {performanceMetrics && performanceMetrics.success && performanceMetrics.data && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">System Performance (24h)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Trips:</span>
                    <span className="text-sm font-medium">{performanceMetrics.data.totalTrips || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Response Time:</span>
                    <span className="text-sm font-medium">{typeof performanceMetrics.data.averageResponseTime === 'number' ? performanceMetrics.data.averageResponseTime.toFixed(1) : '0.0'} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efficiency:</span>
                    <span className="text-sm font-medium">{typeof performanceMetrics.data.efficiency === 'number' ? (performanceMetrics.data.efficiency * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TCCRouteOptimizer;
