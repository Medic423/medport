import React, { useState, useEffect } from 'react';
import { TransportRequestWithDetails, RequestStatus, Priority, TransportLevel } from '../types/transport';
import StatusBoardComponent from '../components/StatusBoardComponent';
import StatusFilters from '../components/StatusFilters';
import StatusStats from '../components/StatusStats';

const StatusBoard: React.FC = () => {
  const [transportRequests, setTransportRequests] = useState<TransportRequestWithDetails[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TransportRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    transportLevel: '',
    searchTerm: '',
    originFacility: '',
    destinationFacility: ''
  });

  // Fetch transport requests
  const loadTransportRequests = async () => {
    try {
      setLoading(true);
      
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch('/api/transport-requests?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Handle authentication errors gracefully
        if (response.status === 401) {
          console.warn('[MedPort:StatusBoard] Authentication required - running in demo mode');
          setTransportRequests([]);
          setError('Authentication required. This is a demo version with no data.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTransportRequests(data.requests || []);
      setError(null);
    } catch (err) {
      console.error('[MedPort:StatusBoard] Error fetching transport requests:', err);
      setError('Failed to load transport requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...transportRequests];
    
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(req => req.priority === filters.priority);
    }
    if (filters.transportLevel) {
      filtered = filtered.filter(req => req.transportLevel === filters.transportLevel);
    }
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.patientId.toLowerCase().includes(searchLower) ||
        req.originFacility.name.toLowerCase().includes(searchLower) ||
        req.destinationFacility.name.toLowerCase().includes(searchLower) ||
        req.specialRequirements?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.originFacility) {
      filtered = filtered.filter(req => req.originFacility.id === filters.originFacility);
    }
    if (filters.destinationFacility) {
      filtered = filtered.filter(req => req.destinationFacility.id === filters.destinationFacility);
    }

    setFilteredRequests(filtered);
  }, [transportRequests, filters]);

  // Update request status
  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    try {
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch(`/api/transport-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required to update status. This is a demo version.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setTransportRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, updatedAt: new Date().toISOString() }
            : req
        )
      );

      console.log(`[MedPort:StatusBoard] Status updated for request ${requestId} to ${newStatus}`);
    } catch (err) {
      console.error('[MedPort:StatusBoard] Error updating request status:', err);
      setError('Failed to update request status. Please try again.');
    }
  };

  // Refresh data
  const handleRefresh = () => {
    loadTransportRequests();
  };

  // Initial load
  useEffect(() => {
    loadTransportRequests();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadTransportRequests, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && transportRequests.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading status board...</p>
        </div>
      </div>
    );
  }

  // Auto-refresh indicator
  const autoRefreshIndicator = (
    <div className="mt-6 text-center text-sm text-gray-500">
      <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
        Auto-refreshing every 30 seconds
      </span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Status Board</h1>
            <p className="mt-2 text-gray-600">
              Real-time monitoring of all transport requests
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <StatusStats transportRequests={transportRequests} />

      {/* Filters */}
      <StatusFilters 
        filters={filters} 
        setFilters={setFilters}
        transportRequests={transportRequests}
      />

      {/* Status Board */}
      <div className="mt-6">
        <StatusBoardComponent
          transportRequests={filteredRequests}
          onStatusUpdate={handleStatusChange}
          loading={loading}
        />
      </div>

      {/* Auto-refresh indicator */}
      {autoRefreshIndicator}
    </div>
  );
};

export default StatusBoard;
