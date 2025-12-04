import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, AlertCircle, Star, CheckCircle } from 'lucide-react';
import { healthcareAgenciesAPI } from '../services/api';

interface AvailableAgenciesProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
}

interface Agency {
  id: string;
  name: string;
  capabilities: string[];
  availableLevels: string[];
  isPreferred: boolean;
  city?: string;
  state?: string;
}

const AvailableAgencies: React.FC<AvailableAgenciesProps> = ({ user }) => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await healthcareAgenciesAPI.getAvailable();
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        setAgencies(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error loading available agencies:', err);
      setError(err.response?.data?.error || 'Failed to load available agencies');
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableAgencies();
  }, []);

  const getCapabilityBadgeColor = (level: string) => {
    switch (level) {
      case 'BLS':
        return 'bg-blue-100 text-blue-800';
      case 'ALS':
        return 'bg-green-100 text-green-800';
      case 'CCT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-green-500 animate-spin" />
            <span className="ml-3 text-gray-600">Loading available agencies...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Truck className="h-6 w-6 text-green-500" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Available Agencies</h2>
              <p className="text-sm text-gray-600 mt-1">
                EMS agencies currently marked as available for trip dispatch
              </p>
            </div>
          </div>
          <button
            onClick={loadAvailableAgencies}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
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

      {/* Agencies List */}
      {agencies.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Available Agencies</h3>
            <p className="mt-1 text-sm text-gray-500">
              No EMS agencies are currently marked as available. Agencies will appear here when EMS users mark their agency as available.
            </p>
          </div>
        </div>
      )}

      {agencies.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {agencies.length} {agencies.length === 1 ? 'Agency' : 'Agencies'} Available
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Live Status
              </span>
            </div>
          </div>
          
          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
            {agencies.map((agency) => (
              <div
                key={agency.id}
                className={`border rounded-lg p-4 transition-shadow hover:shadow-md ${
                  agency.isPreferred
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 truncate">
                      {agency.name}
                    </h4>
                    {(agency.city || agency.state) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {[agency.city, agency.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  {agency.isPreferred && (
                    <Star className="h-5 w-5 text-green-500 fill-current flex-shrink-0 ml-2" />
                  )}
                </div>

                {/* Available Service Levels */}
                {agency.availableLevels && agency.availableLevels.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Available Levels:</p>
                    <div className="flex flex-wrap gap-2">
                      {agency.availableLevels.map((level) => (
                        <span
                          key={level}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getCapabilityBadgeColor(level)}`}
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 italic">No specific levels specified</p>
                  </div>
                )}

                {/* Preferred Badge */}
                {agency.isPreferred && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      <Star className="h-3 w-3 mr-1" />
                      Preferred Provider
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Available Agencies</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>This list shows EMS agencies that have marked themselves as available</li>
                <li>Agencies are sorted with preferred providers first, then alphabetically</li>
                <li>You can still dispatch trips to agencies not shown here</li>
                <li>Availability status is updated by EMS agencies and may not always be current</li>
                <li>Click Refresh to update the list with the latest availability status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableAgencies;

