import React, { useState, useEffect } from 'react';
import { TransportRequestWithDetails, RequestStatus, Priority, TransportLevel, FacilityType } from '../types/transport';

interface StatusFiltersProps {
  filters: {
    status: string;
    priority: string;
    transportLevel: string;
    searchTerm: string;
    originFacility: string;
    destinationFacility: string;
  };
  setFilters: (filters: any) => void;
  transportRequests: TransportRequestWithDetails[];
}

const StatusFilters: React.FC<StatusFiltersProps> = ({
  filters,
  setFilters,
  transportRequests
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [facilities, setFacilities] = useState<{ id: string; name: string; city: string; state: string }[]>([]);

  // Extract unique facilities from transport requests
  useEffect(() => {
    const uniqueFacilities = Array.from(
      new Set([
        ...transportRequests.map(req => req.originFacility.id),
        ...transportRequests.map(req => req.destinationFacility.id)
      ])
    ).map(id => {
      const req = transportRequests.find(r => r.originFacility.id === id || r.destinationFacility.id === id);
      return req?.originFacility.id === id ? req.originFacility : req!.destinationFacility;
    });

    setFacilities(uniqueFacilities);
  }, [transportRequests]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      transportLevel: '',
      searchTerm: '',
      originFacility: '',
      destinationFacility: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by patient ID, facility, or requirements..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Transport Level Filter */}
            <div>
              <label htmlFor="transportLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Transport Level
              </label>
              <select
                id="transportLevel"
                value={filters.transportLevel}
                onChange={(e) => setFilters({ ...filters, transportLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="BLS">BLS</option>
                <option value="ALS">ALS</option>
                <option value="CCT">CCT</option>
              </select>
            </div>

            {/* Origin Facility Filter */}
            <div>
              <label htmlFor="originFacility" className="block text-sm font-medium text-gray-700 mb-2">
                Origin Facility
              </label>
              <select
                id="originFacility"
                value={filters.originFacility}
                onChange={(e) => setFilters({ ...filters, originFacility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Origin Facilities</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} - {facility.city}, {facility.state}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Facility Filter */}
            <div>
              <label htmlFor="destinationFacility" className="block text-sm font-medium text-gray-700 mb-2">
                Destination Facility
              </label>
              <select
                id="destinationFacility"
                value={filters.destinationFacility}
                onChange={(e) => setFilters({ ...filters, destinationFacility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Destination Facilities</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} - {facility.city}, {facility.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {filters.status}
                    <button
                      onClick={() => setFilters({ ...filters, status: '' })}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.priority && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Priority: {filters.priority}
                    <button
                      onClick={() => setFilters({ ...filters, priority: '' })}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.transportLevel && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Level: {filters.transportLevel}
                    <button
                      onClick={() => setFilters({ ...filters, transportLevel: '' })}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Search: "{filters.searchTerm}"
                    <button
                      onClick={() => setFilters({ ...filters, searchTerm: '' })}
                      className="ml-1 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.originFacility && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    From: {facilities.find(f => f.id === filters.originFacility)?.name}
                    <button
                      onClick={() => setFilters({ ...filters, originFacility: '' })}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.destinationFacility && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    To: {facilities.find(f => f.id === filters.destinationFacility)?.name}
                    <button
                      onClick={() => setFilters({ ...filters, destinationFacility: '' })}
                      className="ml-1 text-pink-600 hover:text-pink-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusFilters;
