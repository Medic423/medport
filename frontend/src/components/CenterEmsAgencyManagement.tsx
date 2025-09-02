import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

interface EMSAgency {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: string[];
  operatingHours: string;
  capabilities: string[];
  pricingStructure?: any;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  addedBy?: string;
  addedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AgencyStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  activePercentage: number;
}

interface CenterEmsAgencyManagementProps {
  onNavigate: (page: string) => void;
}

const CenterEmsAgencyManagement: React.FC<CenterEmsAgencyManagementProps> = ({ onNavigate }) => {
  const [agencies, setAgencies] = useState<EMSAgency[]>([]);
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgency, setEditingAgency] = useState<EMSAgency | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceArea: [] as string[],
    operatingHours: '24/7',
    capabilities: [] as string[],
    pricingStructure: {}
  });

  useEffect(() => {
    fetchAgencies();
    fetchStats();
  }, []);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/center/ems-agencies');
      
      if (!response.ok) {
        throw new Error('Failed to fetch agencies');
      }
      
      const result = await response.json();
      if (result.success) {
        setAgencies(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch agencies');
      }
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agencies');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest('/center/ems-agencies/stats/overview');
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleAddAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting form data:', formData);
    
    try {
      const response = await apiRequest('/center/ems-agencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error('Failed to create agency');
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        console.log('Agency created successfully, refreshing data...');
        await fetchAgencies();
        await fetchStats();
        setShowAddForm(false);
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to create agency');
      }
    } catch (err) {
      console.error('Error creating agency:', err);
      setError(err instanceof Error ? err.message : 'Failed to create agency');
    }
  };

  const handleUpdateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAgency) return;
    
    try {
      const response = await apiRequest(`/center/ems-agencies/${editingAgency.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update agency');
      }
      
      const result = await response.json();
      if (result.success) {
        await fetchAgencies();
        await fetchStats();
        setEditingAgency(null);
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to update agency');
      }
    } catch (err) {
      console.error('Error updating agency:', err);
      setError(err instanceof Error ? err.message : 'Failed to update agency');
    }
  };

  const handleDeleteAgency = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agency?')) return;
    
    try {
      const response = await apiRequest(`/center/ems-agencies/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete agency');
      }
      
      const result = await response.json();
      if (result.success) {
        await fetchAgencies();
        await fetchStats();
      } else {
        throw new Error(result.message || 'Failed to delete agency');
      }
    } catch (err) {
      console.error('Error deleting agency:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete agency');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      serviceArea: [],
      operatingHours: '24/7',
      capabilities: [],
      pricingStructure: {}
    });
  };

  const startEdit = (agency: EMSAgency) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      contactName: agency.contactName,
      phone: agency.phone,
      email: agency.email,
      address: agency.address,
      city: agency.city,
      state: agency.state,
      zipCode: agency.zipCode,
      serviceArea: agency.serviceArea,
      operatingHours: agency.operatingHours,
      capabilities: agency.capabilities,
      pricingStructure: agency.pricingStructure || {}
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingAgency(null);
    setShowAddForm(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading EMS agencies...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">EMS Agency Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Agency
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Agencies</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active</h3>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Inactive</h3>
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingAgency ? 'Edit Agency' : 'Add New Agency'}
          </h2>
          
          <form onSubmit={editingAgency ? handleUpdateAgency : handleAddAgency} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agency Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingAgency ? 'Update Agency' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agencies List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">EMS Agencies</h2>
        </div>
        
        {agencies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No EMS agencies found. Add your first agency to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agencies.map((agency) => (
                  <tr key={agency.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agency.name}</div>
                        <div className="text-sm text-gray-500">{agency.operatingHours}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{agency.contactName}</div>
                        <div className="text-sm text-gray-500">{agency.phone}</div>
                        <div className="text-sm text-gray-500">{agency.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {agency.city}, {agency.state} {agency.zipCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        agency.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : agency.status === 'INACTIVE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {agency.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => startEdit(agency)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAgency(agency.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterEmsAgencyManagement;
