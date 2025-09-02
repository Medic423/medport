import React, { useState, useEffect } from 'react';
import { Search, LocationOn, Phone, Email, Star, Add, Check, AccessTime, LocalShipping } from '@mui/icons-material';

interface Agency {
  id: string;
  name: string;
  contactName?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea?: any;
  operatingHours?: any;
  capabilities?: any;
  units: Array<{
    id: string;
    type: string;
    unitAvailability: Array<{
      status: string;
    }>;
  }>;
  serviceAreas: Array<{
    name: string;
    description?: string;
  }>;
  agencyProfiles?: Array<{
    description?: string;
    website?: string;
  }>;
  availability: {
    totalUnits: number;
    availableUnits: number;
    availabilityPercentage: number;
    hasAvailableUnits: boolean;
  };
}

interface EMSAgencyBrowserProps {
  onAddToPreferred?: (agency: Agency) => void;
  onViewDetails?: (agency: Agency) => void;
  preferredAgencyIds?: string[];
  showAddButton?: boolean;
}

const EMSAgencyBrowser: React.FC<EMSAgencyBrowserProps> = ({
  onAddToPreferred,
  onViewDetails,
  preferredAgencyIds = [],
  showAddButton = true
}) => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [transportLevelFilter, setTransportLevelFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    loadAgencies();
  }, [transportLevelFilter, cityFilter, stateFilter, availabilityFilter]);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (transportLevelFilter) params.append('transportLevel', transportLevelFilter);
      if (cityFilter) params.append('city', cityFilter);
      if (stateFilter) params.append('state', stateFilter);
      if (availabilityFilter !== null) params.append('hasAvailableUnits', availabilityFilter.toString());

      const response = await fetch(`/api/hospital-agencies/available?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load agencies');
      }

      const data = await response.json();
      setAgencies(data.data || []);
    } catch (err) {
      console.error('Error loading agencies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load agencies');
    } finally {
      setLoading(false);
    }
  };

  const filteredAgencies = agencies.filter(agency => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        agency.name.toLowerCase().includes(searchLower) ||
        agency.contactName?.toLowerCase().includes(searchLower) ||
        agency.email.toLowerCase().includes(searchLower) ||
        agency.city.toLowerCase().includes(searchLower) ||
        agency.state.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getTransportLevelIcon = (level: string) => {
    switch (level) {
      case 'BLS': return '🟢';
      case 'ALS': return '🟡';
      case 'CCT': return '🔴';
      case 'OTHER': return '⚪';
      default: return '⚪';
    }
  };

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityText = (percentage: number) => {
    if (percentage >= 80) return 'High Availability';
    if (percentage >= 50) return 'Moderate Availability';
    return 'Low Availability';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading agencies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">⚠️</div>
          <div className="ml-2">
            <h3 className="text-red-800 font-medium">Error Loading Agencies</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={loadAgencies}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Available EMS Agencies</h2>
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Add className="h-4 w-4 mr-2" />
            Register New Agency
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Agencies
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, contact, or location..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Transport Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transport Level
            </label>
            <select
              value={transportLevelFilter}
              onChange={(e) => setTransportLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="BLS">BLS</option>
              <option value="ALS">ALS</option>
              <option value="CCT">CCT</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by city..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              value={availabilityFilter === null ? '' : availabilityFilter.toString()}
              onChange={(e) => setAvailabilityFilter(e.target.value === '' ? null : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="true">Has Available Units</option>
              <option value="false">No Available Units</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAgencies.length} of {agencies.length} agencies
      </div>

      {/* Agency List */}
      <div className="space-y-4">
        {filteredAgencies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <LocalShipping className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Agencies Found</h3>
            <p className="text-gray-500">
              {searchTerm || transportLevelFilter || cityFilter || stateFilter || availabilityFilter !== null
                ? 'Try adjusting your search criteria'
                : 'No EMS agencies are currently available'
              }
            </p>
          </div>
        ) : (
          filteredAgencies.map((agency) => (
            <div key={agency.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Agency Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{agency.name}</h3>
                      {preferredAgencyIds.includes(agency.id) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Preferred
                        </span>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <LocationOn className="h-4 w-4 mr-2 text-gray-400" />
                          {agency.address}, {agency.city}, {agency.state} {agency.zipCode}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {agency.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Email className="h-4 w-4 mr-2 text-gray-400" />
                          {agency.email}
                        </div>
                      </div>

                      {/* Availability Status */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <AccessTime className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`font-medium ${getAvailabilityColor(agency.availability.availabilityPercentage)}`}>
                            {agency.availability.availableUnits}/{agency.availability.totalUnits} units available
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {getAvailabilityText(agency.availability.availabilityPercentage)}
                        </div>
                      </div>
                    </div>

                    {/* Transport Levels */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Transport Levels:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(agency.units.map(unit => unit.type))).map(level => (
                          <span
                            key={level}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {getTransportLevelIcon(level)} {level}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Service Areas */}
                    {agency.serviceAreas.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Service Areas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {agency.serviceAreas.map((area, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {area.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {agency.agencyProfiles?.[0]?.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">{agency.agencyProfiles[0].description}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {showAddButton && !preferredAgencyIds.includes(agency.id) && (
                      <button
                        onClick={() => onAddToPreferred?.(agency)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Add className="h-4 w-4 mr-1" />
                        Add to Preferred
                      </button>
                    )}
                    <button
                      onClick={() => onViewDetails?.(agency)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Agency Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Register New EMS Agency
                </h3>
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Agency Registration
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          To register a new EMS agency, they need to complete the self-registration process. 
                          This ensures they have proper credentials and can manage their own account.
                        </p>
                        <p className="mt-2">
                          <strong>Next Steps:</strong>
                        </p>
                        <ul className="mt-1 list-disc list-inside">
                          <li>Share the agency registration link with the EMS provider</li>
                          <li>They will complete their registration and create an account</li>
                          <li>Once registered, they will appear in the available agencies list</li>
                          <li>You can then add them to your preferred agencies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Copy registration link to clipboard
                    const registrationUrl = `${window.location.origin}/agency-registration`;
                    navigator.clipboard.writeText(registrationUrl);
                    alert('Registration link copied to clipboard!');
                    setShowRegistrationModal(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Copy Registration Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMSAgencyBrowser;
