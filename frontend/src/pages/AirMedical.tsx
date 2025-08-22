import React, { useState, useEffect } from 'react';
import { 
  AirMedicalResource, 
  AirMedicalTransport, 
  WeatherAlert,
  AirMedicalType,
  AirMedicalStatus,
  WeatherAlertType,
  AlertSeverity,
  WeatherConditions
} from '../types/airMedical';
import AirMedicalResourceForm from '../components/AirMedicalResourceForm';
import { CreateAirMedicalResourceData } from '../types/airMedical';

const AirMedical: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'resources' | 'transports' | 'weather' | 'coordination'>('dashboard');
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<AirMedicalResource | null>(null);
  
  // Data states
  const [resources, setResources] = useState<AirMedicalResource[]>([]);
  const [transports, setTransports] = useState<AirMedicalTransport[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resourcesRes, transportsRes, alertsRes, statsRes, availabilityRes] = await Promise.all([
        fetch('http://localhost:5001/api/air-medical/resources', {
          headers: { 'Authorization': 'Bearer demo-token' }
        }),
        fetch('http://localhost:5001/api/air-medical/transports', {
          headers: { 'Authorization': 'Bearer demo-token' }
        }),
        fetch('http://localhost:5001/api/air-medical/weather/alerts', {
          headers: { 'Authorization': 'Bearer demo-token' }
        }),
        fetch('http://localhost:5001/api/air-medical/statistics', {
          headers: { 'Authorization': 'Bearer demo-token' }
        }),
        fetch('http://localhost:5001/api/air-medical/availability', {
          headers: { 'Authorization': 'Bearer demo-token' }
        })
      ]);

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.data);
      }

      if (transportsRes.ok) {
        const transportsData = await transportsRes.json();
        setTransports(transportsData.data);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setWeatherAlerts(alertsData.data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData.data);
      }

      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json();
        setAvailability(availabilityData.data);
      }

    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching air medical data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceSubmit = async (data: CreateAirMedicalResourceData) => {
    try {
      const response = await fetch('http://localhost:5001/api/air-medical/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const newResource = await response.json();
        setResources(prev => [...prev, newResource.data]);
        setShowResourceForm(false);
        setEditingResource(null);
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create resource');
      }
    } catch (err) {
      setError('Failed to create resource. Please try again.');
      console.error('Error creating resource:', err);
    }
  };

  const handleEditResource = (resource: AirMedicalResource) => {
    setEditingResource(resource);
    setShowResourceForm(true);
  };

  const handleCancelForm = () => {
    setShowResourceForm(false);
    setEditingResource(null);
  };

  const getStatusColor = (status: AirMedicalStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-100';
      case 'IN_USE': return 'text-blue-600 bg-blue-100';
      case 'MAINTENANCE': return 'text-yellow-600 bg-yellow-100';
      case 'WEATHER_DELAYED': return 'text-orange-600 bg-orange-100';
      case 'GROUNDED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-100 border-red-300';
      case 'HIGH': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'LOW': return 'text-blue-600 bg-blue-100 border-blue-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Air Medical Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showResourceForm) {
    return (
      <AirMedicalResourceForm
        onSubmit={handleResourceSubmit}
        onCancel={handleCancelForm}
        initialData={editingResource || undefined}
        isEditing={!!editingResource}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚁 Air Medical Integration</h1>
          <p className="text-gray-600">Manage air medical resources, weather monitoring, and transport coordination</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowResourceForm(true)}
            className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-semibold">Add Resource</div>
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <div className="text-2xl mb-2">🌤️</div>
            <div className="font-semibold">Weather Alerts</div>
          </button>
          <button
            onClick={() => setActiveTab('transports')}
            className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <div className="text-2xl mb-2">✈️</div>
            <div className="font-semibold">Active Transports</div>
          </button>
          <button
            onClick={() => setActiveTab('coordination')}
            className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <div className="text-2xl mb-2">🤝</div>
            <div className="font-semibold">Coordination</div>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'resources', label: 'Resources', icon: '🚁' },
              { id: 'transports', label: 'Transports', icon: '✈️' },
              { id: 'weather', label: 'Weather', icon: '🌤️' },
              { id: 'coordination', label: 'Coordination', icon: '🤝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Air Medical Dashboard</h2>
              
              {/* Statistics Cards */}
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{statistics.totalResources}</div>
                    <div className="text-sm text-blue-600">Total Resources</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{statistics.activeResources}</div>
                    <div className="text-sm text-green-600">Active Resources</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{statistics.totalTransports}</div>
                    <div className="text-sm text-orange-600">Total Transports</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{statistics.weatherDelays}</div>
                    <div className="text-sm text-red-600">Weather Delays</div>
                  </div>
                </div>
              )}

              {/* Resource Availability */}
              {availability && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{availability.available.length}</div>
                    <div className="text-sm text-green-600">Available</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{availability.unavailable.length}</div>
                    <div className="text-sm text-blue-600">In Use</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{availability.weatherRestricted.length}</div>
                    <div className="text-sm text-orange-600">Weather Restricted</div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transports</h3>
                  <div className="space-y-3">
                    {transports.slice(0, 5).map(transport => (
                      <div key={transport.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{transport.airMedicalResource?.identifier || 'Unknown'}</div>
                          <div className="text-sm text-gray-600">{transport.status}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transport.status)}`}>
                          {transport.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Weather Alerts</h3>
                  <div className="space-y-3">
                    {weatherAlerts.slice(0, 5).map(alert => (
                      <div key={alert.id} className={`p-3 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                        <div className="font-medium">{alert.alertType}</div>
                        <div className="text-sm">{alert.location}</div>
                        <div className="text-xs mt-1">{alert.severity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Air Medical Resources</h2>
                <button
                  onClick={() => setShowResourceForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Resource
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(resource => (
                  <div key={resource.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{resource.identifier}</div>
                        <div className="text-sm text-gray-600">{resource.resourceType.replace('_', ' ')}</div>
                      </div>
                      <button
                        onClick={() => handleEditResource(resource)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Base:</span> {resource.baseLocation}</div>
                      <div><span className="font-medium">Crew:</span> {resource.crewSize}</div>
                      <div><span className="font-medium">Range:</span> {resource.maxRange} miles</div>
                      <div><span className="font-medium">Payload:</span> {resource.maxPayload} lbs</div>
                    </div>
                    <div className="mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resource.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {resource.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transports' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Air Medical Transports</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arrival
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weather
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transports.map(transport => (
                      <tr key={transport.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transport.airMedicalResource?.identifier || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transport.airMedicalResource?.resourceType || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transport.status)}`}>
                            {transport.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transport.estimatedDeparture).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transport.estimatedArrival).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transport.weatherDelay ? 'text-orange-600 bg-orange-100' : 'text-green-600 bg-green-100'
                          }`}>
                            {transport.weatherDelay ? 'Delayed' : 'Clear'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Weather Monitoring</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weatherAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-lg font-bold">{alert.alertType.replace('_', ' ')}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <div><span className="font-medium">Location:</span> {alert.location}</div>
                      <div><span className="font-medium">Start:</span> {new Date(alert.startTime).toLocaleString()}</div>
                      <div><span className="font-medium">End:</span> {new Date(alert.endTime).toLocaleString()}</div>
                    </div>
                    <div className="text-sm mb-3">
                      <div className="font-medium">Impact:</div>
                      <div>{alert.impact}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Recommendations:</div>
                      <div>{alert.recommendations}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coordination' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Ground Transport Coordination</h2>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">Coordination Dashboard</h3>
                  <p className="text-blue-600 mb-4">
                    Manage air-to-ground transport coordination and handoffs
                  </p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Coordination
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Coordinations</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  No recent coordinations found
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirMedical;
