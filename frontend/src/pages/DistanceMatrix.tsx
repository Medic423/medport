import React, { useState, useEffect } from 'react';
import DistanceMatrixComponent from '../components/DistanceMatrixComponent';
import DistanceMatrixAdmin from '../components/DistanceMatrixAdmin';
import { Facility } from '../types/transport';

const DistanceMatrix: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'admin'>('matrix');

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication token
      const token = localStorage.getItem('token');
      const demoMode = localStorage.getItem('demoMode');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (demoMode === 'true') {
        headers['Authorization'] = 'Bearer demo-token';
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/facilities', {
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to load facilities: ${response.statusText}`);
      }

      const result = await response.json();
      setFacilities(result.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading facilities:', error);
      setError('Error loading facilities');
      setLoading(false);
    }
  };

  const handleDistanceUpdate = (fromFacilityId: string, toFacilityId: string, distance: number, time: number) => {
    console.log(`Distance updated: ${fromFacilityId} to ${toFacilityId} - ${distance} miles, ${time} minutes`);
    // This could trigger updates in other components or refresh related data
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Facilities</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadFacilities}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Distance Matrix Management</h1>
          <p className="mt-2 text-gray-600">
            Manage facility-to-facility distances, calculate routes, and optimize transport planning.
          </p>
        </div>



        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'matrix', label: 'Distance Matrix', icon: '📍' },
              { id: 'admin', label: 'Administration', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'matrix' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Facilities</p>
                    <p className="text-2xl font-semibold text-gray-900">{facilities.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Distance Entries</p>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Optimization Score</p>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg">
              <DistanceMatrixComponent
                facilities={facilities}
                onDistanceUpdate={handleDistanceUpdate}
              />
            </div>
          </>
        )}

        {activeTab === 'admin' && (
          <DistanceMatrixAdmin facilities={facilities} />
        )}

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">About the Distance Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Automatic Distance Calculation</h4>
              <p className="text-blue-600">
                The system automatically calculates distances using Google Maps API when available, 
                with fallback to coordinate-based calculations for offline scenarios.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Route Optimization Ready</h4>
              <p className="text-blue-600">
                Distance data powers the route optimization engine, enabling chained trips, 
                return trip planning, and revenue maximization for transport agencies.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Real-time Updates</h4>
              <p className="text-blue-600">
                Distances are cached for 24 hours and automatically updated when recalculated, 
                ensuring optimal performance and accuracy.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Multi-route Support</h4>
              <p className="text-blue-600">
                Support for different route types including fastest, shortest, most efficient, 
                and lowest cost options for various transport scenarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistanceMatrix;
