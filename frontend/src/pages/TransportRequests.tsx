import React, { useState } from 'react';
import TransportRequestForm, { TransportRequestFormData } from '../components/TransportRequestForm';
import TransportRequestList from '../components/TransportRequestList';
import { TransportRequestWithDetails, RequestStatus } from '../types/transport';

const TransportRequests: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<TransportRequestWithDetails | null>(null);
  const [viewingRequest, setViewingRequest] = useState<TransportRequestWithDetails | null>(null);
  const [duplicatingRequest, setDuplicatingRequest] = useState<TransportRequestWithDetails | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh the transport requests list
  const refreshTransportRequests = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateRequest = async (formData: TransportRequestFormData) => {
    try {
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch('/api/transport-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        try {
          const result = await response.json();
          console.log('[MedPort:TransportRequests] Request created:', result);
          setShowForm(false);
          // Show success message and refresh data
          alert('Transport request created successfully!');
          // Refresh the transport requests list without page reload
          refreshTransportRequests();
        } catch (parseError) {
          console.error('[MedPort:TransportRequests] Failed to parse success response:', parseError);
          setShowForm(false);
          alert('Transport request created successfully!');
          // Refresh the transport requests list without page reload
          refreshTransportRequests();
        }
      } else {
        let errorMessage = 'Failed to create transport request';
        try {
          const error = await response.json();
          errorMessage = error.details || errorMessage;
        } catch (parseError) {
          console.warn('[MedPort:TransportRequests] Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[MedPort:TransportRequests] Error creating request:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create request'}`);
    }
  };

  const handleEditRequest = async (formData: TransportRequestFormData) => {
    if (!editingRequest) return;

    try {
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch(`/api/transport-requests/${editingRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        try {
          const result = await response.json();
          console.log('[MedPort:TransportRequests] Request updated:', result);
          setEditingRequest(null);
          // Show success message and refresh data
          alert('Transport request updated successfully!');
          // Refresh the transport requests list without page reload
          refreshTransportRequests();
        } catch (parseError) {
          console.error('[MedPort:TransportRequests] Failed to parse success response:', parseError);
          setEditingRequest(null);
          alert('Transport request updated successfully!');
          setShowForm(false);
          // Refresh the transport requests list without page reload
          refreshTransportRequests();
        }
      } else {
        let errorMessage = 'Failed to update transport request';
        try {
          const error = await response.json();
          errorMessage = error.details || errorMessage;
        } catch (parseError) {
          console.warn('[MedPort:TransportRequests] Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[MedPort:TransportRequests] Error updating request:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update request'}`);
    }
  };

  const handleDuplicateRequest = async (formData: TransportRequestFormData) => {
    if (!duplicatingRequest) return;

    try {
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch(`/api/transport-requests/${duplicatingRequest.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        try {
          const result = await response.json();
          console.log('[MedPort:TransportRequests] Request duplicated:', result);
          setDuplicatingRequest(null);
          // Show success message and refresh data
          alert('Transport request duplicated successfully!');
          // Refresh the transport requests list without page reload
          refreshTransportRequests();
        } catch (parseError) {
          console.error('[MedPort:TransportRequests] Failed to parse success response:', parseError);
          setDuplicatingRequest(null);
          alert('Transport request duplicated successfully!');
          // Refresh the transport requests list without page reload
          refreshTransportRequests();
        }
      } else {
        let errorMessage = 'Failed to duplicate transport request';
        try {
          const error = await response.json();
          errorMessage = error.details || errorMessage;
        } catch (parseError) {
          console.warn('[MedPort:TransportRequests] Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[MedPort:TransportRequests] Error duplicating request:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to duplicate request'}`);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancellingRequest) return;

    try {
      const response = await fetch(`/api/transport-requests/${cancellingRequest}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (response.ok) {
        try {
          const result = await response.json();
          console.log('[MedPort:TransportRequests] Request cancelled:', result);
          setCancellingRequest(null);
          setCancelReason('');
          // Show success message and refresh data
          alert('Transport request cancelled successfully!');
          // Refresh the transport requests list without page reload
          refreshTransportRequests();
        } catch (parseError) {
          console.error('[MedPort:TransportRequests] Failed to parse success response:', parseError);
          setCancellingRequest(null);
          setCancelReason('');
          alert('Transport request cancelled successfully!');
          // Refresh the transport requests list without page reload
          refreshTransportRequests();
        }
      } else {
        let errorMessage = 'Failed to cancel transport request';
        try {
          const error = await response.json();
          errorMessage = error.details || errorMessage;
        } catch (parseError) {
          console.warn('[MedPort:TransportRequests] Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[MedPort:TransportRequests] Error cancelling request:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to cancel request'}`);
    }
  };

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    console.log('[MedPort:TransportRequests] Status changed:', { requestId, newStatus });
    // The list component handles the API call, this is just for logging
  };

  const handleFormSubmit = (formData: TransportRequestFormData) => {
    if (editingRequest) {
      handleEditRequest(formData);
    } else if (duplicatingRequest) {
      handleDuplicateRequest(formData);
    } else {
      handleCreateRequest(formData);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRequest(null);
    setDuplicatingRequest(null);
  };

  const getFormTitle = (): string => {
    if (editingRequest) return 'Edit Transport Request';
    if (duplicatingRequest) return 'Duplicate Transport Request';
    return 'Create New Transport Request';
  };

  const getInitialData = (): Partial<TransportRequestFormData> | undefined => {
    if (editingRequest) {
      return {
        patientId: editingRequest.patientId,
        originFacilityId: editingRequest.originFacility.name,
        destinationFacilityId: editingRequest.destinationFacility.name,
        transportLevel: editingRequest.transportLevel,
        priority: editingRequest.priority,
        specialRequirements: editingRequest.specialRequirements || ''
      };
    }
    if (duplicatingRequest) {
      return {
        originFacilityId: duplicatingRequest.originFacility.name,
        destinationFacilityId: duplicatingRequest.destinationFacility.name,
        transportLevel: duplicatingRequest.transportLevel,
        priority: duplicatingRequest.priority,
        specialRequirements: duplicatingRequest.specialRequirements || ''
      };
    }
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transport Requests</h1>
              <p className="mt-2 text-gray-600">
                Manage medical transport requests and coordinate patient transfers
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + New Request
            </button>
          </div>
        </div>

        {/* Main Content */}
        {showForm || editingRequest || duplicatingRequest ? (
          <TransportRequestForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={getInitialData()}
            isEditing={!!editingRequest}
          />
        ) : (
          <TransportRequestList
            key={refreshKey}
            onEditRequest={setEditingRequest}
            onViewRequest={setViewingRequest}
            onStatusChange={handleStatusChange}
            onCancelRequest={setCancellingRequest}
            onDuplicateRequest={setDuplicatingRequest}
          />
        )}

        {/* View Request Modal */}
        {viewingRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Transport Request Details</h3>
                  <button
                    onClick={() => setViewingRequest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingRequest.patientId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingRequest.status}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Origin Facility</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewingRequest.originFacility.name}
                      <br />
                      <span className="text-gray-500">
                        {viewingRequest.originFacility.address}, {viewingRequest.originFacility.city}, {viewingRequest.originFacility.state}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination Facility</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewingRequest.destinationFacility.name}
                      <br />
                      <span className="text-gray-500">
                        {viewingRequest.destinationFacility.address}, {viewingRequest.destinationFacility.city}, {viewingRequest.destinationFacility.state}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transport Level</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingRequest.transportLevel}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingRequest.priority}</p>
                    </div>
                  </div>

                  {viewingRequest.specialRequirements && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingRequest.specialRequirements}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(viewingRequest.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created By</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingRequest.createdBy.email}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditingRequest(viewingRequest);
                      setViewingRequest(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setViewingRequest(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Request Modal */}
        {cancellingRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Transport Request</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reason for cancellation..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setCancellingRequest(null);
                      setCancelReason('');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCancelRequest}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportRequests;
