import React, { useState, useEffect } from 'react';

interface Trip {
  id: string;
  origin: string;
  destination: string;
  transportLevel: 'ALS' | 'BLS' | 'CCT' | 'Other';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  requestTime: string;
  acceptedTime?: string;
  eta?: string;
  emsAgency?: string;
  patientInfo: {
    name: string;
    age: string;
    weight: string;
    specialNeeds: string;
  };
  clinicalDetails: {
    diagnosis: string;
    mobility: 'ambulatory' | 'wheelchair' | 'stretcher' | 'bed';
    oxygenRequired: boolean;
    monitoringRequired: boolean;
  };
  urgency: 'routine' | 'urgent' | 'emergent';
  notes: string;
}

interface TripManagementProps {
  onNavigate?: (page: string) => void;
}

const TripManagement: React.FC<TripManagementProps> = ({ onNavigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const mockTrips: Trip[] = [
      {
        id: '1',
        origin: 'City General Hospital',
        destination: 'Regional Medical Center',
        transportLevel: 'ALS',
        status: 'accepted',
        requestTime: '2025-08-29T10:00:00Z',
        acceptedTime: '2025-08-29T10:15:00Z',
        eta: '2025-08-29T11:30:00Z',
        emsAgency: 'Metro EMS',
        patientInfo: {
          name: 'John Smith',
          age: '45 years',
          weight: '180 lbs',
          specialNeeds: 'None'
        },
        clinicalDetails: {
          diagnosis: 'Acute myocardial infarction',
          mobility: 'stretcher',
          oxygenRequired: true,
          monitoringRequired: true
        },
        urgency: 'emergent',
        notes: 'Patient requires immediate cardiac intervention'
      },
      {
        id: '2',
        origin: 'City General Hospital',
        destination: 'Rehabilitation Center',
        transportLevel: 'BLS',
        status: 'pending',
        requestTime: '2025-08-29T14:00:00Z',
        patientInfo: {
          name: 'Sarah Johnson',
          age: '62 years',
          weight: '140 lbs',
          specialNeeds: 'Wheelchair assistance'
        },
        clinicalDetails: {
          diagnosis: 'Post-stroke rehabilitation',
          mobility: 'wheelchair',
          oxygenRequired: false,
          monitoringRequired: false
        },
        urgency: 'routine',
        notes: 'Scheduled transfer for physical therapy'
      },
      {
        id: '3',
        origin: 'City General Hospital',
        destination: 'Specialty Clinic',
        transportLevel: 'CCT',
        status: 'in-progress',
        requestTime: '2025-08-29T08:00:00Z',
        acceptedTime: '2025-08-29T08:10:00Z',
        eta: '2025-08-29T09:45:00Z',
        emsAgency: 'Critical Care Transport',
        patientInfo: {
          name: 'Michael Brown',
          age: '38 years',
          weight: '200 lbs',
          specialNeeds: 'Ventilator dependent'
        },
        clinicalDetails: {
          diagnosis: 'Severe respiratory failure',
          mobility: 'bed',
          oxygenRequired: true,
          monitoringRequired: true
        },
        urgency: 'urgent',
        notes: 'Patient on mechanical ventilation, requires continuous monitoring'
      },
      {
        id: '4',
        origin: 'City General Hospital',
        destination: 'Outpatient Surgery Center',
        transportLevel: 'Other',
        status: 'pending',
        requestTime: '2025-08-29T16:00:00Z',
        patientInfo: {
          name: 'Lisa Davis',
          age: '28 years',
          weight: '120 lbs',
          specialNeeds: 'Wheelchair van required'
        },
        clinicalDetails: {
          diagnosis: 'Elective outpatient procedure',
          mobility: 'wheelchair',
          oxygenRequired: false,
          monitoringRequired: false
        },
        urgency: 'routine',
        notes: 'Patient needs wheelchair van transport for outpatient surgery'
      }
    ];
    
    setTrips(mockTrips);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'routine': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'emergent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesFilter = filter === 'all' || trip.status === filter;
    const matchesSearch = searchTerm === '' || 
      trip.patientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleCancelTrip = (tripId: string) => {
    // TODO: Implement actual trip cancellation API call
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, status: 'cancelled' as const }
        : trip
    ));
  };

  const handleViewDetails = (tripId: string) => {
    // TODO: Implement trip details view
    console.log('View trip details:', tripId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
        <p className="mt-2 text-gray-600">Monitor and manage all your transfer requests</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate?.('trips/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
        >
          + New Trip Request
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, origin, or destination..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Timing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMS Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {trip.origin} → {trip.destination}
                      </div>
                      <div className="text-sm text-gray-500">
                        Level: {trip.transportLevel}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(trip.urgency)}`}>
                        {trip.urgency.charAt(0).toUpperCase() + trip.urgency.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {trip.patientInfo.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trip.patientInfo.age}, {trip.patientInfo.weight}
                      </div>
                      {trip.patientInfo.specialNeeds && (
                        <div className="text-xs text-orange-600">
                          {trip.patientInfo.specialNeeds}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                        {getStatusText(trip.status)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Requested: {new Date(trip.requestTime).toLocaleString()}
                      </div>
                      {trip.acceptedTime && (
                        <div className="text-xs text-gray-500">
                          Accepted: {new Date(trip.acceptedTime).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {trip.emsAgency ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{trip.emsAgency}</div>
                        {trip.eta && (
                          <div className="text-sm text-gray-500">ETA: {new Date(trip.eta).toLocaleTimeString()}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Awaiting EMS</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      {trip.status === 'pending' && (
                        <button
                          onClick={() => handleCancelTrip(trip.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetails(trip.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No trips found matching your criteria</div>
            <button
              onClick={() => onNavigate?.('trips/new')}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first trip request
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {trips.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">
            {trips.filter(t => t.status === 'accepted').length}
          </div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {trips.filter(t => t.status === 'in-progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            {trips.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>
    </div>
  );
};

export default TripManagement;
