import React, { useState, useEffect } from 'react';
import TripCancellationDialog from '../components/TripCancellationDialog';
import { apiRequest } from '../utils/api';

// Trip Details Modal Component
const TripDetailsModal: React.FC<{
  trip: Trip;
  editedTrip: Trip;
  isEditing: boolean;
  onClose: () => void;
  onEditToggle: () => void;
  onFieldUpdate: (field: keyof Trip, value: string | number) => void;
  onSaveChanges: () => void;
  onCancelEdit: () => void;
  onCancelTrip: (trip: Trip) => void;
  formatTime: (timestamp: string) => string;
  calculateTimeLapse: (startTime: string, endTime: string) => string;
  getTimeUntilEta: (etaTimestamp: string) => string;
}> = ({ 
  trip, 
  editedTrip, 
  isEditing, 
  onClose, 
  onEditToggle, 
  onFieldUpdate, 
  onSaveChanges, 
  onCancelEdit,
  onCancelTrip,
  formatTime, 
  calculateTimeLapse, 
  getTimeUntilEta 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Trip Details' : 'Trip Details'}
          </h3>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <div className="flex space-x-2">
                {trip.status === 'pending' && (
                  <button
                    onClick={() => onCancelTrip(trip)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Cancel Trip
                  </button>
                )}
                <button
                  onClick={onEditToggle}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={onSaveChanges}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Patient Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTrip.patientName || ''}
                    onChange={(e) => onFieldUpdate('patientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{trip.patientName || 'Not specified'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedTrip.patientAge || ''}
                    onChange={(e) => onFieldUpdate('patientAge', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{trip.patientAge || 'Not specified'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTrip.patientCondition || ''}
                    onChange={(e) => onFieldUpdate('patientCondition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{trip.patientCondition || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Trip Overview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Transport Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <p className="text-sm text-gray-900">{trip.origin}</p>
                <p className="text-sm text-gray-900">↓</p>
                <p className="text-sm text-gray-900">{trip.destination}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transport Level</label>
                {isEditing ? (
                  <select
                    value={editedTrip.transportLevel}
                    onChange={(e) => onFieldUpdate('transportLevel', e.target.value as 'ALS' | 'BLS' | 'CCT' | 'Other')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BLS">BLS</option>
                    <option value="ALS">ALS</option>
                    <option value="CCT">CCT</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-900">{trip.transportLevel}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EMS Agency</label>
                <p className="text-sm text-gray-900">{trip.emsAgency || 'Not assigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                <p className="text-sm text-gray-900">{trip.unitNumber || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Timing Information</h4>
            <p className="text-xs text-gray-500 mb-4">
              Request time is auto-set when trip is created. Acceptance and arrival times are set manually by hospital staff.
            </p>
            <div className="space-y-3">
              {/* Request Time */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Transfer Request Time</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Auto-set</span>
                </div>
                <span className="text-sm text-gray-900">{formatTime(trip.requestTime)}</span>
              </div>

              {/* Acceptance Time */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Transfer Accepted Time</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Editable</span>
                </div>
                <div className="text-right">
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={editedTrip.acceptedTime ? new Date(editedTrip.acceptedTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => onFieldUpdate('acceptedTime', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : trip.acceptedTime ? (
                    <>
                      <span className="text-sm text-gray-900">{formatTime(trip.acceptedTime)}</span>
                      <p className="text-xs text-gray-500">
                        ({calculateTimeLapse(trip.requestTime, trip.acceptedTime)} after request)
                      </p>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Not set</span>
                  )}
                </div>
              </div>

              {/* Arrival Time */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">EMS Arrival Time</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Editable</span>
                </div>
                <div className="text-right">
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={editedTrip.arrivalTime ? new Date(editedTrip.arrivalTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => onFieldUpdate('arrivalTime', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : trip.arrivalTime ? (
                    <>
                      <span className="text-sm text-gray-900">{formatTime(trip.arrivalTime)}</span>
                      {trip.acceptedTime && (
                        <p className="text-xs text-gray-500">
                          ({calculateTimeLapse(trip.acceptedTime, trip.arrivalTime)} after acceptance)
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Not set</span>
                  )}
                </div>
              </div>

              {/* ETA */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Estimated Arrival</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Editable</span>
                </div>
                <div className="text-right">
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={editedTrip.eta ? new Date(editedTrip.eta).toISOString().slice(0, 16) : ''}
                      onChange={(e) => onFieldUpdate('eta', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : trip.eta ? (
                    <>
                      <span className="text-sm text-gray-900">{formatTime(trip.eta)}</span>
                      <p className="text-xs text-gray-500">{getTimeUntilEta(trip.eta)}</p>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Not set</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Special Requirements</h4>
            {isEditing ? (
              <textarea
                value={editedTrip.specialRequirements || ''}
                onChange={(e) => onFieldUpdate('specialRequirements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter special medical requirements..."
              />
            ) : (
              <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-lg">
                {trip.specialRequirements || 'No special requirements specified'}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3">Contact Information</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedTrip.contactPhone || ''}
                  onChange={(e) => onFieldUpdate('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              ) : (
                <p className="text-sm text-gray-900">{trip.contactPhone || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
            {isEditing ? (
              <textarea
                value={editedTrip.notes || ''}
                onChange={(e) => onFieldUpdate('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Add any additional notes or updates..."
              />
            ) : (
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                {trip.notes || 'No notes available'}
              </p>
            )}
          </div>

          {/* Status Summary */}
          <div className={`p-4 rounded-lg ${
            trip.status === 'cancelled' ? 'bg-red-50' : 'bg-blue-50'
          }`}>
            <h4 className={`font-medium mb-2 ${
              trip.status === 'cancelled' ? 'text-red-900' : 'text-blue-900'
            }`}>Current Status</h4>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                trip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                trip.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                trip.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('-', ' ')}
              </span>
              {trip.status === 'pending' && (
                <span className="text-xs text-gray-500">Awaiting EMS acceptance</span>
              )}
              {trip.status === 'accepted' && (
                <span className="text-xs text-gray-500">EMS en route</span>
              )}
              {trip.status === 'in-progress' && (
                <span className="text-xs text-gray-500">Transport in progress</span>
              )}
              {trip.status === 'cancelled' && (
                <span className="text-xs text-red-600">
                  {trip.cancellationReason ? `Reason: ${trip.cancellationReason}` : 'Trip cancelled'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Trip {
  id: string;
  origin: string;
  destination: string;
  transportLevel: 'ALS' | 'BLS' | 'CCT' | 'Other';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  requestTime: string;
  acceptedTime?: string;
  arrivalTime?: string;
  eta?: string;
  emsAgency?: string;
  unitNumber?: string;
  specialRequirements?: string;
  patientName?: string;
  patientAge?: number;
  patientCondition?: string;
  contactPhone?: string;
  notes?: string;
  cancellationReason?: string;
}

interface HospitalDashboardProps {
  onNavigate?: (page: string) => void;
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ onNavigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrip, setEditedTrip] = useState<Trip | null>(null);

  // Debug state changes
  useEffect(() => {
    console.log('[DEBUG] State changed:', {
      showTripDetails,
      selectedTrip: selectedTrip?.id,
      editedTrip: editedTrip?.id,
      isEditing
    });
  }, [showTripDetails, selectedTrip, editedTrip, isEditing]);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [tripToCancel, setTripToCancel] = useState<Trip | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Load real transport requests from API
  const loadTransportRequests = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/transport-requests?limit=20');
      
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match Trip interface
        const apiTrips: Trip[] = (data.requests || []).map((req: any) => ({
          id: req.id,
          origin: req.originFacility?.name || 'Unknown Origin',
          destination: req.destinationFacility?.name || 'Unknown Destination',
          transportLevel: req.transportLevel,
          status: req.status?.toLowerCase() || 'pending',
          requestTime: req.requestTimestamp || req.createdAt,
          acceptedTime: req.acceptedTimestamp,
          arrivalTime: req.pickupTimestamp,
          eta: req.estimatedArrivalTime,
          emsAgency: req.assignedAgency?.name || 'Not Assigned',
          unitNumber: req.assignedUnit?.unitNumber || 'Not Assigned',
          specialRequirements: req.specialRequirements || '',
          patientName: `Patient ${req.patientId}`,
          patientAge: 0, // Not available in API
          patientCondition: req.specialRequirements || '',
          contactPhone: '', // Not available in API
          notes: req.specialRequirements || '',
          cancellationReason: req.cancellationReason
        }));
        
        setTrips(apiTrips);
      } else {
        console.error('Failed to load transport requests:', response.status);
        // Fallback to empty array if API fails
        setTrips([]);
      }
    } catch (error) {
      console.error('Error loading transport requests:', error);
      // Fallback to empty array if API fails
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransportRequests();
  }, []);

  // Add refresh function that can be called externally
  const refreshTrips = () => {
    loadTransportRequests();
  };

  // Listen for focus events to refresh data when returning to dashboard
  useEffect(() => {
    const handleFocus = () => {
      refreshTrips();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  // Helper function to format timestamps
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to calculate time lapse
  const calculateTimeLapse = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  // Helper function to get time until ETA
  const getTimeUntilEta = (etaTimestamp: string) => {
    const now = new Date();
    const etaTime = new Date(etaTimestamp);
    const diffMs = etaTime.getTime() - now.getTime();
    
    if (diffMs < 0) {
      return 'Overdue';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    if (diffHours > 0) {
      return `in ${diffHours}h ${remainingMinutes}m`;
    }
    return `in ${diffMinutes}m`;
  };

  // Handle trip details view
  const handleViewDetails = (trip: Trip) => {
    console.log('[DEBUG] handleViewDetails called with trip:', trip);
    setSelectedTrip(trip);
    setEditedTrip({ ...trip });
    setIsEditing(false);
    setShowTripDetails(true);
    console.log('[DEBUG] State updated - showTripDetails should be true');
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle field updates
  const handleFieldUpdate = (field: keyof Trip, value: string | number) => {
    if (editedTrip) {
      setEditedTrip({ ...editedTrip, [field]: value });
    }
  };

  // Handle save changes
  const handleSaveChanges = () => {
    if (editedTrip) {
      setTrips(prev => prev.map(trip => 
        trip.id === editedTrip.id ? editedTrip : trip
      ));
      setSelectedTrip(editedTrip);
      setIsEditing(false);
      // TODO: Send API request to update trip
      console.log('Saving trip changes:', editedTrip);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (selectedTrip) {
      setEditedTrip({ ...selectedTrip });
      setIsEditing(false);
    }
  };

  // Handle trip cancellation
  const handleCancelTrip = (trip: Trip) => {
    console.log('[DEBUG] handleCancelTrip called with trip:', trip);
    setTripToCancel(trip);
    setShowCancellationDialog(true);
    console.log('[DEBUG] Cancellation dialog should be showing');
  };

  const handleConfirmCancellation = async (reason: string) => {
    if (!tripToCancel) return;

    setCancelling(true);
    try {
      console.log('[DEBUG] Attempting to cancel trip:', tripToCancel.id, 'with reason:', reason);
      
      // Call backend API to cancel the trip
      const response = await fetch(`/api/transport-requests/${tripToCancel.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      console.log('[DEBUG] Response status:', response.status);
      console.log('[DEBUG] Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Error response:', errorText);
        throw new Error(`Failed to cancel trip: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('[DEBUG] Success response:', result);
      
      // Update the trip in the local state
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === tripToCancel.id 
            ? { ...trip, status: 'cancelled' as const, cancellationReason: reason }
            : trip
        )
      );

      // Close dialog and reset state
      setShowCancellationDialog(false);
      setTripToCancel(null);
      
      // Show success message (you could add a toast notification here)
      console.log('Trip cancelled successfully:', result);
      
    } catch (error) {
      console.error('[DEBUG] Error cancelling trip:', error);
      console.error('[DEBUG] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Failed to cancel trip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCancelling(false);
    }
  };

  const handleCloseCancellationDialog = () => {
    setShowCancellationDialog(false);
    setTripToCancel(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  // Debug modal rendering
  console.log('[DEBUG] About to render - showTripDetails:', showTripDetails, 'selectedTrip:', selectedTrip?.id, 'tripToCancel:', tripToCancel?.id);
  console.log('[DEBUG] Functions available:', {
    handleCloseCancellationDialog: typeof handleCloseCancellationDialog,
    handleConfirmCancellation: typeof handleConfirmCancellation
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your transfer requests and monitor trip status</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate?.('trips/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors"
        >
          + New Trip Request
        </button>
        <button
          onClick={() => setShowAllTrips(!showAllTrips)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors"
        >
          {showAllTrips ? 'Hide All Trips' : 'View All Trips'}
        </button>
      </div>

      {/* Recent Trips */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {showAllTrips ? 'All Transfer Requests' : 'Recent Transfer Requests'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMS Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(showAllTrips ? trips : trips.slice(0, 5)).map((trip) => (
                <tr key={trip.id} className={`hover:bg-gray-50 ${
                  trip.status === 'cancelled' ? 'bg-red-50 opacity-75' : ''
                }`}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {trip.origin} → {trip.destination}
                      </div>
                      <div className="text-sm text-gray-500">
                        Level: {trip.transportLevel}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(trip.requestTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {trip.emsAgency ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{trip.emsAgency}</div>
                        {trip.eta && (
                          <div className="text-sm text-gray-500">ETA: {new Date(trip.eta).toLocaleTimeString()}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Awaiting EMS</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      {trip.status === 'pending' && (
                        <button
                          onClick={() => handleCancelTrip(trip)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetails(trip)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit/View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
          <div className="text-sm text-gray-600">Total Trips</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {trips.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {trips.filter(t => t.status === 'accepted').length}
          </div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {trips.filter(t => t.status === 'in-progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {trips.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {trips.filter(t => t.status === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Trip Details Modal */}
      {showTripDetails && selectedTrip && editedTrip && (
        <TripDetailsModal
          trip={selectedTrip}
          editedTrip={editedTrip}
          isEditing={isEditing}
          onClose={() => {
            setShowTripDetails(false);
            setSelectedTrip(null);
            setEditedTrip(null);
            setIsEditing(false);
          }}
          onEditToggle={handleEditToggle}
          onFieldUpdate={handleFieldUpdate}
          onSaveChanges={handleSaveChanges}
          onCancelEdit={handleCancelEdit}
          onCancelTrip={handleCancelTrip}
          formatTime={formatTime}
          calculateTimeLapse={calculateTimeLapse}
          getTimeUntilEta={getTimeUntilEta}
        />
      )}

      {/* Trip Cancellation Dialog */}
      {tripToCancel && (
        <TripCancellationDialog
          isOpen={showCancellationDialog}
          onClose={handleCloseCancellationDialog}
          onConfirm={handleConfirmCancellation}
          tripId={tripToCancel.id}
          tripDetails={{
            origin: tripToCancel.origin,
            destination: tripToCancel.destination,
            transportLevel: tripToCancel.transportLevel
          }}
          loading={cancelling}
        />
      )}
    </div>
  );
};



export default HospitalDashboard;
