import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Activity,
  Filter,
  Search,
  RefreshCw,
  Eye,
  MoreVertical
} from 'lucide-react';
import api from '../services/api';
import {
  Unit,
  UnitFormData,
  UnitStatus,
  UnitType,
  UnitCapability,
  UnitAnalytics,
  UNIT_TYPE_LABELS,
  UNIT_STATUS_LABELS,
  UNIT_STATUS_COLORS,
  UNIT_CAPABILITY_LABELS
} from '../types/units';

interface UnitsManagementProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
  };
  acceptedTrips?: any[];
}

const UnitsManagement: React.FC<UnitsManagementProps> = ({ user, acceptedTrips = [] }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [analytics, setAnalytics] = useState<UnitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<UnitType | 'ALL'>('ALL');

  // Form state
  const [formData, setFormData] = useState<UnitFormData>({
    unitNumber: '',
    type: 'AMBULANCE',
    capabilities: ['BLS'],
    customCapabilities: [],
    isActive: true
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch units data
  const fetchUnits = async () => {
    try {
      console.log('🔍 UnitsManagement: fetchUnits called');
      setLoading(true);
      const api = (await import('../services/api')).default;
      const response = await api.get('/api/units', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
      const data = response.data;
      console.log('🔍 UnitsManagement: API response:', data);
      if (data.success) {
        console.log('🔍 UnitsManagement: Units count:', data.data?.length || 0);
        setUnits(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch units');
      }
    } catch (error: any) {
      console.error('Error fetching units:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/units/analytics', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
      const data = response.data;
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 UnitsManagement: useEffect called, component mounted');
    fetchUnits();
    fetchAnalytics();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      console.log('TCC_DEBUG: Creating unit with data:', formData);
      
      // Use the real API endpoint
      const response = await api.post('/api/units', formData);
      
      if (response.data.success) {
        const newUnit = response.data.data;
        
        // Add to local state
        setUnits(prev => [...prev, newUnit]);
        
        // Close modals and reset form
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedUnit(null);
        resetForm();
        
        // Show success message
        console.log('TCC_DEBUG: Unit created successfully:', newUnit);
      } else {
        throw new Error(response.data.error || 'Failed to create unit');
      }
      
    } catch (error: any) {
      console.error('Error saving unit:', error);
      setFormError(error.response?.data?.error || error.message || 'Failed to create unit');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle unit deletion
  const handleDelete = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) {
      return;
    }

    try {
      const api = (await import('../services/api')).default;
      const response = await api.delete(`/api/units/${unitId}`);
      const data = response.data;
      if (data.success) {
        await fetchUnits();
        await fetchAnalytics();
      } else {
        throw new Error(data.error || 'Failed to delete unit');
      }
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      setError(error.message);
    }
  };

  // Handle duty status toggle
  const handleToggleDuty = async (unitId: string, currentStatus: boolean) => {
    try {
      console.log('🔍 UnitsManagement: Toggling duty status for unit:', unitId, 'from', currentStatus, 'to', !currentStatus);
      
      const api = (await import('../services/api')).default;
      const response = await api.patch(`/api/units/${unitId}/duty`, {
        isActive: !currentStatus
      });
      
      const data = response.data;
      if (data.success) {
        // Update local state immediately for better UX
        setUnits(prev => prev.map(unit => 
          unit.id === unitId 
            ? { ...unit, isActive: !currentStatus }
            : unit
        ));
        
        // Refresh analytics to update counts
        await fetchAnalytics();
        
        console.log('🔍 UnitsManagement: Duty status updated successfully');
      } else {
        throw new Error(data.error || 'Failed to update duty status');
      }
    } catch (error: any) {
      console.error('Error updating duty status:', error);
      setError(error.message || 'Failed to update duty status');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (unitId: string, newStatus: UnitStatus) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${API_BASE_URL}/api/units/${unitId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchUnits();
        await fetchAnalytics();
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      unitNumber: '',
      type: 'AMBULANCE',
      capabilities: ['BLS'],
      customCapabilities: [],
      isActive: true
    });
    setFormError(null);
  };

  // Open edit modal
  const openEditModal = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData({
      unitNumber: unit.unitNumber,
      type: unit.type,
      capabilities: unit.capabilities,
      customCapabilities: [],
      isActive: unit.isActive
    });
    setShowEditModal(true);
  };

  // Filter units
  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         UNIT_TYPE_LABELS[unit.type].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || unit.currentStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || unit.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status badge
  const getStatusBadge = (status: UnitStatus) => {
    const colors = UNIT_STATUS_COLORS[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
        {UNIT_STATUS_LABELS[status]}
      </span>
    );
  };

  // Get capability badges
  const getCapabilityBadges = (capabilities: UnitCapability[]) => {
    return capabilities.map(cap => (
      <span key={cap} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1">
        {UNIT_CAPABILITY_LABELS[cap]}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Loading units...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Units Management</h2>
          <p className="text-gray-600">Manage your EMS units and track their status</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Unit</span>
        </button>
      </div>


      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Units</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalUnits}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.availableUnits}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Trips</p>
                <p className="text-2xl font-semibold text-gray-900">{acceptedTrips.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UnitStatus | 'ALL')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">All Statuses</option>
              {Object.entries(UNIT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as UnitType | 'ALL')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">All Types</option>
              {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => {
              fetchUnits();
              fetchAnalytics();
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Units Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Units ({filteredUnits.length})
          </h3>
          
          {filteredUnits.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No units found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {units.length === 0 
                  ? "Get started by creating your first unit."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {units.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Unit
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      On Duty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capabilities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {unit.unitNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {unit.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {UNIT_TYPE_LABELS[unit.type]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(unit.currentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={unit.isActive}
                            onChange={() => handleToggleDuty(unit.id, unit.isActive)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {unit.isActive ? 'On Duty' : 'Off Duty'}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap">
                          {getCapabilityBadges(unit.capabilities)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{unit.totalTripsCompleted} trips</div>
                          {unit.currentStatus === 'COMMITTED' && (
                            <div className="text-orange-600">Active now</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(unit)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(unit.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedUnit ? 'Edit Unit' : 'Create New Unit'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., A-101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as UnitType })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capabilities
                  </label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(UNIT_CAPABILITY_LABELS).map(([value, label]) => (
                      <label key={value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.capabilities.includes(value as UnitCapability)}
                          onChange={(e) => {
                            const capability = value as UnitCapability;
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                capabilities: [...formData.capabilities, capability]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                capabilities: formData.capabilities.filter(c => c !== capability)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>


                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">On Duty</label>
                  <p className="ml-2 text-xs text-gray-500">Check if unit is currently on duty</p>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedUnit(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : (selectedUnit ? 'Update' : 'Create')}
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

export default UnitsManagement;
