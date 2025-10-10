import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  Search, 
  Filter, 
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  DollarSign,
  Activity
} from 'lucide-react';
import api from '../services/api';
import { asNumber, toFixed, toCurrency } from '../utils/numberUtils';

interface TripTimelineEvent {
  event: string;
  timestamp: string;
  description: string;
}

interface Trip {
  id: string;
  tripNumber: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  priority: string;
  transportLevel: string;
  urgencyLevel: string;
  timeline: TripTimelineEvent[];
  assignedAgencyId?: string;
  assignedUnitId?: string;
  assignedTo?: string;
  responseTimeMinutes?: number;
  tripDurationMinutes?: number;
  distanceMiles?: number;
  tripCost?: number;
  createdAt: string;
  updatedAt: string;
  pickupLocation?: {
    name: string;
    hospital: {
      name: string;
    };
  };
}

interface TripHistoryData {
  trips: Trip[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const TripHistory: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());

  // Load trip history
  const loadTripHistory = async (resetOffset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: resetOffset ? '0' : pagination.offset.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.search && { search: filters.search })
      });

      const response = await api.get(`/api/trips/history?${params}`);

      if (response.status !== 200) {
        throw new Error('Failed to fetch trip history');
      }

      const data = response.data;
      
      if (data.success) {
        const newTrips = data.data.trips;
        setTrips(resetOffset ? newTrips : [...trips, ...newTrips]);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to load trip history');
      }
    } catch (err: any) {
      console.error('Error loading trip history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripHistory(true);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    loadTripHistory(true);
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      loadTripHistory(false);
    }
  };

  const toggleTripExpansion = (tripId: string) => {
    const newExpanded = new Set(expandedTrips);
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
    }
    setExpandedTrips(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'IN_PROGRESS':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip History</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and track the history of all transport requests
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Trip number, patient ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && trips.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Trip List */}
      {!loading && trips.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trip history found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      )}

      {/* Trip Cards */}
      {trips.length > 0 && (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white shadow rounded-lg border">
              {/* Trip Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Truck className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {trip.tripNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Patient ID: {trip.patientId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {getStatusIcon(trip.status)}
                      <span className="ml-1">{trip.status}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(trip.priority)}`}>
                      {trip.priority}
                    </span>
                    <button
                      onClick={() => toggleTripExpansion(trip.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedTrips.has(trip.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <p className="font-medium">From: {trip.fromLocation}</p>
                      <p className="font-medium">To: {trip.toLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Activity className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <p>Level: {trip.transportLevel}</p>
                      <p>Urgency: {trip.urgencyLevel}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <p>Response: {formatDuration(trip.responseTimeMinutes)}</p>
                      <p>Duration: {formatDuration(trip.tripDurationMinutes)}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                  {trip.distanceMiles && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{toFixed(trip.distanceMiles, 1)} miles</span>
                    </div>
                  )}
                  {trip.tripCost && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{toCurrency(trip.tripCost)}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Created: {formatDateTime(trip.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Timeline */}
              {expandedTrips.has(trip.id) && (
                <div className="border-t bg-gray-50 px-6 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Trip Timeline</h4>
                  <div className="space-y-3">
                    {trip.timeline.map((event, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{event.event}</p>
                          <p className="text-xs text-gray-500">{event.description}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(event.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center text-sm text-gray-500">
            Showing {trips.length} of {pagination.total} trips
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHistory;
