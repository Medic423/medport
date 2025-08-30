import React, { useState, useEffect } from 'react';
import { 
  MultiPatientTransport, 
  LongDistanceTransport, 
  Facility, 
  MultiPatientStatus, 
  LongDistanceStatus,
  TransportLevel,
  Priority 
} from '../types/transport';
import MultiPatientTransportForm from '../components/MultiPatientTransportForm';
import LongDistanceTransportForm from '../components/LongDistanceTransportForm';

interface AdvancedTransportProps {
  coordinatorId?: string;
}

const AdvancedTransport: React.FC<AdvancedTransportProps> = ({ coordinatorId = 'demo-coordinator' }) => {
  const [activeTab, setActiveTab] = useState<'multi-patient' | 'long-distance' | 'dashboard'>('dashboard');
  const [showMultiPatientForm, setShowMultiPatientForm] = useState(false);
  const [showLongDistanceForm, setShowLongDistanceForm] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [multiPatientTransports, setMultiPatientTransports] = useState<MultiPatientTransport[]>([]);
  const [longDistanceTransports, setLongDistanceTransports] = useState<LongDistanceTransport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load facilities and existing transports
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load facilities
      const facilitiesResponse = await fetch('http://localhost:5001/api/facilities?limit=100');
      if (facilitiesResponse.ok) {
        const facilitiesData = await facilitiesResponse.json();
        setFacilities(facilitiesData.data || []);
      }

      // Load multi-patient transports
      const multiPatientResponse = await fetch('http://localhost:5001/api/advanced-transport/multi-patient');
      if (multiPatientResponse.ok) {
        const multiPatientData = await multiPatientResponse.json();
        setMultiPatientTransports(multiPatientData.data || []);
      }

      // Load long-distance transports
      const longDistanceResponse = await fetch('http://localhost:5001/api/advanced-transport/long-distance');
      if (longDistanceResponse.ok) {
        const longDistanceData = await longDistanceResponse.json();
        setLongDistanceTransports(longDistanceData.data || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle multi-patient transport creation
  const handleMultiPatientSubmit = async (data: any) => {
    try {
      const response = await fetch('http://localhost:5001/api/advanced-transport/multi-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setMultiPatientTransports(prev => [result.data.transport, ...prev]);
        setShowMultiPatientForm(false);
        alert('Multi-patient transport created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create multi-patient transport');
      }
    } catch (err: any) {
      console.error('Error creating multi-patient transport:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle long-distance transport creation
  const handleLongDistanceSubmit = async (data: any) => {
    try {
      const response = await fetch('http://localhost:5001/api/advanced-transport/long-distance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setLongDistanceTransports(prev => [result.data.transport, ...prev]);
        setShowLongDistanceForm(false);
        alert('Long-distance transport created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create long-distance transport');
      }
    } catch (err: any) {
      console.error('Error creating long-distance transport:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'WEATHER_DELAYED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get transport level badge color
  const getTransportLevelBadgeColor = (level: TransportLevel) => {
    switch (level) {
      case TransportLevel.BLS:
        return 'bg-green-100 text-green-800';
      case TransportLevel.ALS:
        return 'bg-yellow-100 text-yellow-800';
      case TransportLevel.CCT:
        return 'bg-red-100 text-red-800';
      case TransportLevel.OTHER:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <button
              onClick={loadData}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showMultiPatientForm) {
    return (
      <MultiPatientTransportForm
        onSubmit={handleMultiPatientSubmit}
        onCancel={() => setShowMultiPatientForm(false)}
        facilities={facilities}
        coordinatorId={coordinatorId}
      />
    );
  }

  if (showLongDistanceForm) {
    return (
      <LongDistanceTransportForm
        onSubmit={handleLongDistanceSubmit}
        onCancel={() => setShowLongDistanceForm(false)}
        facilities={facilities}
        coordinatorId={coordinatorId}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advanced Transport Coordination
        </h1>
        <p className="text-gray-600">
          Manage multi-patient transports and long-distance planning with advanced route optimization
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('multi-patient')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'multi-patient'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Multi-Patient Transports
          </button>
          <button
            onClick={() => setActiveTab('long-distance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'long-distance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Long-Distance Transports
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowMultiPatientForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Multi-Patient Transport
              </button>
              <button
                onClick={() => setShowLongDistanceForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Plan Long-Distance Transport
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{multiPatientTransports.length}</div>
                  <div className="text-sm text-gray-500">Multi-Patient Transports</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{longDistanceTransports.length}</div>
                  <div className="text-sm text-gray-500">Long-Distance Transports</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {multiPatientTransports.filter(t => t.status === 'PLANNING').length}
                  </div>
                  <div className="text-sm text-gray-500">In Planning</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {multiPatientTransports.filter(t => t.status === 'COMPLETED').length + 
                     longDistanceTransports.filter(t => t.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {multiPatientTransports.length === 0 && longDistanceTransports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity. Create your first transport to get started.</p>
              ) : (
                <div className="space-y-4">
                  {[...multiPatientTransports, ...longDistanceTransports]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((transport: any) => (
                      <div key={transport.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            'batchNumber' in transport ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {('batchNumber' in transport ? transport.batchNumber : transport.transportNumber)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {('batchNumber' in transport ? 'Multi-Patient' : 'Long-Distance')} Transport
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(transport.status)}`}>
                            {transport.status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(transport.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Patient Transports Tab */}
      {activeTab === 'multi-patient' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Multi-Patient Transports</h2>
            <button
              onClick={() => setShowMultiPatientForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + New Transport
            </button>
          </div>

          {multiPatientTransports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No multi-patient transports</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new multi-patient transport.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowMultiPatientForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create Transport
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {multiPatientTransports.map((transport) => (
                      <tr key={transport.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transport.batchNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transport.totalPatients} patients
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transport.totalDistance.toFixed(1)} miles
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(transport.status)}`}>
                            {transport.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transport.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Long-Distance Transports Tab */}
      {activeTab === 'long-distance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Long-Distance Transports</h2>
            <button
              onClick={() => setShowLongDistanceForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              + New Transport
            </button>
          </div>

          {longDistanceTransports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No long-distance transports</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by planning a new long-distance transport.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowLongDistanceForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Plan Transport
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transport Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Legs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {longDistanceTransports.map((transport) => (
                      <tr key={transport.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transport.transportNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transport.legCount} legs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transport.totalDistance.toFixed(1)} miles
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(transport.status)}`}>
                            {transport.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transport.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedTransport;
