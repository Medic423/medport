import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Truck,
  MapPin,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { tripsAPI } from '../services/api';

interface Trip {
  id: string;
  tripNumber: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  transportLevel: 'BLS' | 'ALS' | 'CCT' | 'Other';
  scheduledTime: string;
  assignedAgencyId?: string;
  assignedAgency?: {
    name: string;
  };
  urgencyLevel: 'Routine' | 'Urgent' | 'Emergent';
  diagnosis?: string;
  mobilityLevel?: string;
  oxygenRequired: boolean;
  monitoringRequired: boolean;
  pickupLocationId?: string;
  pickupLocation?: {
    id: string;
    name: string;
    description?: string;
    contactPhone?: string;
    contactEmail?: string;
    floor?: string;
    room?: string;
    hospital?: {
      id: string;
      name: string;
    };
  };
  // Distance and time fields
  distanceMiles?: number;
  estimatedTripTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

interface TripsViewProps {
  user: {
    id: string;
    userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
    facilityName?: string;
  };
}


// Trip Card Component
const TripCard: React.FC<{ trip: Trip; user: User }> = ({ trip, user }) => {

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleAcceptTrip = (trip: Trip) => {
    // TODO: Implement accept functionality
    console.log('Accept trip:', trip.id);
    // This would call an API to accept the trip
  };

  const handleDeclineTrip = (trip: Trip) => {
    // TODO: Implement decline functionality
    console.log('Decline trip:', trip.id);
    // This would call an API to decline the trip
  };

  const handleEditTrip = (trip: Trip) => {
    // TODO: Implement edit functionality
    console.log('Edit trip:', trip.id);
    // This could open a modal or navigate to an edit page
  };

  const handleDeleteTrip = (trip: Trip) => {
    // TODO: Implement delete functionality
    if (window.confirm(`Are you sure you want to delete trip ${trip.tripNumber}?`)) {
      console.log('Delete trip:', trip.id);
      // This would call an API to delete the trip
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
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENT':
        return 'bg-red-100 text-red-800';
      case 'URGENT':
        return 'bg-orange-100 text-orange-800';
      case 'ROUTINE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPriority = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'EMERGENT';
      case 'HIGH':
        return 'URGENT';
      case 'MEDIUM':
      case 'LOW':
        return 'ROUTINE';
      default:
        return priority;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div>
          <h4 className="text-lg font-medium text-gray-900">
            Patient {trip.patientId} - {trip.transportLevel} - {formatDateTime(trip.scheduledTime)}
          </h4>
          <p className="text-base text-gray-600">
            {trip.fromLocation} → {trip.toLocation}
          </p>
          {trip.pickupLocation && (
            <p className="text-xs text-blue-600">
              Pickup: {trip.pickupLocation.name}
              {trip.pickupLocation.floor && ` (Floor ${trip.pickupLocation.floor})`}
              {trip.pickupLocation.room && ` - Room ${trip.pickupLocation.room}`}
              {trip.pickupLocation.contactPhone && ` • ${trip.pickupLocation.contactPhone}`}
            </p>
          )}
          <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
            <div>
              <span className="font-medium">Priority:</span> {formatPriority(trip.priority)}
            </div>
            <div>
              <span className="font-medium">Distance:</span> {trip.distanceMiles ? `${trip.distanceMiles.toFixed(1)} miles` : 'Calculating...'}
            </div>
            <div>
              <span className="font-medium">Time:</span> {trip.estimatedTripTimeMinutes ? `${Math.round(trip.estimatedTripTimeMinutes)} min` : 'Calculating...'}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(trip.status)}`}>
          {trip.status.replace('_', ' ')}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleAcceptTrip(trip)}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Accept
          </button>
          <button 
            onClick={() => handleDeclineTrip(trip)}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={() => handleEditTrip(trip)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDeleteTrip(trip)}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const TripsView: React.FC<TripsViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [transportFilter, setTransportFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Trip>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch trips data
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripsAPI.getAll();
      if (response.data.success) {
        setTrips(response.data.data);
        setFilteredTrips(response.data.data);
        setLastRefresh(new Date());
      } else {
        setError(response.data.error || 'Failed to fetch trips');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTrips();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTrips, 30000);
    return () => clearInterval(interval);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...trips];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.tripNumber.toLowerCase().includes(term) ||
        trip.patientId.toLowerCase().includes(term) ||
        trip.fromLocation.toLowerCase().includes(term) ||
        trip.toLocation.toLowerCase().includes(term) ||
        (trip.assignedAgency?.name || '').toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(trip => trip.priority === priorityFilter);
    }

    // Transport level filter
    if (transportFilter !== 'ALL') {
      filtered = filtered.filter(trip => trip.transportLevel === transportFilter);
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '24H':
          filterDate.setHours(now.getHours() - 24);
          break;
        case '7D':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30D':
          filterDate.setDate(now.getDate() - 30);
          break;
      }
      
      if (dateFilter !== 'ALL') {
        filtered = filtered.filter(trip => new Date(trip.createdAt) >= filterDate);
      }
    }

    // Hospital filter (for non-admin users)
    if (user.userType !== 'ADMIN' && user.facilityName) {
      filtered = filtered.filter(trip => 
        trip.fromLocation.toLowerCase().includes(user.facilityName!.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTrips(filtered);
  }, [trips, searchTerm, statusFilter, priorityFilter, transportFilter, dateFilter, hospitalFilter, sortField, sortDirection, user]);

  // Handle sort
  const handleSort = (field: keyof Trip) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      ACCEPTED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      DECLINED: { color: 'bg-orange-100 text-orange-800', icon: X },
      IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { color: 'bg-gray-100 text-gray-800' },
      MEDIUM: { color: 'bg-yellow-100 text-yellow-800' },
      HIGH: { color: 'bg-orange-100 text-orange-800' },
      CRITICAL: { color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.LOW;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {priority}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Trip Number',
      'Patient ID',
      'From Location',
      'Pickup Location',
      'Pickup Floor',
      'Pickup Room',
      'Pickup Contact',
      'To Location',
      'Status',
      'Priority',
      'Transport Level',
      'Scheduled Time',
      'Assigned Agency',
      'Created At'
    ];
    
    const csvData = filteredTrips.map(trip => [
      trip.tripNumber,
      trip.patientId,
      trip.fromLocation,
      trip.pickupLocation?.name || 'N/A',
      trip.pickupLocation?.floor || 'N/A',
      trip.pickupLocation?.room || 'N/A',
      trip.pickupLocation?.contactPhone || trip.pickupLocation?.contactEmail || 'N/A',
      trip.toLocation,
      trip.status,
      trip.priority,
      trip.transportLevel,
      formatDate(trip.scheduledTime),
      trip.assignedAgency?.name || 'Unassigned',
      formatDate(trip.createdAt)
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // View trip details
  const viewTripDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all transport requests
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTrips}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <button
          onClick={() => navigate('/dashboard/trips/create')}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Create Trip</dt>
                  <dd className="text-lg font-semibold text-gray-900">New Transport Request</dd>
                </dl>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/dashboard/units'}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Units</dt>
                  <dd className="text-lg font-semibold text-gray-900">Manage Units</dd>
                </dl>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/dashboard/route-optimization'}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-purple-500">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Route Optimization</dt>
                  <dd className="text-lg font-semibold text-gray-900">Optimize Routes</dd>
                </dl>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{trips.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {trips.filter(t => t.status === 'PENDING').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-purple-500">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {trips.filter(t => t.status === 'IN_PROGRESS').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {trips.filter(t => t.status === 'COMPLETED').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search trips..."
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Transport Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Transport Level</label>
                <select
                  value={transportFilter}
                  onChange={(e) => setTransportFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Levels</option>
                  <option value="BLS">BLS</option>
                  <option value="ALS">ALS</option>
                  <option value="CCT">CCT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Time</option>
                  <option value="24H">Last 24 Hours</option>
                  <option value="7D">Last 7 Days</option>
                  <option value="30D">Last 30 Days</option>
                </select>
              </div>

              {/* Hospital Filter (Admin only) */}
              {user.userType === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hospital</label>
                  <select
                    value={hospitalFilter}
                    onChange={(e) => setHospitalFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="ALL">All Hospitals</option>
                    {/* Add hospital options here */}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredTrips.length}</span> of{' '}
          <span className="font-medium">{trips.length}</span> trips
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      {/* Trip Cards */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} user={user} />
        ))}

        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || transportFilter !== 'ALL' || dateFilter !== 'ALL'
                ? 'Try adjusting your filters to see more results.'
                : 'No trips have been created yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      {showTripModal && selectedTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTripModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Trip Details - {selectedTrip.tripNumber}
                  </h3>
                  <button
                    onClick={() => setShowTripModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.patientId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedTrip.status)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <div className="mt-1">{getPriorityBadge(selectedTrip.priority)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transport Level</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.transportLevel}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTrip.fromLocation}</p>
                  </div>
                  
                  {selectedTrip.pickupLocation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                      <div className="mt-1 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900">{selectedTrip.pickupLocation.name}</p>
                        {selectedTrip.pickupLocation.description && (
                          <p className="text-sm text-gray-600 mt-1">{selectedTrip.pickupLocation.description}</p>
                        )}
                        <div className="mt-2 space-y-1">
                          {selectedTrip.pickupLocation.floor && (
                            <p className="text-xs text-gray-500"><span className="font-medium">Floor:</span> {selectedTrip.pickupLocation.floor}</p>
                          )}
                          {selectedTrip.pickupLocation.room && (
                            <p className="text-xs text-gray-500"><span className="font-medium">Room:</span> {selectedTrip.pickupLocation.room}</p>
                          )}
                          {selectedTrip.pickupLocation.contactPhone && (
                            <p className="text-xs text-gray-500"><span className="font-medium">Phone:</span> {selectedTrip.pickupLocation.contactPhone}</p>
                          )}
                          {selectedTrip.pickupLocation.contactEmail && (
                            <p className="text-xs text-gray-500"><span className="font-medium">Email:</span> {selectedTrip.pickupLocation.contactEmail}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTrip.toLocation}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scheduled Time</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTrip.scheduledTime)}</p>
                  </div>
                  
                  {selectedTrip.assignedAgency && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned Agency</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.assignedAgency.name}</p>
                    </div>
                  )}
                  
                  {selectedTrip.diagnosis && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.diagnosis}</p>
                    </div>
                  )}
                  
                  {selectedTrip.mobilityLevel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobility Level</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.mobilityLevel}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Oxygen Required</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.oxygenRequired ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monitoring Required</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.monitoringRequired ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowTripModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsView;
