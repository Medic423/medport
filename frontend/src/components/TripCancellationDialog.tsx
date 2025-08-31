import React, { useState } from 'react';

interface TripCancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  tripId: string;
  tripDetails: {
    origin: string;
    destination: string;
    transportLevel: string;
  };
  loading?: boolean;
}

const CANCELLATION_REASONS = [
  { value: 'NO_EMS_AVAILABILITY', label: 'No EMS Availability' },
  { value: 'PATIENT_NOT_STABLE', label: 'Patient Not Stable for Transport' },
  { value: 'OTHER', label: 'Other' }
];

const TripCancellationDialog: React.FC<TripCancellationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tripId,
  tripDetails,
  loading = false
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const reason = selectedReason === 'OTHER' ? customReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel Transport Request
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Trip Details:</p>
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p><span className="font-medium">From:</span> {tripDetails.origin}</p>
              <p><span className="font-medium">To:</span> {tripDetails.destination}</p>
              <p><span className="font-medium">Level:</span> {tripDetails.transportLevel}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation *
            </label>
            <div className="space-y-2">
              {CANCELLATION_REASONS.map((reason) => (
                <label key={reason.value} className="flex items-center">
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    disabled={loading}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'OTHER' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify the reason
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={loading}
                placeholder="Enter cancellation reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:bg-gray-100"
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !selectedReason || (selectedReason === 'OTHER' && !customReason.trim())}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:bg-gray-400"
            >
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCancellationDialog;
