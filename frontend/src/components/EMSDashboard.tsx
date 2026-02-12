import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  LogOut,
  Bell,
  Navigation,
  Settings,
  BarChart3,
  Calculator,
  Archive,
  HelpCircle,
  Radio
} from 'lucide-react';
import api from '../services/api';
import ChangePasswordModal from './ChangePasswordModal';
import Notifications from './Notifications';
import AgencySettings from './AgencySettings';
import EMSSubUsersPanel from './EMSSubUsersPanel';
// Units Management disabled - see docs/active/sessions/2026-01/units-management-disabled.md
// import UnitsManagement from './UnitsManagement';
import TripStatusButtons from './TripStatusButtons';
import EMSTripCalculator from './EMSTripCalculator';
import EMSAgencyAvailabilityStatus from './EMSAgencyAvailabilityStatus';
import { categorizeTripByDate, formatSectionHeader, DateCategory } from '../utils/dateUtils';
import { HelpModal } from './HelpSystem';
// import RevenueSettings from './RevenueSettings'; // Replaced by AgencySettings
// import EMSAnalytics from './EMSAnalytics'; // Moved to backup - will move to Admin later

interface EMSUser {
  id: string;
  email: string;
  name: string;
  userType: string;
  agencyName?: string;
  agencyId?: string;
  orgAdmin?: boolean;
}

interface AgencySaveResult {
  user: EMSUser;
  token?: string;
  emailChanged?: boolean;
}

interface EMSDashboardProps {
  user: EMSUser;
  onLogout: () => void;
  onUserUpdate?: (user: EMSUser, token?: string) => void;
}

const EMSDashboard: React.FC<EMSDashboardProps> = ({ user, onLogout, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('available'); // Default to Available Trips (new landing page)
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTopic, setHelpTopic] = useState<string | null>(null);
  // First-login enforcement for EMS header
  useEffect(() => {
    try {
      const flag = localStorage.getItem('mustChangePassword');
      if (flag === 'true') {
        setShowChangePassword(true);
        localStorage.removeItem('mustChangePassword');
      }
    } catch {}
  }, [user?.id]);
  
  useEffect(() => {
    if (!alert) return;
    const timeout = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timeout);
  }, [alert]);

  // Format time from minutes to hours and minutes
  const formatTime = (minutes: number | string): string => {
    const totalMinutes = typeof minutes === 'string' ? parseInt(minutes) : minutes;
    if (isNaN(totalMinutes)) return 'Unknown';
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };
  
  // Settings state
  const [settingsData, setSettingsData] = useState({
    agencyName: user.agencyName || '',
    email: user.email || '',
    serviceType: 'BLS/ALS', // Default value
    contactName: user.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    setSettingsData(prev => ({
      ...prev,
      agencyName: user.agencyName || '',
      email: user.email || '',
      contactName: user.name || ''
    }));
  }, [user.agencyName, user.email, user.name]);
  
  // Revenue calculation settings
  const [revenueSettings, setRevenueSettings] = useState({
    baseRates: {
      BLS: 150.0,
      ALS: 250.0,
      CCT: 400.0
    },
    perMileRates: {
      BLS: 2.50,
      ALS: 3.75,
      CCT: 5.00
    },
    priorityMultipliers: {
      LOW: 1.0,
      MEDIUM: 1.1,
      HIGH: 1.25,
      URGENT: 1.5
    },
    specialSurcharge: 50.0,
    insuranceRates: {
      medicare: { BLS: 120.0, ALS: 200.0, CCT: 350.0 },
      medicaid: { BLS: 100.0, ALS: 180.0, CCT: 300.0 },
      private: { BLS: 180.0, ALS: 300.0, CCT: 450.0 },
      selfPay: { BLS: 200.0, ALS: 350.0, CCT: 500.0 }
    }
  });
  const [revenuePreview, setRevenuePreview] = useState<any>(null);
  
  // Trip management state
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [acceptedTrips, setAcceptedTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date-based trip categorization
  const [todayTrips, setTodayTrips] = useState<any[]>([]);
  const [futureTrips, setFutureTrips] = useState<any[]>([]);
  const [pastTrips, setPastTrips] = useState<any[]>([]);
  const [unscheduledTrips, setUnscheduledTrips] = useState<any[]>([]);

  // Filter state for Available Trips
  const [filters, setFilters] = useState({
    transportLevel: 'ALL',
    priority: 'ALL',
    maxDistance: '',
    minRevenue: ''
  });

  // Unit selection disabled

  // Filtered trips based on filter state
  const [filteredAvailableTrips, setFilteredAvailableTrips] = useState<any[]>([]);

  // Apply filters to available trips
  useEffect(() => {
    let filtered = [...availableTrips];
    
    // Filter by transport level
    if (filters.transportLevel !== 'ALL') {
      filtered = filtered.filter(trip => trip.transportLevel === filters.transportLevel);
    }
    
    // Filter by priority (urgency level)
    if (filters.priority !== 'ALL') {
      filtered = filtered.filter(trip => trip.urgencyLevel === filters.priority);
    }
    
    // Note: Distance and revenue filters would require additional data fields
    // that may not be available in the current trip structure
    
    setFilteredAvailableTrips(filtered);
  }, [availableTrips, filters]);

  // Load trips from API with auto-refresh every 10 seconds
  useEffect(() => {
    loadTrips();
    const interval = setInterval(() => {
      loadTrips();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      // Load available trips (PENDING status)
      const availableResponse = await api.get('/api/trips?status=PENDING');
      
      // Get current agency ID (use agencyId if available, otherwise user.id)
      const currentAgencyId = user.agencyId || user.id;
      
      // Load agency responses for this agency to check if we've already responded to each trip
      // Filter by agencyId on the backend for better performance
      const responsesResponse = await api.get(`/api/agency-responses?agencyId=${currentAgencyId}`);
      const agencyResponses = responsesResponse.data?.data || [];
      
      // Create a set of trip IDs that THIS agency has already responded to with ACCEPTED or DECLINED
      // (exclude PENDING responses - those are created during dispatch but not yet a real response)
      const respondedTrips = new Set(
        agencyResponses
          .filter((r: any) => 
            r.agencyId === currentAgencyId && 
            (r.response === 'ACCEPTED' || r.response === 'DECLINED')
          )
          .map((r: any) => r.tripId)
      );
      
      // Create a set of trip IDs that THIS agency has ACCEPTED AND been SELECTED for (for filtering "My Trips")
      // Only trips where healthcare selected this agency should appear in "My Trips"
      const acceptedTripsByThisAgency = new Set(
        agencyResponses
          .filter((r: any) => 
            r.agencyId === currentAgencyId && 
            r.response === 'ACCEPTED' &&
            r.isSelected === true  // Only include trips where THIS agency was selected by healthcare
          )
          .map((r: any) => r.tripId)
      );
      
      if (availableResponse.data) {
        const availableData = availableResponse.data;
        if (availableData.success && availableData.data) {
          // Calculate distance and time for each trip
          const transformedAvailable = await Promise.all(availableData.data.map(async (trip: any) => {
            let distance = 'N/A';
            let estimatedTime = 'N/A';
            
            // Try to calculate real distance and time
            try {
              // Only send location IDs if they exist, otherwise use location strings
              const requestData: any = {};
              if (trip.fromLocationId && trip.destinationFacilityId) {
                requestData.fromLocationId = trip.fromLocationId;
                requestData.destinationFacilityId = trip.destinationFacilityId;
              } else {
                requestData.fromLocation = trip.fromLocation;
                requestData.toLocation = trip.toLocation;
              }
              
              const distanceResponse = await api.post('/api/trips/calculate-distance', requestData);
              
              if (distanceResponse.data.success) {
                distance = distanceResponse.data.data.distanceFormatted;
                estimatedTime = distanceResponse.data.data.estimatedTimeFormatted;
              }
            } catch (error) {
              console.log('TCC_DEBUG: Could not calculate distance for trip:', trip.id, error);
              console.log('TCC_DEBUG: Trip data:', { fromLocation: trip.fromLocation, toLocation: trip.toLocation, fromLocationId: trip.fromLocationId, destinationFacilityId: trip.destinationFacilityId });
              // Keep as N/A if calculation fails rather than showing misleading hardcoded values
              distance = 'N/A';
              estimatedTime = 'N/A';
            }
            
            return {
              id: trip.id,
              patientId: trip.patientId,
              origin: trip.fromLocation || 'Unknown Origin',
              destination: trip.toLocation || 'Unknown Destination',
              pickupLocation: trip.pickupLocation ? {
                name: trip.pickupLocation.name,
                floor: trip.pickupLocation.floor,
                room: trip.pickupLocation.room,
                contactPhone: trip.pickupLocation.contactPhone,
                contactEmail: trip.pickupLocation.contactEmail,
              } : null,
              transportLevel: trip.transportLevel || 'BLS',
              urgencyLevel: trip.urgencyLevel || 'Routine',
              distance: distance,
              estimatedTime: estimatedTime,
              requestTime: new Date(trip.createdAt).toLocaleString(),
              scheduledTime: trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleString() : null,
              scheduledTimeISO: trip.scheduledTime || null, // Raw ISO for categorization
              assignedUnitId: trip.assignedUnitId, // Track if this agency already assigned a unit
              assignedUnit: trip.assignedUnit, // Include unit info if assigned
              hasResponded: respondedTrips.has(trip.id), // Check if this agency has already responded
              status: trip.status || 'PENDING' // Include status to check if trip is authorized (PENDING_DISPATCH)
            };
          }));
          setAvailableTrips(transformedAvailable);

          // Categorize trips by date for four sections
          const today: any[] = [];
          const future: any[] = [];
          const past: any[] = [];
          const unscheduled: any[] = [];

          transformedAvailable.forEach((trip: any) => {
            const category = categorizeTripByDate(trip);
            switch (category) {
              case 'today':
                today.push(trip);
                break;
              case 'future':
                future.push(trip);
                break;
              case 'past':
                past.push(trip);
                break;
              case 'unscheduled':
                unscheduled.push(trip);
                break;
            }
          });

          setTodayTrips(today);
          setFutureTrips(future);
          setPastTrips(past);
          setUnscheduledTrips(unscheduled);
        }
      }

      // Load accepted trips (ACCEPTED, IN_PROGRESS status only)
      const acceptedResponse = await api.get('/api/trips?status=ACCEPTED,IN_PROGRESS');
      
      if (acceptedResponse.data) {
        const acceptedData = acceptedResponse.data;
        if (acceptedData.success && acceptedData.data) {
          // Filter to only show trips that THIS agency has accepted
          const tripsAcceptedByThisAgency = acceptedData.data.filter((trip: any) => 
            acceptedTripsByThisAgency.has(trip.id)
          );
          
          console.log('TCC_DEBUG: Filtering accepted trips - Total:', acceptedData.data.length, 'Accepted and selected by this agency:', tripsAcceptedByThisAgency.length, 'Agency ID:', currentAgencyId);
          console.log('TCC_DEBUG: Agency responses for this agency:', agencyResponses.filter((r: any) => r.agencyId === currentAgencyId && r.response === 'ACCEPTED').map((r: any) => ({ tripId: r.tripId, isSelected: r.isSelected })));
          
          // Calculate distance and time for each accepted trip
          const transformedAccepted = await Promise.all(tripsAcceptedByThisAgency.map(async (trip: any) => {
            let distance = 'N/A';
            let estimatedTime = 'N/A';
            
            // Try to calculate real distance and time
            try {
              // Only send location IDs if they exist, otherwise use location strings
              const requestData: any = {};
              if (trip.fromLocationId && trip.destinationFacilityId) {
                requestData.fromLocationId = trip.fromLocationId;
                requestData.destinationFacilityId = trip.destinationFacilityId;
              } else {
                requestData.fromLocation = trip.fromLocation;
                requestData.toLocation = trip.toLocation;
              }
              
              const distanceResponse = await api.post('/api/trips/calculate-distance', requestData);
              
              if (distanceResponse.data.success) {
                distance = distanceResponse.data.data.distanceFormatted;
                estimatedTime = distanceResponse.data.data.estimatedTimeFormatted;
              }
            } catch (error) {
              console.log('TCC_DEBUG: Could not calculate distance for accepted trip:', trip.id, error);
              console.log('TCC_DEBUG: Trip data:', { fromLocation: trip.fromLocation, toLocation: trip.toLocation, fromLocationId: trip.fromLocationId, destinationFacilityId: trip.destinationFacilityId });
              // Keep as N/A if calculation fails rather than showing misleading hardcoded values
              distance = 'N/A';
              estimatedTime = 'N/A';
            }
            
            return {
              id: trip.id,
              patientId: trip.patientId,
              origin: trip.fromLocation || 'Unknown Origin',
              destination: trip.toLocation || 'Unknown Destination',
              transportLevel: trip.transportLevel || 'BLS',
              urgencyLevel: trip.urgencyLevel || 'Routine',
              status: trip.status,
              distance: distance,
              estimatedTime: estimatedTime,
              assignedUnit: trip.assignedUnit ? {
                id: trip.assignedUnit.id,
                unitNumber: trip.assignedUnit.unitNumber,
                type: trip.assignedUnit.type,
                currentStatus: trip.assignedUnit.currentStatus
              } : null,
              pickupTime: trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleString() : 'Not started',
              scheduledTime: trip.scheduledTime
            };
          }));
          setAcceptedTrips(transformedAccepted);
        }
      }

      // Load completed trips separately
      // Filter by EMS completion timestamp instead of status
      // Backend already filters by agencyId for EMS users, so we just filter by completion timestamp
      const completedResponse = await api.get('/api/trips');
      
      if (completedResponse.data) {
        const completedData = completedResponse.data;
        if (completedData.success && completedData.data) {
          const transformedCompleted = completedData.data
            .filter((trip: any) => {
              // Filter by EMS completion timestamp
              // Backend already filters by agencyId, so we just need to check for completion
              return trip.emsCompletionTimestamp !== null;
            })
            .map((trip: any) => ({
              id: trip.id,
              patientId: trip.patientId,
              origin: trip.fromLocation || 'Unknown Origin',
              destination: trip.toLocation || 'Unknown Destination',
              transportLevel: trip.transportLevel || 'BLS',
              urgencyLevel: trip.urgencyLevel || 'Routine',
              status: trip.status,
              requestTime: new Date(trip.createdAt).toLocaleString(),
              completionTime: trip.emsCompletionTimestamp 
                ? new Date(trip.emsCompletionTimestamp).toLocaleString() 
                : null,
              emsCompletionTime: trip.emsCompletionTimestamp 
                ? new Date(trip.emsCompletionTimestamp).toLocaleString() 
                : null,
              emsCompletionTimestampISO: trip.emsCompletionTimestamp || null,
              scheduledTime: trip.scheduledTime
            }));
          
          setCompletedTrips(transformedCompleted);
        }
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try { document.cookie = 'tcc_token=; Max-Age=0; path=/'; } catch {}
    onLogout();
  };

  const exportCompletedTripsToCSV = () => {
    if (completedTrips.length === 0) {
      alert('No completed trips to export');
      return;
    }

    const csvHeaders = [
      'Patient ID',
      'Origin Facility',
      'Destination Facility',
      'Transport Level',
      'Urgency Level',
      'Request Time',
      'Completion Time',
      'Status'
    ];

    const csvData = completedTrips.map(trip => [
      trip.patientId,
      trip.origin,
      trip.destination,
      trip.transportLevel,
      trip.urgencyLevel,
      trip.requestTime,
      trip.completionTime || 'N/A',
      trip.status
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `completed-trips-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-800 bg-yellow-200 border border-yellow-300';
      case 'ACCEPTED': return 'text-green-800 bg-green-200 border border-green-300 font-bold';
      case 'DECLINED': return 'text-red-800 bg-red-200 border border-red-300 font-bold';
      case 'CANCELLED': return 'text-red-800 bg-red-200 border border-red-300 font-bold';
      case 'IN_PROGRESS': return 'text-blue-800 bg-blue-200 border border-blue-300 font-bold';
      case 'COMPLETED': return 'text-gray-800 bg-gray-200 border border-gray-300 font-bold';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'PENDING_DISPATCH': return 'Pending Dispatch';
      case 'ACCEPTED': return 'Accepted';
      case 'DECLINED': return 'Declined';
      case 'CANCELLED': return 'Cancelled';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'HEALTHCARE_COMPLETED': return 'Completed';
      default: return status;
    }
  };

  const getUrgencyLevelStyle = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'Routine':
        return 'bg-green-100 text-green-800';
      case 'Urgent':
        return 'bg-yellow-100 text-yellow-800';
      case 'Emergent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRevenueSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [category, subcategory] = name.split('.');
    
    if (subcategory) {
      setRevenueSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev],
          [subcategory]: parseFloat(value) || 0
        }
      }));
    } else {
      setRevenueSettings(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
    
    // Update revenue preview
    calculateRevenuePreview();
  };

  const calculateRevenuePreview = () => {
    const sampleTrip = {
      transportLevel: 'ALS',
      priority: 'MEDIUM',
      distanceMiles: 15.0,
      specialRequirements: false,
      insuranceCompany: 'medicare'
    };

    const baseRate = revenueSettings.baseRates[sampleTrip.transportLevel as keyof typeof revenueSettings.baseRates];
    const perMileRate = revenueSettings.perMileRates[sampleTrip.transportLevel as keyof typeof revenueSettings.perMileRates];
    const priorityMultiplier = revenueSettings.priorityMultipliers[sampleTrip.priority as keyof typeof revenueSettings.priorityMultipliers];
    const insuranceRate = revenueSettings.insuranceRates[sampleTrip.insuranceCompany as keyof typeof revenueSettings.insuranceRates][sampleTrip.transportLevel as keyof typeof revenueSettings.insuranceRates.medicare];
    
    const specialSurcharge = sampleTrip.specialRequirements ? revenueSettings.specialSurcharge : 0;
    
    // Calculate different revenue scenarios
    const standardRevenue = (baseRate * priorityMultiplier + specialSurcharge);
    const mileageRevenue = (baseRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;
    const insuranceRevenue = (insuranceRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;

    setRevenuePreview({
      sampleTrip,
      standardRevenue: Math.round(standardRevenue * 100) / 100,
      mileageRevenue: Math.round(mileageRevenue * 100) / 100,
      insuranceRevenue: Math.round(insuranceRevenue * 100) / 100
    });
  };

  const handleAgencySaveSuccess = (result: AgencySaveResult) => {
    const updatedUser = result.user;

    if (onUserUpdate) {
      onUserUpdate(updatedUser, result.token);
    }

    setSettingsData(prev => ({
      ...prev,
      agencyName: updatedUser.agencyName || prev.agencyName,
      email: updatedUser.email,
      contactName: updatedUser.name
    }));

    setAlert({
      type: 'success',
      message: result.emailChanged
        ? 'Agency settings saved. Your login email has been updated.'
        : 'Agency settings saved successfully.'
    });

    setActiveTab('available');
  };

  // Calculate revenue preview on component mount
  useEffect(() => {
    calculateRevenuePreview();
  }, [revenueSettings]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError(null);

    try {
      console.log('TCC_DEBUG: Frontend sending EMS agency update:', settingsData);
      console.log('TCC_DEBUG: Frontend token:', localStorage.getItem('token'));
      
      const response = await api.put('/auth/ems/agency/update', settingsData);

      console.log('TCC_DEBUG: Frontend response data:', response.data);

      if (!response.data.success) {
        console.log('TCC_DEBUG: Frontend error response:', response.data);
        throw new Error(response.data.error || 'Failed to update agency information');
      }

      console.log('TCC_DEBUG: Frontend success response:', response.data);

      setSettingsSuccess(true);
      // Navigate back to overview tab after successful save
      setActiveTab('overview');
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (error: any) {
      console.error('TCC_DEBUG: Frontend error updating agency:', error);
      setSettingsError(error.message || 'Failed to update agency information');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsCancel = () => {
    setSettingsData({
      agencyName: user.agencyName || '',
      email: user.email || '',
      serviceType: 'BLS/ALS',
      contactName: user.name || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setSettingsError(null);
    setSettingsSuccess(false);
    // Navigate back to overview tab
    setActiveTab('overview');
  };

  const handleAcceptTrip = async (tripId: string) => {
    try {
      console.log('TCC_DEBUG: EMS Dashboard - handleAcceptTrip called:', { tripId, user });
      
      // First, create an agency response (accept the trip)
      const payload = {
        tripId,
        agencyId: user.agencyId || user.id, // Use agencyId when available
        response: 'ACCEPTED',
        responseNotes: 'Accepted by EMS agency'
      };
      
      console.log('TCC_DEBUG: EMS Dashboard - Sending agency response payload:', payload);
      const response = await api.post('/api/agency-responses', payload);

      if (response.data && response.data.success) {
        // Reload trips to show updated status
        await loadTrips();
      } else {
        throw new Error(response.data?.error || 'Failed to accept trip');
      }
    } catch (error: any) {
      console.error('Error accepting trip:', error);
      setError(error.message || 'Failed to accept trip');
    }
  };

  const handleDeclineTrip = async (tripId: string) => {
    try {
      // Create a declined agency response
      const response = await api.post('/api/agency-responses', {
        tripId,
        agencyId: user.agencyId || user.id, // Use agencyId when available
        response: 'DECLINED',
        responseNotes: 'Declined by EMS agency'
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to decline trip');
      }

      // Reload trips to get updated data
      await loadTrips();
    } catch (error: any) {
      console.error('Error declining trip:', error);
      setError(error.message || 'Failed to decline trip');
    }
  };

  const handleUpdateTripStatus = async (tripId: string, newStatus: string) => {
    console.log('TCC_DEBUG: handleUpdateTripStatus called:', { tripId, newStatus });
    try {
      const payload = {
        status: newStatus,
        ...(newStatus === 'IN_PROGRESS' && { pickupTimestamp: new Date().toISOString() }),
        ...(newStatus === 'COMPLETED' && { emsCompletionTimestamp: new Date().toISOString() })
      };
      console.log('TCC_DEBUG: Sending API request to /api/trips/' + tripId + '/status with payload:', payload);
      
      const response = await api.put(`/api/trips/${tripId}/status`, payload);
      console.log('TCC_DEBUG: API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update trip status');
      }

      console.log('TCC_DEBUG: Trip status updated successfully, reloading trips...');
      // Reload trips to get updated data
      await loadTrips();
    } catch (error: any) {
      console.error('TCC_DEBUG: Error updating trip status:', error);
      setError(error.message || 'Failed to update trip status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user.agencyName || 'EMS Agency'}
                </h1>
                <p className="text-sm text-gray-500">EMS Agency Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Notifications user={user} />
              <button
                onClick={() => {
                  // Always show index when clicking main Help button
                  // Context-specific help can be accessed from within help files
                  setHelpTopic('index');
                  setShowHelp(true);
                }}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                title="Help"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </button>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => setShowChangePassword(true)}
                className="ml-2 flex items-center space-x-1 text-gray-600 hover:text-blue-700"
              >
                <Settings className="h-4 w-4" />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'available', name: 'Available Trips', icon: MapPin },
              { id: 'accepted', name: 'My Trips', icon: CheckCircle },
              { id: 'completed', name: 'Completed Trips', icon: Archive },
              // Units Management disabled - see docs/active/sessions/2026-01/units-management-disabled.md
              // { id: 'units', name: 'Units', icon: Truck },
              { id: 'availability-status', name: 'Availability Status', icon: Radio },
              { id: 'users', name: 'Users', icon: Settings },
              { id: 'agency-info', name: 'Agency Info', icon: Settings },
              { id: 'trip-calculator', name: 'Trip Calculator', icon: Calculator }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Reload trips when switching to completed tab to ensure fresh data
                    if (tab.id === 'completed') {
                      loadTrips();
                    }
                  }}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <div
            className={`mb-6 flex items-start justify-between rounded-md border px-4 py-3 ${
              alert.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <span className="text-sm font-medium">{alert.message}</span>
            <button
              type="button"
              onClick={() => setAlert(null)}
              className="ml-4 text-sm font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Unit selection modal removed (units not used) */}
        {/* Overview tab removed - Available Trips is now the landing page */}

        {activeTab === 'available' && (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transport Level</label>
                  <select
                    value={filters.transportLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, transportLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="BLS">BLS</option>
                    <option value="ALS">ALS</option>
                    <option value="CCT">CCT</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergent">Emergent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Distance</label>
                  <input
                    type="number"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: e.target.value }))}
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Revenue ($)</label>
                  <input
                    type="number"
                    value={filters.minRevenue}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRevenue: e.target.value }))}
                    placeholder="No minimum"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Available Transport Requests</h3>
                  <p className="text-sm text-gray-500">
                    Showing {filteredAvailableTrips.length} of {availableTrips.length} requests
                  </p>
                </div>
                <button
                  onClick={loadTrips}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              <div>
                {(() => {
                  // Apply filters to each section independently
                  const filteredToday = filters.transportLevel === 'ALL' ? todayTrips : todayTrips.filter(t => t.transportLevel === filters.transportLevel);
                  const filteredFuture = filters.transportLevel === 'ALL' ? futureTrips : futureTrips.filter(t => t.transportLevel === filters.transportLevel);
                  const filteredUnscheduled = filters.transportLevel === 'ALL' ? unscheduledTrips : unscheduledTrips.filter(t => t.transportLevel === filters.transportLevel);
                  const filteredPast = filters.transportLevel === 'ALL' ? pastTrips : pastTrips.filter(t => t.transportLevel === filters.transportLevel);

                  const renderTripSection = (trips: any[], title: string, category: DateCategory) => {
                    if (trips.length === 0) return null;
                    
                    return (
                      <div key={category} className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                          {title} ({trips.length})
                        </h4>
                        <div className="space-y-4">
                          {trips.map((trip: any) => {
                            const category_actual = categorizeTripByDate(trip);
                            return (
                              <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-900">
                                      Patient {trip.patientId} - Requested Pickup Time: {trip.scheduledTime || 'Not scheduled'}
                                    </h4>
                                    <p className="text-base text-gray-600">
                                      {trip.origin} → {trip.destination}
                                    </p>
                                    {trip.pickupLocation && (
                                      <p className="text-xs text-blue-600">
                                        Pickup: {trip.pickupLocation.name}{trip.pickupLocation.floor || trip.pickupLocation.room ? ': ' : ''}{trip.pickupLocation.floor && trip.pickupLocation.floor}{trip.pickupLocation.room && `${trip.pickupLocation.floor ? ' ' : ''}Room ${trip.pickupLocation.room}`}{trip.pickupLocation.contactPhone && ` Phone: ${trip.pickupLocation.contactPhone}`}{trip.pickupLocation.contactEmail && ` Email: ${trip.pickupLocation.contactEmail}`}
                                      </p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                      Distance: {trip.distance} Time: {formatTime(trip.estimatedTime)}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {trip.transportLevel} - Ticket Created At: {trip.requestTime}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyLevelStyle(trip.urgencyLevel || 'Routine')}`}>
                                    {trip.urgencyLevel || 'Routine'}
                                  </span>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('PENDING')}`}>
                                    PENDING
                                  </span>
                                  <div className="flex space-x-2 ml-4">
                                    {/* Hide Accept/Decline buttons for future trips (not authorized), show "Awaiting Authorization" */}
                                    {/* Show Accept/Decline if trip is authorized (PENDING_DISPATCH status) OR not in future category */}
                                    {category_actual === 'future' && trip.status !== 'PENDING_DISPATCH' ? (
                                      <span className="text-sm text-yellow-600 font-medium">
                                        Awaiting Authorization
                                      </span>
                                    ) : (
                                      <>
                                        {!trip.hasResponded && (
                                          <button
                                            onClick={() => handleAcceptTrip(trip.id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                                          >
                                            Accept
                                          </button>
                                        )}
                                        {trip.hasResponded && (
                                          <span className="text-sm text-green-600 font-medium">
                                            ✓ You responded
                                          </span>
                                        )}
                                        {!trip.hasResponded && (
                                          <button
                                            onClick={() => handleDeclineTrip(trip.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
                                          >
                                            Decline
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  };

                  const hasAnyTrips = filteredToday.length > 0 || filteredFuture.length > 0 || filteredUnscheduled.length > 0 || filteredPast.length > 0;

                  if (!hasAnyTrips) {
                    return (
                      <div className="p-6 text-center text-gray-500">
                        {availableTrips.length === 0 
                          ? 'No available transport requests at this time.'
                          : 'No requests match your current filters. Try adjusting your filter settings.'}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-8">
                      {renderTripSection(filteredToday, formatSectionHeader('today'), 'today')}
                      {renderTripSection(filteredFuture, formatSectionHeader('future'), 'future')}
                      {renderTripSection(filteredUnscheduled, formatSectionHeader('unscheduled'), 'unscheduled')}
                      {renderTripSection(filteredPast, formatSectionHeader('past'), 'past')}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accepted' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">My Accepted Trips</h3>
              <button
                onClick={loadTrips}
                disabled={loading}
                className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {acceptedTrips.map((trip) => (
                <div key={trip.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h4 className="text-lg font-medium text-gray-900">Patient {trip.patientId}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                          {formatStatus(trip.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {trip.origin} → {trip.destination}
                      </p>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Distance:</span> {trip.distance}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {formatTime(trip.estimatedTime)}
                        </div>
                        <div>
                          <span className="font-medium">Pickup Time:</span> {trip.pickupTime}
                        </div>
                        <div>
                          <span className="font-medium">Level:</span> {trip.transportLevel}
                        </div>
                      </div>
                    </div>
                  <div className="ml-4 flex space-x-2">
                      <TripStatusButtons tripId={trip.id} status={trip.status} onUpdate={handleUpdateTripStatus} />
                      {trip.status === 'COMPLETED' && (
                        <span className="text-sm text-gray-500">Completed</span>
                      )}
                    </div>
                  </div>
                {/* Unit details removed */}
                </div>
              ))}
              {acceptedTrips.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No accepted trips at this time.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Completed Trips</h2>
              <button
                onClick={exportCompletedTripsToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Export CSV
              </button>
            </div>
            
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
                                <h4 className="text-lg font-medium text-gray-900">Patient {trip.patientId}</h4>
                                <p className="text-sm text-gray-500">
                                  {trip.origin} → {trip.destination}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">Transport Level:</span> {trip.transportLevel}
                              </div>
                              <div>
                                <span className="font-medium">Priority:</span> {trip.urgencyLevel}
                              </div>
                              <div>
                                <span className="font-medium">Request Time:</span> {trip.requestTime}
                              </div>
                              <div>
                                <span className="font-medium">Completion Time:</span> {trip.completionTime || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Archive className="mx-auto h-12 w-12 text-gray-400" />
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

        {/* Analytics tab removed - moved to TCC Admin dashboard */}

        {activeTab === 'agency-info' && (
          <AgencySettings 
            user={user} 
            onSaveSuccess={handleAgencySaveSuccess} 
          />
        )}

        {activeTab === 'trip-calculator' && (
          <EMSTripCalculator user={user} />
        )}

        {/* Units Management disabled - see docs/active/sessions/2026-01/units-management-disabled.md */}
        {/* {activeTab === 'units' && (
          <UnitsManagement user={user} acceptedTrips={acceptedTrips} />
        )} */}

        {activeTab === 'availability-status' && (
          <EMSAgencyAvailabilityStatus user={user} />
        )}

        {activeTab === 'users' && (
          <EMSSubUsersPanel />
        )}

        {/* Settings tab removed - moved to TCC Admin dashboard */}
        {false && activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Agency Information Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Agency Settings</h3>
                <p className="text-sm text-gray-500">Update your agency information</p>
              </div>
            <div className="p-6">
              {settingsSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Agency information updated successfully!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {settingsError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {settingsError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                    <input
                      type="text"
                      value={settingsData.agencyName}
                      onChange={handleSettingsChange}
                      name="agencyName"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      value={settingsData.contactName}
                      onChange={handleSettingsChange}
                      name="contactName"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={settingsData.email}
                      onChange={handleSettingsChange}
                      name="email"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={settingsData.phone}
                      onChange={handleSettingsChange}
                      name="phone"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Type</label>
                  <select
                    value={settingsData.serviceType}
                    onChange={handleSettingsChange}
                    name="serviceType"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="BLS">BLS Only</option>
                    <option value="ALS">ALS Only</option>
                    <option value="BLS/ALS">BLS/ALS</option>
                    <option value="Critical Care">Critical Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={settingsData.address}
                    onChange={handleSettingsChange}
                    name="address"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={settingsData.city}
                      onChange={handleSettingsChange}
                      name="city"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      value={settingsData.state}
                      onChange={handleSettingsChange}
                      name="state"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      value={settingsData.zipCode}
                      onChange={handleSettingsChange}
                      name="zipCode"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleSettingsCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {settingsLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Revenue Calculation Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue Calculation Settings</h3>
              <p className="text-sm text-gray-500">Configure pricing rates and see real-time revenue projections</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Base Rates */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Base Rates by Transport Level</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BLS Base Rate ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.baseRates.BLS}
                        onChange={handleRevenueSettingsChange}
                        name="baseRates.BLS"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ALS Base Rate ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.baseRates.ALS}
                        onChange={handleRevenueSettingsChange}
                        name="baseRates.ALS"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CCT Base Rate ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.baseRates.CCT}
                        onChange={handleRevenueSettingsChange}
                        name="baseRates.CCT"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Per Mile Rates */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Per Mile Rates</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BLS Per Mile ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.perMileRates.BLS}
                        onChange={handleRevenueSettingsChange}
                        name="perMileRates.BLS"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ALS Per Mile ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.perMileRates.ALS}
                        onChange={handleRevenueSettingsChange}
                        name="perMileRates.ALS"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CCT Per Mile ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.perMileRates.CCT}
                        onChange={handleRevenueSettingsChange}
                        name="perMileRates.CCT"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Priority Multipliers */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Priority Multipliers</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Low Priority</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.priorityMultipliers.LOW}
                        onChange={handleRevenueSettingsChange}
                        name="priorityMultipliers.LOW"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medium Priority</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.priorityMultipliers.MEDIUM}
                        onChange={handleRevenueSettingsChange}
                        name="priorityMultipliers.MEDIUM"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">High Priority</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.priorityMultipliers.HIGH}
                        onChange={handleRevenueSettingsChange}
                        name="priorityMultipliers.HIGH"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Urgent Priority</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.priorityMultipliers.URGENT}
                        onChange={handleRevenueSettingsChange}
                        name="priorityMultipliers.URGENT"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Surcharge */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Additional Fees</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Special Requirements Surcharge ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.specialSurcharge}
                        onChange={handleRevenueSettingsChange}
                        name="specialSurcharge"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Preview */}
              {revenuePreview && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Revenue Preview</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Sample trip: {revenuePreview.sampleTrip.transportLevel} transport, {revenuePreview.sampleTrip.priority} priority, 
                    {revenuePreview.sampleTrip.distanceMiles} miles, {revenuePreview.sampleTrip.insuranceCompany} insurance
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-md border">
                      <h5 className="text-sm font-medium text-gray-700">Standard Rate</h5>
                      <p className="text-2xl font-bold text-gray-900">${revenuePreview.standardRevenue}</p>
                      <p className="text-xs text-gray-500">Base rate × priority</p>
                    </div>
                    <div className="bg-white p-4 rounded-md border">
                      <h5 className="text-sm font-medium text-gray-700">Mileage Rate</h5>
                      <p className="text-2xl font-bold text-gray-900">${revenuePreview.mileageRevenue}</p>
                      <p className="text-xs text-gray-500">Base + (per mile × distance)</p>
                    </div>
                    <div className="bg-white p-4 rounded-md border">
                      <h5 className="text-sm font-medium text-gray-700">Insurance Rate</h5>
                      <p className="text-2xl font-bold text-gray-900">${revenuePreview.insuranceRevenue}</p>
                      <p className="text-xs text-gray-500">Insurance rate + mileage</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    // Save revenue settings to localStorage
                    localStorage.setItem('ems_revenue_settings', JSON.stringify(revenueSettings));
                    alert('Revenue settings saved!');
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Save Revenue Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        userType="EMS"
        topic={helpTopic || undefined}
      />
    </div>
  );
};

export default EMSDashboard;