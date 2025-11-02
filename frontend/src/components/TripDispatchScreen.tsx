import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  AlertCircle,
  Star,
  Building2,
  User,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { healthcareAgenciesAPI, tripsAPI } from '../services/api';

interface TransportRequest {
  id: string;
  patientId: string;
  fromLocation?: string;
  toLocation?: string;
  scheduledTime?: string;
  transportLevel: string;
  urgencyLevel?: string;
  diagnosis?: string;
  mobilityLevel?: string;
  oxygenRequired?: boolean;
  monitoringRequired?: boolean;
  notes?: string;
  tripNumber?: string; // Phase 3
}

interface TripAgency {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  capabilities: string[];
  isRegistered: boolean;
  isPreferred: boolean;
  distance: number | null;
  unitNumber?: string;
}

interface TripDispatchScreenProps {
  tripId: string;
  trip: TransportRequest;
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
  onDispatchComplete: () => void;
  onCancel: () => void;
}

const TripDispatchScreen: React.FC<TripDispatchScreenProps> = ({ tripId, trip, user, onDispatchComplete, onCancel }) => {
  const [dispatchMode, setDispatchMode] = useState<'PREFERRED' | 'GEOGRAPHIC' | 'HYBRID'>('PREFERRED');
  const [agencies, setAgencies] = useState<TripAgency[]>([]);
  const [selectedAgencyIds, setSelectedAgencyIds] = useState<string[]>([]);
  const [notificationRadius, setNotificationRadius] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [agenciesLoading, setAgenciesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  // Load agencies when component mounts or mode changes
  useEffect(() => {
    loadAgencies();
  }, [dispatchMode, notificationRadius]);

  // Set default mode based on available agencies
  useEffect(() => {
    if (agencies.length > 0) {
      const hasPreferred = agencies.some(a => a.isPreferred);
      if (hasPreferred && dispatchMode === 'GEOGRAPHIC') {
        // Only auto-set to PREFERRED if we initially loaded with GEOGRAPHIC
        setDispatchMode('PREFERRED');
      } else if (!hasPreferred && dispatchMode !== 'GEOGRAPHIC') {
        setDispatchMode('GEOGRAPHIC');
      }
    }
  }, [agencies]);

  const loadAgencies = async () => {
    try {
      setAgenciesLoading(true);
      setError(null);
      
      const response = await healthcareAgenciesAPI.getForTrip(tripId, {
        mode: dispatchMode,
        radius: notificationRadius
      });

      if (response.data.success && response.data.data) {
        setAgencies(response.data.data.agencies || []);
      } else {
        setError('Failed to load agencies');
      }
    } catch (err: any) {
      console.error('Error loading agencies:', err);
      setError(err.response?.data?.error || 'Failed to load agencies');
    } finally {
      setAgenciesLoading(false);
    }
  };

  const handleAgencyToggle = (agencyId: string) => {
    setSelectedAgencyIds(prev =>
      prev.includes(agencyId)
        ? prev.filter(id => id !== agencyId)
        : [...prev, agencyId]
    );
  };

  const handleDispatch = async () => {
    if (selectedAgencyIds.length === 0) {
      setError('Please select at least one agency');
      return;
    }

    try {
      setDispatching(true);
      setError(null);

      const response = await tripsAPI.dispatch(tripId, {
        agencyIds: selectedAgencyIds,
        dispatchMode,
        notificationRadius
      });

      if (response.data.success) {
        onDispatchComplete();
      } else {
        setError(response.data.error || 'Failed to dispatch trip');
      }
    } catch (err: any) {
      console.error('Error dispatching trip:', err);
      setError(err.response?.data?.error || 'Failed to dispatch trip');
    } finally {
      setDispatching(false);
    }
  };

  const getFilteredAgencies = () => {
    // Agencies are already filtered by the backend based on mode
    return agencies;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatDistance = (distance: number | null) => {
    if (distance === null) return 'N/A';
    return `${distance.toFixed(1)} mi`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dispatch Trip to Agencies</h2>
              <p className="text-sm text-gray-500">Trip #{trip.tripNumber || tripId.substring(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Trip Summary */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Trip Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Patient ID:</span>
                <span className="ml-2 text-blue-900">{trip.patientId}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">From:</span>
                <span className="ml-2 text-blue-900">{trip.fromLocation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">To:</span>
                <span className="ml-2 text-blue-900">{trip.toLocation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Level:</span>
                <span className="ml-2 text-blue-900">{trip.transportLevel}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Urgency:</span>
                <span className="ml-2 text-blue-900">{trip.urgencyLevel || 'Routine'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Scheduled:</span>
                <span className="ml-2 text-blue-900">{formatDate(trip.scheduledTime)}</span>
              </div>
              {trip.diagnosis && (
                <div className="md:col-span-2">
                  <span className="text-blue-700 font-medium">Diagnosis:</span>
                  <span className="ml-2 text-blue-900">{trip.diagnosis}</span>
                </div>
              )}
              {trip.mobilityLevel && (
                <div>
                  <span className="text-blue-700 font-medium">Mobility:</span>
                  <span className="ml-2 text-blue-900">{trip.mobilityLevel}</span>
                </div>
              )}
              {(trip.oxygenRequired || trip.monitoringRequired) && (
                <div>
                  <span className="text-blue-700 font-medium">Special Needs:</span>
                  <span className="ml-2 text-blue-900">
                    {[
                      trip.oxygenRequired && 'Oxygen Required',
                      trip.monitoringRequired && 'Monitoring Required'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dispatch Mode Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Dispatch Mode</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dispatchMode"
                  value="PREFERRED"
                  checked={dispatchMode === 'PREFERRED'}
                  onChange={(e) => setDispatchMode(e.target.value as any)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Preferred Providers
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dispatchMode"
                  value="GEOGRAPHIC"
                  checked={dispatchMode === 'GEOGRAPHIC'}
                  onChange={(e) => setDispatchMode(e.target.value as any)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Geographic Radius
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dispatchMode"
                  value="HYBRID"
                  checked={dispatchMode === 'HYBRID'}
                  onChange={(e) => setDispatchMode(e.target.value as any)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Hybrid
                </span>
              </label>
            </div>

            {(dispatchMode === 'GEOGRAPHIC' || dispatchMode === 'HYBRID') && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Radius (miles)
                </label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={notificationRadius}
                  onChange={(e) => setNotificationRadius(parseInt(e.target.value) || 100)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}
          </div>

          {/* Agency Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Available Agencies</h3>
              <span className="text-xs text-gray-500">
                {selectedAgencyIds.length} selected
              </span>
            </div>

            {agenciesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : getFilteredAgencies().length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-800">
                  No agencies available for the selected dispatch mode.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredAgencies().map((agency) => (
                  <div
                    key={agency.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAgencyIds.includes(agency.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => handleAgencyToggle(agency.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{agency.name}</h4>
                          {agency.isPreferred && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Preferred
                            </span>
                          )}
                          {agency.isRegistered && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <Building2 className="h-3 w-3 mr-1" />
                              Registered
                            </span>
                          )}
                          {!agency.isRegistered && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              <User className="h-3 w-3 mr-1" />
                              My Provider
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {agency.city}, {agency.state}
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium">Distance:</span>
                            <span className="ml-2">{formatDistance(agency.distance)}</span>
                          </p>
                          {agency.capabilities && agency.capabilities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {agency.capabilities.slice(0, 3).map((cap, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {cap}
                                </span>
                              ))}
                              {agency.capabilities.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                  +{agency.capabilities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          checked={selectedAgencyIds.includes(agency.id)}
                          onChange={() => {}}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={dispatching}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            disabled={dispatching || selectedAgencyIds.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {dispatching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Dispatch to Selected Agencies
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDispatchScreen;

