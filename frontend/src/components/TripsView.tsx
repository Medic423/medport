import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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
  Plus,
  Send,
  Radio,
  Trash2,
  Shield,
  Archive
} from 'lucide-react';
import { tripsAPI } from '../services/api';
import TripDispatchScreen from './TripDispatchScreen';

interface Trip {
  id: string;
  tripNumber: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  status: 'PENDING' | 'PENDING_DISPATCH' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'HEALTHCARE_COMPLETED' | 'CANCELLED';
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
  // Healthcare facility fields
  healthcareFacilityName?: string;
  healthcareLocation?: {
    id: string;
    locationName: string;
    city?: string;
    state?: string;
    facilityType?: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    facilityName?: string;
  };
  // Distance and time fields
  distanceMiles?: number;
  estimatedTripTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
  // Agency responses
  agencyResponses?: Array<{
    id: string;
    agencyId: string;
    response: string;
    responseTimestamp?: string;
    isSelected?: boolean;
    agency?: {
      id: string;
      name: string;
    };
  }>;
}

interface TripsViewProps {
  user: {
    id: string;
    userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
    facilityName?: string;
  };
}


// Trip Card Component
interface TripCardProps {
  trip: Trip;
  user: {
    id: string;
    userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
    facilityName?: string;
  };
  onRefresh: () => void;
  onEdit?: (tripId: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, user, onRefresh, onEdit, onDispatch }) => {
  const [loading, setLoading] = useState(false);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };
  
  const formatDateShort = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleAcceptTrip = async (trip: Trip) => {
    if (loading) return;
    
    // For TCC users, "Accept" means authorizing the trip for dispatch to agencies
    // Update status to PENDING_DISPATCH to authorize it for dispatch
    if (window.confirm(`Authorize trip ${trip.tripNumber || trip.patientId} for dispatch to agencies?`)) {
      setLoading(true);
      try {
        const response = await tripsAPI.updateStatus(trip.id, {
          status: 'PENDING_DISPATCH'
        });
        
        if (response.data.success) {
          onRefresh();
        } else {
          alert(response.data.error || 'Failed to authorize trip');
        }
      } catch (error: any) {
        console.error('Error authorizing trip:', error);
        alert(error.response?.data?.error || 'Failed to authorize trip');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeclineTrip = async (trip: Trip) => {
    if (loading) return;
    
    // For TCC users, "Decline" means cancelling the trip
    if (window.confirm(`Are you sure you want to cancel trip ${trip.tripNumber || trip.patientId}?`)) {
      setLoading(true);
      try {
        const response = await tripsAPI.updateStatus(trip.id, {
          status: 'CANCELLED'
        });
        
        if (response.data.success) {
          onRefresh();
        } else {
          alert(response.data.error || 'Failed to cancel trip');
        }
      } catch (error: any) {
        console.error('Error cancelling trip:', error);
        alert(error.response?.data?.error || 'Failed to cancel trip');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditTrip = (trip: Trip) => {
    if (onEdit) {
      onEdit(trip.id);
    } else {
      // Fallback: show alert if callback not provided
      alert('Edit functionality not available. Please use the trip details modal.');
    }
  };

  const handleDeleteTrip = async (trip: Trip) => {
    if (loading) return;
    
    // Note: Currently using CANCELLED status as soft delete since DELETE endpoint doesn't exist
    // For true permanent deletion, a DELETE endpoint would need to be added to the backend
    if (window.confirm(`Are you sure you want to cancel/delete trip ${trip.tripNumber || trip.patientId}? This will mark the trip as cancelled.`)) {
      setLoading(true);
      try {
        const response = await tripsAPI.updateStatus(trip.id, {
          status: 'CANCELLED'
        });
        
        if (response.data.success) {
          onRefresh();
        } else {
          alert(response.data.error || 'Failed to cancel trip');
        }
      } catch (error: any) {
        console.error('Error cancelling trip:', error);
        alert(error.response?.data?.error || 'Failed to cancel trip');
      } finally {
        setLoading(false);
      }
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

  // Count accepted agencies
  const acceptedAgenciesCount = trip.agencyResponses?.filter((r: any) => r.response === 'ACCEPTED').length || 0;
  const hasSelectedAgency = trip.agencyResponses?.some((r: any) => r.isSelected === true && r.response === 'ACCEPTED') || false;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="text-lg font-medium text-gray-900">
          Patient {trip.patientId} - Requested Pickup Time: {formatDateTime(trip.scheduledTime)}
        </h4>
        <p className="text-base text-gray-600 mt-1">
          {trip.fromLocation} → {trip.toLocation}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {trip.transportLevel} - Ticket Created At: {formatDateShort(trip.createdAt)}
        </p>
        
        {/* Agency Responses Badge */}
        {trip.agencyResponses && trip.agencyResponses.length > 0 && (
          <div className="mt-2 flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {acceptedAgenciesCount} {acceptedAgenciesCount === 1 ? 'agency' : 'agencies'} accepted
            </span>
            {hasSelectedAgency && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Selected
              </span>
            )}
          </div>
        )}
        
        {/* Facility Name */}
        {trip.healthcareFacilityName && (
          <p className="text-sm text-gray-700 font-medium mt-2">
            Facility: {trip.healthcareFacilityName}
          </p>
        )}
        
        {/* Pickup Location */}
        {trip.pickupLocation && (
          <p className="text-xs text-blue-600 mt-1">
            Pickup: {trip.pickupLocation.name}
            {trip.pickupLocation.floor && ` • Floor ${trip.pickupLocation.floor}`}
            {trip.pickupLocation.room && ` • Room ${trip.pickupLocation.room}`}
            {trip.pickupLocation.contactPhone && ` • (${trip.pickupLocation.contactPhone})`}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        {/* Status Badge */}
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
          {trip.status.replace('_', ' ')}
        </span>
        
        {/* Action Buttons - Small Circular Icons */}
        <div className="flex space-x-1">
          {/* Dispatch button - only show for PENDING_DISPATCH trips */}
          {trip.status === 'PENDING_DISPATCH' && onDispatch && (
            <button 
              onClick={() => onDispatch(trip)}
              disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Dispatch trip to EMS agencies"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
          
          {/* Authorize button */}
          {trip.status !== 'PENDING_DISPATCH' && trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED' && trip.status !== 'HEALTHCARE_COMPLETED' && (
            <button 
              onClick={() => handleAcceptTrip(trip)}
              disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Authorize trip for dispatch"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          
          {/* Cancel button */}
          {trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED' && trip.status !== 'HEALTHCARE_COMPLETED' && (
            <button 
              onClick={() => handleDeclineTrip(trip)}
              disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cancel trip"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Edit button */}
          {trip.status !== 'COMPLETED' && trip.status !== 'HEALTHCARE_COMPLETED' && (
            <button 
              onClick={() => handleEditTrip(trip)}
              disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit trip details"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          
          {/* Delete button */}
          <button 
            onClick={() => handleDeleteTrip(trip)}
            disabled={loading}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete trip"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TripsView: React.FC<TripsViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [transportFilter, setTransportFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [healthcareFacilityFilter, setHealthcareFacilityFilter] = useState('ALL');
  
  // UI states
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Trip>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Dispatch screen state
  const [dispatchTrip, setDispatchTrip] = useState<Trip | null>(null);
  const [showDispatchScreen, setShowDispatchScreen] = useState(false);

  // Fetch trips data
  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('TCC_DEBUG: TripsView - Fetching trips...');
      const response = await tripsAPI.getAll();
      console.log('TCC_DEBUG: TripsView - API response:', {
        success: response.data.success,
        dataLength: response.data.data?.length || 0,
        data: response.data.data?.slice(0, 3) || []
      });
      if (response.data.success) {
        const tripsData = response.data.data || [];
        
        // Fetch agency responses for all trips
        try {
          // Fetch all agency responses (API doesn't support multiple tripIds, so we fetch all and filter)
          const responsesResponse = await api.get('/api/agency-responses');
          const allResponses = responsesResponse.data?.data || [];
          
          // Create a set of trip IDs for quick lookup
          const tripIdSet = new Set(tripsData.map((t: any) => t.id));
          
          // Group responses by trip ID (only for trips we're displaying)
          const responsesByTrip = new Map<string, any[]>();
          allResponses.forEach((response: any) => {
            if (tripIdSet.has(response.tripId)) {
              if (!responsesByTrip.has(response.tripId)) {
                responsesByTrip.set(response.tripId, []);
              }
              responsesByTrip.get(response.tripId)!.push(response);
            }
          });
          
          // Attach agency responses to trips
          tripsData.forEach((trip: any) => {
            trip.agencyResponses = responsesByTrip.get(trip.id) || [];
          });
          
          console.log('TCC_DEBUG: TripsView - Loaded agency responses for', responsesByTrip.size, 'trips');
        } catch (responsesError: any) {
          console.warn('TCC_DEBUG: Failed to load agency responses:', responsesError);
          // Continue without agency responses - not critical
        }
        
        // Separate active and completed trips
        // Active trips: exclude COMPLETED, HEALTHCARE_COMPLETED, CANCELLED, and trips with completion timestamps
        const active = tripsData.filter((trip: any) => {
          // Exclude cancelled trips
          if (trip.status === 'CANCELLED') return false;
          // Exclude completed statuses
          if (trip.status === 'COMPLETED' || trip.status === 'HEALTHCARE_COMPLETED') return false;
          // Exclude trips with completion timestamps (even if status isn't set correctly)
          if (trip.healthcareCompletionTimestamp || trip.emsCompletionTimestamp) return false;
          return true;
        });
        
        // Completed trips: include COMPLETED, HEALTHCARE_COMPLETED (but NOT CANCELLED)
        const completed = tripsData
          .filter((trip: any) => {
            // Include completed statuses
            if (trip.status === 'COMPLETED' || trip.status === 'HEALTHCARE_COMPLETED') return true;
            // Include trips with completion timestamps
            if (trip.healthcareCompletionTimestamp || trip.emsCompletionTimestamp) return true;
            // Exclude cancelled (they stay separate)
            return false;
          })
          .map((trip: any) => {
            // Transform for display (similar to HealthcareDashboard)
            const selectedResponse = trip.agencyResponses?.find((r: any) => r.isSelected === true && r.response === 'ACCEPTED');
            let acceptanceTime = null;
            
            if (selectedResponse) {
              const responseTime = selectedResponse.responseTimestamp || selectedResponse.createdAt;
              if (responseTime && trip.createdAt) {
                const requestTime = new Date(trip.createdAt).getTime();
                const acceptTime = new Date(responseTime).getTime();
                const diffMs = acceptTime - requestTime;
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins >= 0) {
                  acceptanceTime = `${diffMins} min`;
                }
              }
            }
            
            // Calculate wait time (request to pickup)
            let waitTime = null;
            if (trip.pickupTimestamp && trip.createdAt) {
              const requestTime = new Date(trip.createdAt).getTime();
              const pickupTime = new Date(trip.pickupTimestamp).getTime();
              const diffMs = pickupTime - requestTime;
              const diffMins = Math.floor(diffMs / 60000);
              if (diffMins >= 0) {
                waitTime = `${diffMins} min`;
              }
            }
            
            return {
              ...trip,
              requestTime: trip.createdAt ? new Date(trip.createdAt).toLocaleString() : 'N/A',
              requestTimeISO: trip.createdAt,
              pickupTime: trip.pickupTimestamp ? new Date(trip.pickupTimestamp).toLocaleString() : null,
              pickupTimeISO: trip.pickupTimestamp,
              acceptanceTime: acceptanceTime,
              waitTime: waitTime,
              healthcareCompletionTime: trip.healthcareCompletionTimestamp 
                ? new Date(trip.healthcareCompletionTimestamp).toLocaleString() 
                : null,
              emsCompletionTime: trip.emsCompletionTimestamp 
                ? new Date(trip.emsCompletionTimestamp).toLocaleString() 
                : null,
              origin: trip.fromLocation,
              destination: trip.toLocation
            };
          });
        
        console.log('TCC_DEBUG: TripsView - Setting trips:', tripsData.length, 'trips');
        console.log('TCC_DEBUG: TripsView - Status breakdown:', {
          total: tripsData.length,
          active: active.length,
          completed: completed.length,
          cancelled: tripsData.filter((t: any) => t.status === 'CANCELLED').length
        });
        setTrips(tripsData);
        setActiveTrips(active);
        setCompletedTrips(completed);
        setFilteredTrips(active);
        setLastRefresh(new Date());
      } else {
        const errorMsg = response.data.error || 'Failed to fetch trips';
        console.error('TCC_DEBUG: TripsView - API returned error:', errorMsg);
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: TripsView - Fetch error:', error);
      console.error('TCC_DEBUG: TripsView - Error response:', error.response?.data);
      console.error('TCC_DEBUG: TripsView - Error status:', error.response?.status);
      console.error('TCC_DEBUG: TripsView - Full error:', JSON.stringify(error.response?.data, null, 2));
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch trips';
      setError(`${errorMessage} (Status: ${error.response?.status || 'Unknown'})`);
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

  // Apply filters (only to active trips)
  useEffect(() => {
    if (activeTab === 'completed') {
      // For completed tab, no filtering needed (or add filters later if needed)
      return;
    }
    
    let filtered = [...activeTrips];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.tripNumber.toLowerCase().includes(term) ||
        trip.patientId.toLowerCase().includes(term) ||
        trip.fromLocation.toLowerCase().includes(term) ||
        trip.toLocation.toLowerCase().includes(term) ||
        (trip.assignedAgency?.name || '').toLowerCase().includes(term) ||
        (trip.healthcareFacilityName || '').toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING') {
        // Include both PENDING and PENDING_DISPATCH for PENDING filter
        filtered = filtered.filter(trip => trip.status === 'PENDING' || trip.status === 'PENDING_DISPATCH');
      } else if (statusFilter === 'COMPLETED') {
        // Include both COMPLETED and HEALTHCARE_COMPLETED for COMPLETED filter
        filtered = filtered.filter(trip => trip.status === 'COMPLETED' || trip.status === 'HEALTHCARE_COMPLETED');
      } else if (statusFilter === 'IN_PROGRESS') {
        // Include both IN_PROGRESS and ACCEPTED for In Progress filter
        filtered = filtered.filter(trip => trip.status === 'IN_PROGRESS' || trip.status === 'ACCEPTED');
      } else {
        filtered = filtered.filter(trip => trip.status === statusFilter);
      }
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

    // Healthcare facility filter
    if (healthcareFacilityFilter !== 'ALL') {
      filtered = filtered.filter(trip => 
        trip.healthcareFacilityName === healthcareFacilityFilter
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
  }, [activeTrips, searchTerm, statusFilter, priorityFilter, transportFilter, dateFilter, healthcareFacilityFilter, sortField, sortDirection, user, activeTab]);

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

  // Export active trips to CSV
  const exportToCSV = () => {
    const headers = [
      'Trip Number',
      'Patient ID',
      'Healthcare Facility',
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
      trip.healthcareFacilityName || 'N/A',
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
    a.download = `active-trips-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export completed trips to CSV
  const exportCompletedTripsToCSV = () => {
    if (completedTrips.length === 0) {
      alert('No completed trips to export');
      return;
    }

    const csvHeaders = [
      'Patient ID',
      'Agency',
      'Origin Facility',
      'Destination Facility',
      'Transport Level',
      'Urgency Level',
      'Request Time',
      'Acceptance Time',
      'Pickup Time',
      'Wait Time',
      'Completion Time',
      'Status',
      'Healthcare Facility'
    ];

    const csvData = completedTrips.map(trip => {
      // Get agency name (same logic as display)
      let agencyName = 'No Agency';
      const selectedResponse = trip.agencyResponses?.find((r: any) => r.isSelected === true && r.response === 'ACCEPTED');
      if (selectedResponse) {
        agencyName = selectedResponse.agency?.name || 'Unknown Agency';
      } else if (trip.assignedAgencyId) {
        const agencyResponse = trip.agencyResponses?.find((r: any) => r.agencyId === trip.assignedAgencyId);
        agencyName = agencyResponse?.agency?.name || 'Agency Assigned';
      }

      return [
        trip.patientId,
        agencyName,
        trip.origin || trip.fromLocation || 'N/A',
        trip.destination || trip.toLocation || 'N/A',
        trip.transportLevel || 'N/A',
        trip.urgencyLevel || 'Routine',
        trip.requestTime || 'N/A',
        trip.acceptanceTime || 'N/A',
        trip.pickupTime || 'N/A',
        trip.waitTime || 'N/A',
        trip.healthcareCompletionTime || trip.emsCompletionTime || 'N/A',
        trip.status,
        trip.healthcareFacilityName || 'N/A'
      ];
    });

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed-trips-${new Date().toISOString().split('T')[0]}.csv`;
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
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading trips</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all transport requests
            {activeTab === 'active' && activeTrips.length > 0 && ` (${activeTrips.length} active trips)`}
            {activeTab === 'completed' && completedTrips.length > 0 && ` (${completedTrips.length} completed trips)`}
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
          {activeTab === 'active' && (
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
          {activeTab === 'completed' && (
            <button
              onClick={exportCompletedTripsToCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'active', name: 'Active Trips', icon: Clock },
              { id: 'completed', name: 'Completed Trips', icon: Archive }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'active' | 'completed')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Stats Cards - Only show for Active tab */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Active</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{activeTrips.length}</dd>
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
                      {activeTrips.filter(t => t.status === 'PENDING' || t.status === 'PENDING_DISPATCH').length}
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
                      {activeTrips.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters - Only show for Active tab */}
      {activeTab === 'active' && (
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
                  <option value="PENDING_DISPATCH">Pending Dispatch</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="HEALTHCARE_COMPLETED">Healthcare Completed</option>
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

              {/* Healthcare Facility Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Healthcare Facility</label>
                <select
                  value={healthcareFacilityFilter}
                  onChange={(e) => setHealthcareFacilityFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Facilities</option>
                  {Array.from(new Set(trips
                    .map(t => t.healthcareFacilityName)
                    .filter(Boolean) as string[]))
                    .sort()
                    .map(facility => (
                      <option key={facility} value={facility}>{facility}</option>
                    ))}
                </select>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Active Trips Tab Content */}
      {activeTab === 'active' && (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredTrips.length}</span> of{' '}
              <span className="font-medium">{activeTrips.length}</span> active trips
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          {/* Trip Cards */}
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                user={user}
                onRefresh={fetchTrips}
                onEdit={(tripId) => {
                  // Navigate to edit page - for now show trip details modal
                  setSelectedTrip(trips.find(t => t.id === tripId) || null);
                  setShowTripModal(true);
                }}
                onDispatch={(trip) => {
                  // Map Trip to TransportRequest format expected by TripDispatchScreen
                  const tripForDispatch = {
                    id: trip.id,
                    patientId: trip.patientId,
                    fromLocation: trip.fromLocation,
                    toLocation: trip.toLocation,
                    scheduledTime: trip.scheduledTime,
                    transportLevel: trip.transportLevel,
                    urgencyLevel: trip.urgencyLevel,
                    diagnosis: trip.diagnosis,
                    mobilityLevel: trip.mobilityLevel,
                    oxygenRequired: trip.oxygenRequired,
                    monitoringRequired: trip.monitoringRequired,
                    notes: '',
                    tripNumber: trip.tripNumber
                  };
                  setDispatchTrip(tripForDispatch as any);
                  setShowDispatchScreen(true);
                }}
              />
            ))}

            {filteredTrips.length === 0 && (
              <div className="text-center py-12">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active trips found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || transportFilter !== 'ALL' || dateFilter !== 'ALL'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No active trips at this time.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Completed Trips Tab Content */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Completed Transport Requests ({completedTrips.length})
              </h3>
            </div>
            <div className="p-6">
              {completedTrips.length > 0 ? (
                <div className="space-y-4">
                  {completedTrips.map((trip) => (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                Patient {trip.patientId} - Agency: {(() => {
                                  // Find the selected agency response
                                  const selectedResponse = trip.agencyResponses?.find((r: any) => r.isSelected === true && r.response === 'ACCEPTED');
                                  if (selectedResponse) {
                                    return selectedResponse.agency?.name || 'Unknown Agency';
                                  }
                                  // Fallback: check if there's an assigned agency ID
                                  if (trip.assignedAgencyId) {
                                    // Try to find agency name from responses
                                    const agencyResponse = trip.agencyResponses?.find((r: any) => r.agencyId === trip.assignedAgencyId);
                                    return agencyResponse?.agency?.name || 'Agency Assigned';
                                  }
                                  return 'No Agency';
                                })()} - Urgency: {trip.urgencyLevel || 'Routine'} - {trip.transportLevel}
                              </h4>
                              <p className="text-base text-gray-600">
                                {trip.origin || trip.fromLocation} → {trip.destination || trip.toLocation}
                              </p>
                              {trip.healthcareFacilityName && (
                                <p className="text-sm text-gray-700 font-medium mt-1">
                                  Facility: {trip.healthcareFacilityName}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <div className="font-bold text-gray-800">Request Time:</div>
                              <div className="text-gray-500">{trip.requestTime}</div>
                            </div>
                            {trip.acceptanceTime ? (
                              <div>
                                <div className="font-bold text-gray-800">Acceptance Time:</div>
                                <div className="text-blue-600">{trip.acceptanceTime}</div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-gray-800">Acceptance Time:</div>
                                <div className="text-blue-600">N/A</div>
                              </div>
                            )}
                            {trip.pickupTime && (
                              <div>
                                <div className="font-bold text-gray-800">Pickup Time:</div>
                                <div className="text-gray-500">{trip.pickupTime}</div>
                              </div>
                            )}
                            {trip.waitTime && (
                              <div>
                                <div className="font-bold text-gray-800">Wait Time:</div>
                                <div className="text-green-600 font-semibold">{trip.waitTime}</div>
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-800">Completion Time:</div>
                              <div className="text-gray-500">
                                {trip.healthcareCompletionTime || trip.emsCompletionTime || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No completed trips</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Completed trips will appear here once they are finished.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Dispatch Screen Modal */}
      {showDispatchScreen && dispatchTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TripDispatchScreen
              tripId={dispatchTrip.id}
              trip={dispatchTrip}
              user={{
                id: user.id,
                email: user.email || '',
                name: user.name || '',
                userType: user.userType
              }}
              onDispatchComplete={() => {
                console.log('TCC_DEBUG: Dispatch completed, refreshing trips...');
                setShowDispatchScreen(false);
                setDispatchTrip(null);
                fetchTrips(); // Refresh trip list
              }}
              onCancel={() => {
                console.log('TCC_DEBUG: Dispatch cancelled');
                setShowDispatchScreen(false);
                setDispatchTrip(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsView;
