import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Save, RefreshCw, Truck } from 'lucide-react';
import { authAPI } from '../services/api';

interface EMSAgencyAvailabilityStatusProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
  };
}

interface AvailabilityStatus {
  isAvailable: boolean;
  availableLevels: string[];
}

const EMSAgencyAvailabilityStatus: React.FC<EMSAgencyAvailabilityStatusProps> = ({ user }) => {
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>({
    isAvailable: false,
    availableLevels: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validLevels = ['BLS', 'ALS', 'CCT'];

  // Load current availability status
  useEffect(() => {
    loadAvailabilityStatus();
  }, []);

  const loadAvailabilityStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getEMSAgencyAvailability();
      
      if (response.data?.success && response.data?.data?.availabilityStatus) {
        const status = response.data.data.availabilityStatus;
        setAvailabilityStatus({
          isAvailable: status.isAvailable || false,
          availableLevels: Array.isArray(status.availableLevels) ? status.availableLevels : []
        });
      } else {
        // Default status if not found
        setAvailabilityStatus({
          isAvailable: false,
          availableLevels: []
        });
      }
    } catch (err: any) {
      console.error('Error loading availability status:', err);
      setError(err.response?.data?.error || 'Failed to load availability status');
      // Set default on error
      setAvailabilityStatus({
        isAvailable: false,
        availableLevels: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvailableToggle = (checked: boolean) => {
    setAvailabilityStatus(prev => ({
      ...prev,
      isAvailable: checked,
      // Clear levels if marking as unavailable
      availableLevels: checked ? prev.availableLevels : []
    }));
    setSuccess(false);
  };

  const handleLevelToggle = (level: string) => {
    setAvailabilityStatus(prev => {
      const currentLevels = prev.availableLevels || [];
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter(l => l !== level)
        : [...currentLevels, level];
      
      return {
        ...prev,
        availableLevels: newLevels
      };
    });
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await authAPI.updateEMSAgencyAvailability({
        isAvailable: availabilityStatus.isAvailable,
        availableLevels: availabilityStatus.availableLevels
      });

      if (response.data?.success) {
        setSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(response.data?.error || 'Failed to update availability status');
      }
    } catch (err: any) {
      console.error('Error saving availability status:', err);
      setError(err.response?.data?.error || 'Failed to save availability status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
            <span className="ml-3 text-gray-600">Loading availability status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Truck className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Agency Availability Status</h2>
        </div>
        <p className="text-gray-600">
          Set your agency's availability status and service levels. This helps healthcare providers 
          see when your agency is available to accept trips.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Availability status updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Availability Status Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Available Toggle */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="isAvailable"
                type="checkbox"
                checked={availabilityStatus.isAvailable}
                onChange={(e) => handleAvailableToggle(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="isAvailable" className="text-base font-medium text-gray-900 cursor-pointer">
                Mark Agency as Available
              </label>
              <p className="text-sm text-gray-500 mt-1">
                When checked, your agency will be shown as available to healthcare providers. 
                Uncheck to mark your agency as unavailable.
              </p>
            </div>
          </div>

          {/* Service Levels Selection */}
          {availabilityStatus.isAvailable && (
            <div className="ml-7 border-l-2 border-orange-200 pl-6 space-y-4">
              <div>
                <label className="text-base font-medium text-gray-900 mb-3 block">
                  Available Service Levels
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Select which service levels your agency can provide when available:
                </p>
                <div className="space-y-3">
                  {validLevels.map((level) => (
                    <div key={level} className="flex items-center space-x-3">
                      <div className="flex items-center h-5">
                        <input
                          id={`level-${level}`}
                          type="checkbox"
                          checked={availabilityStatus.availableLevels.includes(level)}
                          onChange={() => handleLevelToggle(level)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </div>
                      <label
                        htmlFor={`level-${level}`}
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {level}
                        {level === 'BLS' && ' - Basic Life Support'}
                        {level === 'ALS' && ' - Advanced Life Support'}
                        {level === 'CCT' && ' - Critical Care Transport'}
                      </label>
                    </div>
                  ))}
                </div>
                {availabilityStatus.availableLevels.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    Please select at least one service level when marking agency as available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Current Status Display */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Current Status</h3>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Availability:</span>
                {availabilityStatus.isAvailable ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Unavailable
                  </span>
                )}
              </div>
              {availabilityStatus.isAvailable && availabilityStatus.availableLevels.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-700">Service Levels: </span>
                  <div className="inline-flex flex-wrap gap-2 mt-1">
                    {availabilityStatus.availableLevels.map((level) => (
                      <span
                        key={level}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {availabilityStatus.isAvailable && availabilityStatus.availableLevels.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No service levels selected. Please select at least one level.
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={loadAvailabilityStatus}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (availabilityStatus.isAvailable && availabilityStatus.availableLevels.length === 0)}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 inline mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 inline mr-2" />
                  Save Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How This Works</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Your availability status is visible to healthcare providers when they create trips</li>
                <li>When marked as available, healthcare providers can see which service levels you offer</li>
                <li>This status is independent of your units - it represents your agency's overall availability</li>
                <li>You can update this status at any time to reflect your current capacity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMSAgencyAvailabilityStatus;

