import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  User,
  LogOut,
  Bell,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import Notifications from './Notifications';
import EnhancedTripForm from './EnhancedTripForm';
import HealthcareSettingsPanel from './HealthcareSettingsPanel';
import { tripsAPI, unitsAPI } from '../services/api';

interface HealthcareDashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    facilityName?: string;
    facilityType?: string;
    manageMultipleLocations?: boolean; // ✅ NEW: Multi-location flag
  };

  onLogout: () => void;
}


const HealthcareDashboard: React.FC<HealthcareDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [updating, setUpdating] = useState(false);
  const [editOptions, setEditOptions] = useState<any>({
    transportLevel: [],
    urgency: [],
    diagnosis: [],
    mobility: [],
    insurance: [],
    specialNeeds: []
  });

  // Calculate wait time from request to pickup
  const calculateWaitTime = (requestTime: string, pickupTime: string | null) => {
    if (!pickupTime) return null;
    
    const request = new Date(requestTime);
    const pickup = new Date(pickupTime);
    const diffMs = pickup.getTime() - request.getTime();
    
    if (diffMs < 0) return '0 min'; // Handle edge cases
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMinutes}m`;
    } else {
      return `${diffMinutes} min`;
    }
  };

  // Load trips from API
  useEffect(() => {
    loadTrips();
    loadEditOptions();
    
    // Set up auto-refresh every 30 seconds to catch status updates from EMS
    const interval = setInterval(() => {
      loadTrips();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Apply status filter when trips or filter changes
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredTrips(trips);
    } else {
      const filtered = trips.filter(trip => trip.status === statusFilter);
      setFilteredTrips(filtered);
    }
  }, [trips, statusFilter]);

  // Function to get urgency level styling
  const getUrgencyLevelStyle = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'Routine':
        return 'text-black bg-transparent';
      case 'Urgent':
        return 'text-black bg-orange-200';
      case 'Emergent':
        return 'text-black bg-red-200';
      default:
        return 'text-black bg-transparent';
    }
  };

  const loadTrips = async () => {
    try {
      const response = await api.get('/trips');
      if (response.data) {
        const data = response.data;
        if (data.success && data.data) {
          // Transform API data to match component expectations
          const transformedTrips = data.data.map((trip: any) => ({
            id: trip.id,
            patientId: trip.patientId,
            origin: trip.originFacility?.name || trip.origin?.name || trip.originName || 'Unknown Origin',
            destination: trip.destinationFacility?.name || trip.destination?.name || trip.destinationName || 'Unknown Destination',
            pickupLocation: trip.pickupLocation ? {
              name: trip.pickupLocation.name,
              floor: trip.pickupLocation.floor,
              room: trip.pickupLocation.room,
            } : null,
            transportLevel: trip.transportLevel || 'BLS',
            status: trip.status,
            requestTime: new Date(trip.createdAt).toLocaleString(),
            requestTimeISO: trip.createdAt,
            pickupTime: trip.pickupTimestamp ? new Date(trip.pickupTimestamp).toLocaleString() : null,
            pickupTimeISO: trip.pickupTimestamp,
            assignedUnitId: trip.assignedUnitId || null,
            assignedUnitNumber: trip.assignedUnit?.unitNumber || null,
            assignedUnitType: trip.assignedUnit?.type || null,
            arrivalTime: trip.arrivalTimestamp ? new Date(trip.arrivalTimestamp).toLocaleString() : null,
            arrivalTimestampISO: trip.arrivalTimestamp || null,
            departureTime: trip.departureTimestamp ? new Date(trip.departureTimestamp).toLocaleString() : null,
            departureTimestampISO: trip.departureTimestamp || null,
            assignedAgencyId: trip.assignedAgencyId || null,
            priority: trip.priority,
            urgencyLevel: trip.urgencyLevel,
            completionTime: trip.completionTimestamp ? new Date(trip.completionTimestamp).toLocaleString() : null,
            completionTimestampISO: trip.completionTimestamp || null
          }));

          try {
            console.log('TCC_DEBUG: Healthcare transformed active trips (sample)', transformedTrips.slice(0, 3));
            console.log('TCC_DEBUG: Healthcare raw trips (sample)', (data.data || []).slice(0, 3));
          } catch {}
          
          // Filter out completed and cancelled trips from main list
          let activeTrips = transformedTrips.filter(trip => trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED');

          // Frontend fallback: hydrate assigned unit details if not included in API
          try {
            const missingUnitIds = Array.from(new Set(
              activeTrips
                .filter(t => !t.assignedUnitNumber && t.assignedUnitId)
                .map(t => t.assignedUnitId)
                .filter(Boolean)
            ));
            console.log('TCC_DEBUG: Healthcare unit hydration - missingUnitIds', missingUnitIds);
            console.log('TCC_DEBUG: Healthcare unit hydration - assigned fields sample', activeTrips.slice(0,3).map(t => ({ id: t.id, assignedUnitId: t.assignedUnitId, assignedUnitNumber: t.assignedUnitNumber, assignedUnitType: t.assignedUnitType })));
            if (missingUnitIds.length > 0) {
              const results = await Promise.all(missingUnitIds.map((id: string) => 
                unitsAPI.getById(id).then(r => ({ id, unit: r.data?.data || null })).catch(() => ({ id, unit: null }))
              ));
              console.log('TCC_DEBUG: Healthcare unit hydration - fetched units', results);
              const idToUnit: Record<string, any> = {};
              results.forEach(({ id, unit }) => { if (unit) idToUnit[id] = unit; });
              activeTrips = activeTrips.map(t => {
                if (!t.assignedUnitNumber && t.assignedUnitId && idToUnit[t.assignedUnitId]) {
                  const u = idToUnit[t.assignedUnitId];
                  return {
                    ...t,
                    assignedUnitNumber: u.unitNumber || null,
                    assignedUnitType: u.type || null,
                  };
                }
                return t;
              });
              console.log('TCC_DEBUG: Healthcare unit hydration - after merge sample', activeTrips.slice(0,3).map(t => ({ id: t.id, assignedUnitId: t.assignedUnitId, assignedUnitNumber: t.assignedUnitNumber, assignedUnitType: t.assignedUnitType })));
            }
          } catch (e) {
            console.log('TCC_DEBUG: unit hydration skipped due to error', e);
          }

          setTrips(activeTrips);
          setFilteredTrips(activeTrips); // Initialize filtered trips
          
          // Set completed/cancelled trips for the completed tab with wait time calculation
          const completed = transformedTrips
            .filter(trip => trip.status === 'COMPLETED' || trip.status === 'CANCELLED')
            .map(trip => ({
              ...trip,
              waitTime: calculateWaitTime(trip.requestTimeISO, trip.pickupTimeISO)
            }));
          setCompletedTrips(completed);
        }
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const loadEditOptions = async () => {
    try {
      console.log('TCC_DEBUG: Loading edit options from hospital settings...');
      
      // Load dropdown options from backend Hospital Settings
      const [tlRes, urgRes, diagRes, mobRes, insRes, snRes] = await Promise.all([
        api.get('/dropdown-options/transport-level').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/dropdown-options/urgency').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/dropdown-options/diagnosis').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/dropdown-options/mobility').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/dropdown-options/insurance').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/dropdown-options/special-needs').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      const toValues = (resp: any, fallback: string[]) => 
        (resp?.data?.success && Array.isArray(resp.data.data) ? resp.data.data.map((o: any) => o.value) : fallback);

      // Ensure urgency always has baseline defaults merged with hospital settings
      const urgencyDefaults = ['Routine', 'Urgent', 'Emergent'];
      const urgencyFromAPI = toValues(urgRes, []);
      const urgencyOptions = [...urgencyDefaults, ...urgencyFromAPI.filter(val => !urgencyDefaults.includes(val))];

      const options = {
        transportLevel: toValues(tlRes, ['BLS', 'ALS', 'CCT', 'Other']),
        urgency: urgencyOptions,
        diagnosis: toValues(diagRes, ['Cardiac', 'Respiratory', 'Neurological', 'Trauma']),
        mobility: toValues(mobRes, ['Ambulatory', 'Wheelchair', 'Stretcher', 'Bed-bound']),
        insurance: toValues(insRes, ['Medicare', 'Medicaid', 'Private', 'Self-pay']),
        specialNeeds: toValues(snRes, ['Bariatric Stretcher'])
      };

      console.log('TCC_DEBUG: Setting edit options:', options);
      setEditOptions(options);
    } catch (error) {
      console.error('Error loading edit options:', error);
      // Fallback to basic options if API fails
      setEditOptions({
        transportLevel: ['BLS', 'ALS', 'CCT', 'Other'],
        urgency: ['Routine', 'Urgent', 'Emergent'],
        diagnosis: ['Cardiac', 'Respiratory', 'Neurological', 'Trauma'],
        mobility: ['Ambulatory', 'Wheelchair', 'Stretcher', 'Bed-bound'],
        insurance: ['Medicare', 'Medicaid', 'Private', 'Self-pay'],
        specialNeeds: ['Bariatric Stretcher']
      });
    }
  };

  const markArrival = async (tripId: string, currentStatus: string) => {
    console.log('TCC_DEBUG: Healthcare markArrival click', { tripId, currentStatus });
    setUpdating(true);
    try {
      const res = await tripsAPI.updateStatus(tripId, { status: currentStatus, arrivalTimestamp: new Date().toISOString() });
      console.log('TCC_DEBUG: markArrival response', res.status);
      await loadTrips();
    } catch (e: any) {
      console.error('TCC_DEBUG: markArrival error', e);
      alert(e?.response?.data?.error || e?.message || 'Failed to mark arrival');
    } finally {
      setUpdating(false);
    }
  };

  const markDeparture = async (tripId: string, currentStatus: string) => {
    console.log('TCC_DEBUG: Healthcare markDeparture click', { tripId, currentStatus });
    setUpdating(true);
    try {
      const res = await tripsAPI.updateStatus(tripId, { status: currentStatus, departureTimestamp: new Date().toISOString() });
      console.log('TCC_DEBUG: markDeparture response', res.status);
      await loadTrips();
    } catch (e: any) {
      console.error('TCC_DEBUG: markDeparture error', e);
      alert(e?.response?.data?.error || e?.message || 'Failed to mark departure');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditTrip = (trip: any) => {
    setEditingTrip(trip);
    setEditFormData({
      status: trip.status,
      transportLevel: trip.transportLevel,
      urgencyLevel: trip.urgencyLevel || 'Routine',
      diagnosis: trip.diagnosis || '',
      mobilityLevel: trip.mobilityLevel || '',
      insuranceCompany: trip.insuranceCompany || '',
      specialNeeds: trip.specialNeeds || '',
      oxygenRequired: trip.oxygenRequired || false,
      monitoringRequired: trip.monitoringRequired || false
    });
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip) return;
    
    setUpdating(true);
    try {
      const response = await api.put(`/trips/${editingTrip.id}/status`, {
        status: editFormData.status,
        urgencyLevel: editFormData.urgencyLevel,
        transportLevel: editFormData.transportLevel,
        diagnosis: editFormData.diagnosis,
        mobilityLevel: editFormData.mobilityLevel,
        insuranceCompany: editFormData.insuranceCompany,
          specialNeeds: editFormData.specialNeeds,
          oxygenRequired: editFormData.oxygenRequired,
          monitoringRequired: editFormData.monitoringRequired,
          ...(editFormData.status === 'COMPLETED' && { completionTimestamp: new Date().toISOString() })
        });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update trip');
      }

      // Reload trips to get updated data
      await loadTrips();
      setEditingTrip(null);
      setEditFormData({});
    } catch (error: any) {
      console.error('Error updating trip:', error);
      alert(error.message || 'Failed to update trip');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to mark this trip as completed?')) return;
    
    setUpdating(true);
    try {
      const response = await api.put(`/trips/${tripId}/status`, {
        status: 'COMPLETED',
        completionTimestamp: new Date().toISOString()
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to complete trip');
      }

      // Reload trips to get updated data
      await loadTrips();
    } catch (error: any) {
      console.error('Error completing trip:', error);
      alert(error.message || 'Failed to complete trip');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    const confirmed = confirm('Cancel this transport request? This cannot be undone.');
    if (!confirmed) return;
    try {
      // Use status update as a soft-delete (CANCELLED), since DELETE endpoint may not exist
      const response = await api.put(`/trips/${tripId}/status`, { status: 'CANCELLED' });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to cancel trip');
      }
      await loadTrips();
    } catch (error: any) {
      console.error('Error cancelling trip:', error);
      alert(error.message || 'Failed to cancel trip');
    }
  };

  // Settings state

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user.facilityName || 'Healthcare Facility'}
                </h1>
                <p className="text-sm text-gray-500 capitalize">
                  {user.facilityType?.toLowerCase() || 'Healthcare'} • Healthcare Portal
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Notifications user={user} />
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
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'trips', name: 'Transport Requests', icon: Clock },
              { id: 'in-progress', name: 'In-Progress', icon: AlertCircle },
              { id: 'completed', name: 'Completed Trips', icon: CheckCircle },
              { id: 'create', name: 'Create Request', icon: Plus },
              { id: 'hospital-settings', name: 'Hospital Settings', icon: Building2 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
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
        {activeTab === 'trips' && (
          <div className="space-y-6">
            {/* Summary Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Requests
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {trips.filter(trip => trip.status === 'PENDING').length}
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
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Completed Today
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {completedTrips.length}
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
                      <div className="p-3 rounded-md bg-red-500">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Emergent Trips
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {trips.filter(trip => 
                            (trip.status === 'PENDING' || trip.status === 'ACCEPTED' || trip.status === 'IN_PROGRESS') && 
                            (trip.urgencyLevel === 'Emergent')
                          ).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Requests List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Transport Requests</h3>
                  <div className="flex items-center space-x-4">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                      Filter by status:
                    </label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="DECLINED">Declined</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
              {filteredTrips.length > 0 ? (
                <div className="space-y-4">
                  {filteredTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">Patient {trip.patientId} - {trip.transportLevel} - Request Time: {trip.requestTime}</h4>
                          <p className="text-base text-gray-600">
                            {trip.origin} → {trip.destination}
                          </p>
                          {trip.pickupLocation && (
                            <p className="text-xs text-blue-600">
                              Pickup: {trip.pickupLocation.name}
                              {trip.pickupLocation.floor && ` (Floor ${trip.pickupLocation.floor})`}
                              {trip.pickupLocation.room && ` - Room ${trip.pickupLocation.room}`}
                              {trip.pickupTime && ` • ${trip.pickupTime}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (trip.urgencyLevel || 'Routine') === 'Emergent' 
                            ? 'bg-red-100 text-red-800' 
                            : (trip.urgencyLevel || 'Routine') === 'Urgent'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {trip.urgencyLevel || 'Routine'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                        <div className="flex space-x-2 ml-4">
                          <button
                            title="Edit"
                            onClick={() => handleEditTrip(trip)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                            disabled={updating}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {trip.status !== 'COMPLETED' && (
                            <button
                              title="Complete"
                              onClick={() => handleCompleteTrip(trip.id)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-800 hover:bg-green-200"
                              disabled={updating}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            title="Delete"
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                            disabled={updating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {statusFilter === 'ALL' ? 'No transport requests' : `No ${statusFilter.toLowerCase()} requests`}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter === 'ALL' 
                      ? 'Create your first transport request to get started.'
                      : 'Try selecting a different status filter or create a new request.'
                    }
                  </p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div>
            <EnhancedTripForm 
              user={user} 
              onTripCreated={() => {
                // Refresh trips list and go to trips tab to see the new trip
                loadTrips();
                setActiveTab('trips');
              }}
              onCancel={() => {
                // Go back to trips tab when cancel is clicked
                setActiveTab('trips');
              }}
            />
          </div>
        )}

        {activeTab === 'in-progress' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">In-Progress</h2>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Accepted and Active Trips</h3>
              </div>
              <div className="p-6">
                {trips.filter(t => t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS').length > 0 ? (
                  <div className="space-y-4">
                    {trips
                      .filter(t => t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS')
                      .map((trip) => (
                      <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">Patient {trip.patientId}</h4>
                            <p className="text-base text-gray-600">{trip.origin} → {trip.destination}</p>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-bold text-gray-800">Assigned Unit</div>
                                <div className="text-gray-600">
                                  {trip.assignedUnitNumber
                                    ? `${trip.assignedUnitNumber}${trip.assignedUnitType ? ` (${trip.assignedUnitType})` : ''}`
                                    : (trip.assignedUnitId
                                        ? `#${trip.assignedUnitId}`
                                        : (trip.status === 'ACCEPTED' ? 'Awaiting unit assignment' : '—')
                                      )}
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">Pickup Time</div>
                                <div className="text-gray-600">{trip.pickupTime || (trip.arrivalTime ? '—' : '—')}</div>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">Arrival Time</div>
                                <div className="text-gray-600">{trip.arrivalTime || '—'}</div>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">Departure Time</div>
                                <div className="text-gray-600">{trip.departureTime || '—'}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!trip.arrivalTimestampISO && (
                              <button
                                onClick={() => markArrival(trip.id, trip.status)}
                                disabled={updating}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                              >
                                Mark Arrival
                              </button>
                            )}
                            {trip.arrivalTimestampISO && !trip.departureTimestampISO && (
                              <button
                                onClick={() => markDeparture(trip.id, trip.status)}
                                disabled={updating}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                              >
                                Mark Departure
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No in-progress trips</h3>
                    <p className="mt-1 text-sm text-gray-500">Trips will appear here after EMS accepts and starts them.</p>
                  </div>
                )}
              </div>
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
                                <p className="text-base text-gray-600">
                                  {trip.origin} → {trip.destination}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-6 gap-4 text-sm">
                              <div>
                                <div className="font-bold text-gray-800">Transport Level:</div>
                                <div className="text-gray-500">{trip.transportLevel}</div>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">Urgency:</div>
                                <div className="text-gray-500">{trip.urgencyLevel || 'Routine'}</div>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">Request Time:</div>
                                <div className="text-gray-500">{trip.requestTime}</div>
                              </div>
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
                                  {trip.status === 'CANCELLED' ? 'Cancelled' : (trip.completionTime || 'N/A')}
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

        {false && activeTab === 'responses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agency Responses</h2>
              <button
                onClick={() => loadAgencyResponses()}
                disabled={loadingResponses}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingResponses ? 'Loading...' : 'Refresh Responses'}
              </button>
            </div>

            {/* Response Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md bg-blue-500">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Responses
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {agencyResponses.length}
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
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Accepted
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {agencyResponses.filter(r => r.response === 'ACCEPTED').length}
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
                      <div className="p-3 rounded-md bg-red-500">
                        <X className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Declined
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {agencyResponses.filter(r => r.response === 'DECLINED').length}
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
                      <div className="p-3 rounded-md bg-yellow-500">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Selected
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {agencyResponses.filter(r => r.isSelected).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Response List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Agency Response Details
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  View and manage agency responses for transport requests
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {loadingResponses ? (
                  <li className="px-4 py-5 sm:px-6">
                    <div className="text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                        Loading agency responses...
                      </div>
                    </div>
                  </li>
                ) : agencyResponses.length === 0 ? (
                  <li className="px-4 py-5 sm:px-6">
                    <div className="text-center text-gray-500">
                      No agency responses found. Create a transport request to see responses.
                    </div>
                  </li>
                ) : (
                  agencyResponses.map((response) => (
                    <li key={response.id} className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-md ${
                              response.response === 'ACCEPTED' ? 'bg-green-100' : 
                              response.response === 'DECLINED' ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                              {response.response === 'ACCEPTED' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : response.response === 'DECLINED' ? (
                                <X className="h-5 w-5 text-red-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                Agency {response.agencyId}
                              </p>
                              {response.isSelected && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Trip ID: {response.tripId}
                            </p>
                            {response.responseNotes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {response.responseNotes}
                              </p>
                            )}
                            {response.estimatedArrival && (
                              <p className="text-sm text-gray-500 mt-1">
                                ETA: {new Date(response.estimatedArrival).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            response.response === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            response.response === 'DECLINED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {response.response}
                          </span>
                          {response.response === 'ACCEPTED' && !response.isSelected && (
                            <button
                              onClick={() => handleSelectAgency(response.tripId, response.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                            >
                              Select Agency
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}


        {activeTab === 'hospital-settings' && (
          <HealthcareSettingsPanel user={user} />
        )}
      </main>

      {/* Edit Trip Modal */}
      {editingTrip && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Trip Details - Patient {editingTrip.patientId}</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateTrip(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Status */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Transport Level */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Level
                    </label>
                    <select
                      value={editFormData.transportLevel}
                      onChange={(e) => setEditFormData({...editFormData, transportLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      {editOptions.transportLevel.map((level: string) => (
                        <option key={level} value={level}>
                          {level === 'BLS' ? 'BLS - Basic Life Support' :
                           level === 'ALS' ? 'ALS - Advanced Life Support' :
                           level === 'CCT' ? 'CCT - Critical Care Transport' :
                           level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Urgency Level */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={editFormData.urgencyLevel}
                      onChange={(e) => setEditFormData({...editFormData, urgencyLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      {editOptions.urgency.map((urgency: string) => (
                        <option key={urgency} value={urgency}>{urgency}</option>
                      ))}
                    </select>
                  </div>

                  {/* Diagnosis */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Diagnosis
                    </label>
                    <select
                      value={editFormData.diagnosis}
                      onChange={(e) => setEditFormData({...editFormData, diagnosis: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select diagnosis</option>
                      {editOptions.diagnosis.map((diagnosis: string) => (
                        <option key={diagnosis} value={diagnosis}>{diagnosis}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mobility Level */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobility Level
                    </label>
                    <select
                      value={editFormData.mobilityLevel}
                      onChange={(e) => setEditFormData({...editFormData, mobilityLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select mobility level</option>
                      {editOptions.mobility.map((mobility: string) => (
                        <option key={mobility} value={mobility}>{mobility}</option>
                      ))}
                    </select>
                  </div>

                  {/* Insurance Company */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Company
                    </label>
                    <select
                      value={editFormData.insuranceCompany}
                      onChange={(e) => setEditFormData({...editFormData, insuranceCompany: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select insurance company</option>
                      {editOptions.insurance.map((insurance: string) => (
                        <option key={insurance} value={insurance}>{insurance}</option>
                      ))}
                    </select>
                  </div>

                  {/* Special Needs */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Needs
                    </label>
                    <select
                      value={editFormData.specialNeeds}
                      onChange={(e) => setEditFormData({...editFormData, specialNeeds: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select special needs</option>
                      {editOptions.specialNeeds.map((specialNeed: string) => (
                        <option key={specialNeed} value={specialNeed}>{specialNeed}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clinical Requirements */}
                  <div className="mb-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinical Requirements
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editFormData.oxygenRequired}
                          onChange={(e) => setEditFormData({...editFormData, oxygenRequired: e.target.checked})}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Oxygen Required
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editFormData.monitoringRequired}
                          onChange={(e) => setEditFormData({...editFormData, monitoringRequired: e.target.checked})}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Continuous Monitoring Required
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTrip(null);
                      setEditFormData({});
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Trip'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthcareDashboard;
