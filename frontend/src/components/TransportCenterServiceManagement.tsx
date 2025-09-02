import React, { useState, useEffect } from 'react';
import TransportCenterAddService from './TransportCenterAddService';

interface TransportAgency {
  id: string;
  name: string;
  contactName?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: string | null;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  addedBy?: string;
  addedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  pendingServices: number;
}

const TransportCenterServiceManagement: React.FC = () => {
  const [services, setServices] = useState<TransportAgency[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'add-service' | 'manage-services'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadServices();
    loadStats();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/transport-center/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load services');
      }

      const data = await response.json();
      setServices(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/transport-center/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleAddService = () => {
    setActiveTab('add-service');
    setShowAddForm(true);
  };

  const handleServiceAdded = () => {
    setShowAddForm(false);
    setActiveTab('overview');
    loadServices();
    loadStats();
  };

  const handleToggleService = async (serviceId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = currentStatus === 'ACTIVE' 
        ? `/api/transport-center/services/${serviceId}`
        : `/api/transport-center/services/${serviceId}/enable`;
      
      const response = await fetch(endpoint, {
        method: currentStatus === 'ACTIVE' ? 'DELETE' : 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update service status');
      }

      // Reload services and stats
      loadServices();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadServices();
              loadStats();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transport Center Service Management</h1>
          <p className="mt-2 text-gray-600">
            Manage EMS services available to all hospitals in the network
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('add-service')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'add-service'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Add Service
            </button>
            <button
              onClick={() => setActiveTab('manage-services')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage-services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Services
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">T</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Services</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.totalServices}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">A</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Services</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.activeServices}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">P</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending Services</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.pendingServices}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">I</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Inactive Services</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.inactiveServices}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex space-x-4">
                <button
                  onClick={handleAddService}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Service
                </button>
                <button
                  onClick={() => setActiveTab('manage-services')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.93 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage Services
                </button>
              </div>
            </div>

            {/* Recent Services */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Services</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {services.slice(0, 5).map((service) => (
                  <div key={service.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                        {service.contactName && (
                          <p className="text-sm text-gray-500">Contact: {service.contactName}</p>
                        )}
                        <p className="text-sm text-gray-500">{service.serviceArea || 'No service area specified'}</p>
                        <p className="text-sm text-gray-500">{service.phone} • {service.email}</p>
                        <p className="text-sm text-gray-500">{service.address}, {service.city}, {service.state} {service.zipCode}</p>
                        {service.capabilities && service.capabilities.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">Capabilities: </span>
                            {service.capabilities.map((capability, index) => (
                              <span key={capability} className="text-xs text-gray-600">
                                {capability}{index < service.capabilities.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : service.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(service.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Service Tab */}
        {activeTab === 'add-service' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Add New EMS Service</h3>
            <TransportCenterAddService onServiceAdded={handleServiceAdded} />
          </div>
        )}

        {/* Manage Services Tab */}
        {activeTab === 'manage-services' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Manage Services</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {services.map((service) => (
                <div key={service.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                      {service.contactName && (
                        <p className="text-sm text-gray-500">Contact: {service.contactName}</p>
                      )}
                      <p className="text-sm text-gray-500">{service.serviceArea || 'No service area specified'}</p>
                      <p className="text-sm text-gray-500">{service.phone} • {service.email}</p>
                      <p className="text-sm text-gray-500">{service.address}, {service.city}, {service.state} {service.zipCode}</p>
                      {service.capabilities && service.capabilities.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Capabilities: </span>
                          {service.capabilities.map((capability, index) => (
                            <span key={capability} className="text-xs text-gray-600">
                              {capability}{index < service.capabilities.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Added: {new Date(service.createdAt).toLocaleDateString()}
                        {service.addedByUser && (
                          <span> by {service.addedByUser.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : service.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.status}
                      </span>
                      <button
                        onClick={() => handleToggleService(service.id, service.status)}
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          service.status === 'ACTIVE'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {service.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportCenterServiceManagement;
