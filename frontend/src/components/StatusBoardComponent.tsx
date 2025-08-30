import React, { useState } from 'react';
import { TransportRequestWithDetails, RequestStatus, Priority, TransportLevel, EtaUpdate } from '../types/transport';

interface StatusBoardComponentProps {
  transportRequests: TransportRequestWithDetails[];
  onStatusUpdate: (requestId: string, newStatus: RequestStatus) => void;
  onEtaUpdate?: (requestId: string, etaData: { estimatedArrivalTime?: string; estimatedPickupTime?: string; reason?: string }) => void;
  onCancelTrip?: (requestId: string, reason: string) => void;
  loading: boolean;
  userRole?: string;
}

const StatusBoardComponent: React.FC<StatusBoardComponentProps> = ({
  transportRequests,
  onStatusUpdate,
  onEtaUpdate,
  onCancelTrip,
  loading,
  userRole
}) => {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'status'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showEtaModal, setShowEtaModal] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  // Sort requests
  const sortedRequests = [...transportRequests].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'timestamp':
        comparison = new Date(a.requestTimestamp).getTime() - new Date(b.requestTimestamp).getTime();
        break;
      case 'priority':
        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        const statusOrder = { PENDING: 1, SCHEDULED: 2, IN_TRANSIT: 3, COMPLETED: 4, CANCELLED: 5 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get status color
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get transport level color
  const getTransportLevelColor = (level: TransportLevel) => {
    switch (level) {
      case 'BLS': return 'bg-blue-500 text-white';
      case 'ALS': return 'bg-purple-500 text-white';
      case 'CCT': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get next status options
  const getNextStatusOptions = (currentStatus: RequestStatus): RequestStatus[] => {
    switch (currentStatus) {
      case 'PENDING':
        return ['SCHEDULED', 'CANCELLED'];
      case 'SCHEDULED':
        return ['IN_TRANSIT', 'CANCELLED'];
      case 'IN_TRANSIT':
        return ['COMPLETED'];
      case 'COMPLETED':
        return [];
      case 'CANCELLED':
        return ['PENDING'];
      default:
        return [];
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time since request
  const getTimeSinceRequest = (timestamp: string) => {
    const now = new Date();
    const requestTime = new Date(timestamp);
    const diffMs = now.getTime() - requestTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    }
    return `${diffMinutes}m ago`;
  };

  // Calculate time until ETA
  const getTimeUntilEta = (etaTimestamp: string) => {
    const now = new Date();
    const etaTime = new Date(etaTimestamp);
    const diffMs = etaTime.getTime() - now.getTime();
    
    if (diffMs < 0) {
      return 'Overdue';
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `in ${diffHours}h ${diffMinutes}m`;
    }
    return `in ${diffMinutes}m`;
  };

  // Get latest ETA update
  const getLatestEtaUpdate = (request: TransportRequestWithDetails): EtaUpdate | null => {
    if (!request.etaUpdates || request.etaUpdates.length === 0) {
      return null;
    }
    return request.etaUpdates[request.etaUpdates.length - 1];
  };

  // Format ETA timestamp
  const formatEtaTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Updating status board...</p>
      </div>
    );
  }

  if (sortedRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transport requests</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new transport request.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="timestamp">Request Time</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 rounded hover:bg-gray-100"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {sortedRequests.length} request{sortedRequests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Status Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTransportLevelColor(request.transportLevel)}`}>
                      {request.transportLevel}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Patient #{request.patientId}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(request.requestTimestamp)} • {getTimeSinceRequest(request.requestTimestamp)}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedRequest === request.id ? '−' : '+'}
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</p>
                  <p className="text-sm text-gray-900">{request.originFacility.name}</p>
                  <p className="text-xs text-gray-500">{request.originFacility.city}, {request.originFacility.state}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</p>
                  <p className="text-sm text-gray-900">{request.destinationFacility.name}</p>
                  <p className="text-xs text-gray-500">{request.destinationFacility.city}, {request.destinationFacility.state}</p>
                </div>
                {request.specialRequirements && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Special Requirements</p>
                    <p className="text-sm text-gray-900">{request.specialRequirements}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedRequest === request.id && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4 space-y-4">
                  {/* ETA Information */}
                  {(request.estimatedArrivalTime || request.estimatedPickupTime) && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2">Current ETA</p>
                      <div className="space-y-2">
                        {request.estimatedArrivalTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-900">Arrival:</span>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-900">{formatEtaTime(request.estimatedArrivalTime)}</p>
                              <p className="text-xs text-blue-600">{getTimeUntilEta(request.estimatedArrivalTime)}</p>
                            </div>
                          </div>
                        )}
                        {request.estimatedPickupTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-900">Pickup:</span>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-900">{formatEtaTime(request.estimatedPickupTime)}</p>
                              <p className="text-xs text-blue-600">{getTimeUntilEta(request.estimatedPickupTime)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* EMS Acceptance Info */}
                  {request.assignedAgency && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">EMS Assignment</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-green-900">{request.assignedAgency.name}</p>
                          {request.assignedUnit && (
                            <p className="text-xs text-green-700">Unit: {request.assignedUnit.unitNumber} ({request.assignedUnit.type})</p>
                          )}
                        </div>
                        {request.acceptedTimestamp && (
                          <div>
                            <p className="text-xs text-green-600">Accepted: {formatTimestamp(request.acceptedTimestamp)}</p>
                            <p className="text-xs text-green-600">({getTimeSinceRequest(request.acceptedTimestamp)})</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {getNextStatusOptions(request.status).map((status) => (
                        <button
                          key={status}
                          onClick={() => onStatusUpdate(request.id, status)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Mark as {status.replace('_', ' ')}
                        </button>
                      ))}
                      {getNextStatusOptions(request.status).length === 0 && (
                        <span className="text-xs text-gray-500 italic">No status updates available</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* ETA Update Button */}
                    {onEtaUpdate && (userRole === 'ems' || userRole === 'center') && (
                      <button
                        onClick={() => setShowEtaModal(request.id)}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        Update ETA
                      </button>
                    )}
                    
                    {/* Cancel Trip Button */}
                    {onCancelTrip && (userRole === 'hospital' || userRole === 'center') && request.status === 'PENDING' && (
                      <button
                        onClick={() => setShowCancelModal(request.id)}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Cancel Trip
                      </button>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium text-gray-500">Requested</p>
                      <p className="text-gray-900">{formatTimestamp(request.requestTimestamp)}</p>
                      <p className="text-gray-500">({getTimeSinceRequest(request.requestTimestamp)})</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Last Updated</p>
                      <p className="text-gray-900">{formatTimestamp(request.updatedAt)}</p>
                    </div>
                    {request.acceptedTimestamp && (
                      <div>
                        <p className="font-medium text-gray-500">Accepted</p>
                        <p className="text-gray-900">{formatTimestamp(request.acceptedTimestamp)}</p>
                      </div>
                    )}
                    {request.pickupTimestamp && (
                      <div>
                        <p className="font-medium text-gray-500">Pickup</p>
                        <p className="text-gray-900">{formatTimestamp(request.pickupTimestamp)}</p>
                      </div>
                    )}
                    {request.completionTimestamp && (
                      <div>
                        <p className="font-medium text-gray-500">Completed</p>
                        <p className="text-gray-900">{formatTimestamp(request.completionTimestamp)}</p>
                      </div>
                    )}
                  </div>

                  {/* ETA History */}
                  {request.etaUpdates && request.etaUpdates.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">ETA History</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {request.etaUpdates.slice(-3).map((etaUpdate, index) => (
                          <div key={etaUpdate.id} className="text-xs bg-gray-50 p-2 rounded">
                            <p className="font-medium text-gray-700">{formatTimestamp(etaUpdate.timestamp)}</p>
                            {etaUpdate.estimatedArrivalTime && (
                              <p className="text-gray-600">Arrival: {formatEtaTime(etaUpdate.estimatedArrivalTime)}</p>
                            )}
                            {etaUpdate.estimatedPickupTime && (
                              <p className="text-gray-600">Pickup: {formatEtaTime(etaUpdate.estimatedPickupTime)}</p>
                            )}
                            {etaUpdate.reason && (
                              <p className="text-gray-500 italic">{etaUpdate.reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ID: {request.id.slice(0, 8)}...</span>
                <span>Created by: {request.createdBy.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ETA Update Modal */}
      {showEtaModal && (
        <EtaUpdateModal
          requestId={showEtaModal}
          onClose={() => setShowEtaModal(null)}
          onUpdate={(etaData) => {
            if (onEtaUpdate) {
              onEtaUpdate(showEtaModal, etaData);
            }
            setShowEtaModal(null);
          }}
        />
      )}

      {/* Cancel Trip Modal */}
      {showCancelModal && (
        <CancelTripModal
          requestId={showCancelModal}
          onClose={() => setShowCancelModal(null)}
          onCancel={(reason) => {
            if (onCancelTrip) {
              onCancelTrip(showCancelModal, reason);
            }
            setShowCancelModal(null);
          }}
        />
      )}
    </div>
  );
};

// ETA Update Modal Component
const EtaUpdateModal: React.FC<{
  requestId: string;
  onClose: () => void;
  onUpdate: (etaData: { estimatedArrivalTime?: string; estimatedPickupTime?: string; reason?: string }) => void;
}> = ({ requestId, onClose, onUpdate }) => {
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState('');
  const [estimatedPickupTime, setEstimatedPickupTime] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      estimatedArrivalTime: estimatedArrivalTime || undefined,
      estimatedPickupTime: estimatedPickupTime || undefined,
      reason: reason || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Update ETA</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Arrival Time
            </label>
            <input
              type="datetime-local"
              value={estimatedArrivalTime}
              onChange={(e) => setEstimatedArrivalTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Pickup Time
            </label>
            <input
              type="datetime-local"
              value={estimatedPickupTime}
              onChange={(e) => setEstimatedPickupTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Update (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Traffic delay, equipment issue..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Update ETA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Cancel Trip Modal Component
const CancelTripModal: React.FC<{
  requestId: string;
  onClose: () => void;
  onCancel: (reason: string) => void;
}> = ({ requestId, onClose, onCancel }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onCancel(reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Trip Request</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to cancel this trip request? This action cannot be undone.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Cancellation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Please provide a reason for cancelling this trip..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Keep Trip
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Cancel Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusBoardComponent;
