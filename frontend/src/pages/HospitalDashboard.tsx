import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Trip {
  id: string;
  origin: string;
  destination: string;
  transportLevel: 'ALS' | 'BLS' | 'CCT';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  requestTime: string;
  acceptedTime?: string;
  eta?: string;
  emsAgency?: string;
}

const HospitalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

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
        emsAgency: 'Metro EMS'
      },
      {
        id: '2',
        origin: 'City General Hospital',
        destination: 'Rehabilitation Center',
        transportLevel: 'BLS',
        status: 'pending',
        requestTime: '2025-08-29T14:00:00Z'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your transfer requests and monitor trip status</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/trips/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors"
        >
          + New Trip Request
        </button>
        <button
          onClick={() => navigate('/trips')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors"
        >
          View All Trips
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors"
        >
          Notifications
        </button>
      </div>

      {/* Recent Trips */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Transfer Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Time
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
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {trip.origin} → {trip.destination}
                      </div>
                      <div className="text-sm text-gray-500">
                        Level: {trip.transportLevel}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(trip.requestTime).toLocaleString()}
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
                    {trip.status === 'pending' && (
                      <button
                        onClick={() => {
                          // TODO: Implement trip cancellation
                          console.log('Cancel trip:', trip.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                    {trip.status === 'accepted' && (
                      <button
                        onClick={() => {
                          // TODO: Implement trip details view
                          console.log('View trip details:', trip.id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
          <div className="text-sm text-gray-600">Total Trips</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {trips.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {trips.filter(t => t.status === 'accepted').length}
          </div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {trips.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
