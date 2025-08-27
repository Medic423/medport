import React, { useState, useEffect } from 'react';

interface TransportRequest {
  id: string;
  patientId: string;
  originFacility: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  destinationFacility: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  transportLevel: 'BLS' | 'ALS' | 'CCT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  specialRequirements?: string;
  estimatedDistance: number;
  estimatedDuration: number;
  revenuePotential: number;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

interface TripAcceptanceProps {
  onNavigate?: (page: string) => void;
}

const TripAcceptance: React.FC<TripAcceptanceProps> = ({ onNavigate }) => {
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'PENDING',
    transportLevel: 'ALL',
    priority: 'ALL',
    maxDistance: '',
    minRevenue: ''
  });

  useEffect(() => {
    loadTransportRequests();
  }, [filters]);

  const loadTransportRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/agency/transport-requests?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransportRequests(data.requests || []);
      } else {
        throw new Error('Failed to load transport requests');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transport requests';
      console.error('[MedPort:TripAcceptance] Error loading transport requests:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTrip = async (requestId: string) => {
    try {
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      const response = await fetch(`/api/agency/transport-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Trip accepted successfully!');
        loadTransportRequests(); // Refresh the list
      } else {
        throw new Error('Failed to accept trip');
      }
    } catch (error) {
      console.error('[MedPort:TripAcceptance] Error accepting trip:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to accept trip'}`);
    }
  };

  const handleRejectTrip = async (requestId: string, reason: string) => {
    try {
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      const response = await fetch(`/api/agency/transport-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('Trip rejected successfully!');
        loadTransportRequests(); // Refresh the list
      } else {
        throw new Error('Failed to reject trip');
      }
    } catch (error) {
      console.error('[MedPort:TripAcceptance] Error rejecting trip:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to reject trip'}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CCT': return 'bg-purple-100 text-purple-800';
      case 'ALS': return 'bg-blue-100 text-blue-800';
      case 'BLS': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transport requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Transport Requests</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={loadTransportRequests}
                  className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trip Acceptance</h1>
          <p className="mt-2 text-gray-600">
            Review and accept available transport requests for your agency
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport Level</label>
              <select
                value={filters.transportLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, transportLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Levels</option>
                <option value="BLS">BLS</option>
                <option value="ALS">ALS</option>
                <option value="CCT">CCT</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Distance (miles)</label>
              <input
                type="number"
                value={filters.maxDistance}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: e.target.value }))}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Revenue ($)</label>
              <input
                type="number"
                value={filters.minRevenue}
                onChange={(e) => setFilters(prev => ({ ...prev, minRevenue: e.target.value }))}
                placeholder="No minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transport Requests */}
        <div className="space-y-6">
          {transportRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No transport requests match your current filters</p>
            </div>
          ) : (
            transportRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Patient {request.patientId}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(request.transportLevel)}`}>
                        {request.transportLevel}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Origin</h4>
                        <p className="text-gray-700">{request.originFacility.name}</p>
                        <p className="text-sm text-gray-500">
                          {request.originFacility.address}, {request.originFacility.city}, {request.originFacility.state}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Destination</h4>
                        <p className="text-gray-700">{request.destinationFacility.name}</p>
                        <p className="text-sm text-gray-500">
                          {request.destinationFacility.address}, {request.destinationFacility.city}, {request.destinationFacility.state}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="text-lg font-semibold text-gray-900">{request.estimatedDistance} miles</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="text-lg font-semibold text-gray-900">{request.estimatedDuration} min</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Revenue Potential</p>
                        <p className="text-lg font-semibold text-green-600">${request.revenuePotential.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {request.specialRequirements && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Special Requirements</h4>
                        <p className="text-gray-700">{request.specialRequirements}</p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Created: {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {request.status === 'PENDING' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAcceptTrip(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Accept Trip
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          handleRejectTrip(request.id, reason);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Reject Trip
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TripAcceptance;
