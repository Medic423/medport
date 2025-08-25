import React, { useState, useEffect } from 'react';
import { 
  TransportRequestWithDetails, 
  RequestStatus, 
  Priority, 
  TransportLevel,
  TransportRequestFilters 
} from '../types/transport';

interface TransportRequestListProps {
  onEditRequest: (request: TransportRequestWithDetails) => void;
  onViewRequest: (request: TransportRequestWithDetails) => void;
  onStatusChange: (requestId: string, newStatus: RequestStatus) => void;
  onCancelRequest: (requestId: string, reason?: string) => void;
  onDuplicateRequest: (request: TransportRequestWithDetails) => void;
}

const TransportRequestList: React.FC<TransportRequestListProps> = ({
  onEditRequest,
  onViewRequest,
  onStatusChange,
  onCancelRequest,
  onDuplicateRequest
}) => {
  const [requests, setRequests] = useState<TransportRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransportRequestFilters>({
    page: 1,
    limit: 25
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<RequestStatus | ''>('');

  // Load transport requests
  useEffect(() => {
    loadTransportRequests();
  }, [filters]);

  const loadTransportRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch(`/api/transport-requests?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[MedPort:TransportRequestList] Response status:', response.status, 'Response ok:', response.ok);
      
      // Handle non-OK responses first
      if (!response.ok) {
        console.log('[MedPort:TransportRequestList] Response not OK, handling error...');
        if (response.status === 401) {
          console.log('[MedPort:TransportRequestList] 401 status detected, throwing auth error');
          throw new Error('Authentication required. Please log in.');
        }
        
        // For other error statuses, provide generic error messages based on status code
        let errorMessage;
        if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (response.status >= 400) {
          errorMessage = 'Request failed. Please check your input and try again.';
        } else {
          errorMessage = `HTTP ${response.status}: Failed to load transport requests`;
        }
        
        console.log('[MedPort:TransportRequestList] Throwing error:', errorMessage);
        throw new Error(errorMessage);
      }

      // At this point, response.ok is true, so we can safely parse the JSON
      console.log('[MedPort:TransportRequestList] Response OK, parsing JSON...');
      const data = await response.json();
      setRequests(data.requests || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transport requests';
      console.error('[MedPort:TransportRequestList] Error loading requests:', err);
      console.log('[MedPort:TransportRequestList] Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TransportRequestFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

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

      if (response.ok) {
        onStatusChange(requestId, newStatus);
        // Reload the list to get updated data
        loadTransportRequests();
      } else {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        // Try to get error message, but don't fail if it's not JSON
        let errorMessage = `HTTP ${response.status}: Failed to update status`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('[MedPort:TransportRequestList] Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('[MedPort:TransportRequestList] Error updating status:', err);
      setError('Failed to update request status');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRequests.length === 0) return;

    try {
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch('/api/transport-requests/bulk-update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: selectedRequests,
          updates: { status: bulkAction }
        })
      });

      if (response.ok) {
        setSelectedRequests([]);
        setBulkAction('');
        loadTransportRequests();
      } else {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        // Try to get error message, but don't fail if it's not JSON
        let errorMessage = `HTTP ${response.status}: Failed to perform bulk action`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('[MedPort:TransportRequestList] Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('[MedPort:TransportRequestList] Error performing bulk action:', err);
      setError('Failed to perform bulk action');
    }
  };

  const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case RequestStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case RequestStatus.SCHEDULED: return 'bg-blue-100 text-blue-800';
      case RequestStatus.IN_TRANSIT: return 'bg-purple-100 text-purple-800';
      case RequestStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case RequestStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case Priority.LOW: return 'bg-gray-100 text-gray-800';
      case Priority.MEDIUM: return 'bg-blue-100 text-blue-800';
      case Priority.HIGH: return 'bg-orange-100 text-orange-800';
      case Priority.URGENT: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransportLevelColor = (level: TransportLevel): string => {
    switch (level) {
      case TransportLevel.BLS: return 'bg-green-100 text-green-800';
      case TransportLevel.ALS: return 'bg-yellow-100 text-yellow-800';
      case TransportLevel.CCT: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('Authentication required') || 
                       error.includes('Access token required') || 
                       error.includes('Unauthorized') ||
                       error.includes('401') ||
                       error.includes('Failed to load transport requests');
    return (
      <div className={`border rounded-md p-4 ${isAuthError ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
        <p className={isAuthError ? 'text-yellow-800' : 'text-red-600'}>
          {isAuthError ? '🔒 ' : '❌ '}{error}
        </p>
        {isAuthError ? (
          <div className="mt-3">
            <p className="text-yellow-700 text-sm mb-3">
              To use the Transport Request system, you need to be authenticated. This is a demo system, so you can:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/#status-board'}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 mr-2"
              >
                Go to Status Board
              </button>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={loadTransportRequests}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {Object.values(RequestStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              {Object.values(Priority).map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transport Level</label>
            <select
              value={filters.transportLevel || ''}
              onChange={(e) => handleFilterChange('transportLevel', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {Object.values(TransportLevel).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
            <select
              value={filters.limit || 25}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedRequests.length} request(s) selected
            </span>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as RequestStatus | '')}
                className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Action</option>
                {Object.values(RequestStatus).map(status => (
                  <option key={status} value={status}>Set Status: {status}</option>
                ))}
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedRequests([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRequests(requests.map(r => r.id));
                      } else {
                        setSelectedRequests([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origin → Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRequests(prev => [...prev, request.id]);
                        } else {
                          setSelectedRequests(prev => prev.filter(id => id !== request.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.patientId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{request.originFacility.name}</div>
                      <div className="text-gray-500 text-xs">→</div>
                      <div className="font-medium">{request.destinationFacility.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransportLevelColor(request.transportLevel)}`}>
                      {request.transportLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id, e.target.value as RequestStatus)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(request.status)}`}
                    >
                      {Object.values(RequestStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(request.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewRequest(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEditRequest(request)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDuplicateRequest(request)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Duplicate
                      </button>
                      {request.status !== RequestStatus.CANCELLED && request.status !== RequestStatus.COMPLETED && (
                        <button
                          onClick={() => onCancelRequest(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                disabled={(filters.page || 1) <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                disabled={(filters.page || 1) >= totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((filters.page || 1) - 1) * (filters.limit || 25) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((filters.page || 1) * (filters.limit || 25), total)}
                  </span>{' '}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                    disabled={(filters.page || 1) <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, (filters.page || 1) - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handleFilterChange('page', page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === (filters.page || 1)
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                    disabled={(filters.page || 1) >= totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {requests.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transport requests found</h3>
          <p className="text-gray-500">
            {Object.values(filters).some(f => f !== undefined && f !== null && f !== '')
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first transport request.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TransportRequestList;
