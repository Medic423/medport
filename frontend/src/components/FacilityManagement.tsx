import React, { useState, useEffect } from 'react';
import { Facility, FacilityType } from '../types/transport';

interface FacilityManagementProps {
  onNavigate?: (page: string) => void;
}

const FacilityManagement: React.FC<FacilityManagementProps> = ({ onNavigate }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newFacility, setNewFacility] = useState({
    name: '',
    type: FacilityType.HOSPITAL,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadFacilities();
  }, []);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Required fields
    if (!newFacility.name.trim()) {
      errors.name = 'Facility name is required';
    }

    if (!newFacility.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!newFacility.city.trim()) {
      errors.city = 'City is required';
    }

    if (!newFacility.state.trim()) {
      errors.state = 'State is required';
    }

    if (!newFacility.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    }

    // Format validation
    if (newFacility.zipCode && !/^\d{5}(-\d{4})?$/.test(newFacility.zipCode)) {
      errors.zipCode = 'ZIP code must be in format 12345 or 12345-6789';
    }

    if (newFacility.phone && !/^\(\d{3}\)\s\d{3}-\d{4}$/.test(newFacility.phone)) {
      errors.phone = 'Phone must be in format (555) 123-4567';
    }

    if (newFacility.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newFacility.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const demoMode = localStorage.getItem('demoMode');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (demoMode === 'true') {
        headers['Authorization'] = 'Bearer demo-token';
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/facilities', {
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to load facilities: ${response.statusText}`);
      }

      const result = await response.json();
      setFacilities(result.data || []);
    } catch (error) {
      console.error('Error loading facilities:', error);
      setError('Error loading facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setValidationErrors({});
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers,
        body: JSON.stringify(newFacility)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add facility: ${response.statusText}`);
      }

      await loadFacilities();
      setShowAddForm(false);
      setNewFacility({
        name: '',
        type: FacilityType.HOSPITAL,
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: ''
      });
      
      setSuccess(`Facility "${newFacility.name}" has been added successfully!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error adding facility:', error);
      setError(error instanceof Error ? error.message : 'Error adding facility');
    }
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setNewFacility({
      name: facility.name,
      type: facility.type,
      address: facility.address,
      city: facility.city,
      state: facility.state,
      zipCode: facility.zipCode,
      phone: facility.phone || '',
      email: facility.email || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;

    // Validate form before submitting
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setValidationErrors({});
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/facilities/${editingFacility.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(newFacility)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update facility: ${response.statusText}`);
      }

      await loadFacilities();
      setShowAddForm(false);
      setEditingFacility(null);
      setNewFacility({
        name: '',
        type: FacilityType.HOSPITAL,
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: ''
      });
      
      setSuccess(`Facility "${newFacility.name}" has been updated successfully!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error updating facility:', error);
      setError(error instanceof Error ? error.message : 'Error updating facility');
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;

    try {
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/facilities/${facilityId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to delete facility: ${response.statusText}`);
      }

      await loadFacilities();
      setSuccess('Facility has been deleted successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error deleting facility:', error);
      setError('Error deleting facility');
    }
  };

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading facilities...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Facility Management</h2>
        <p className="text-gray-600">
          Manage the facilities that appear in your trip request dropdowns
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingFacility(null);
                setNewFacility({
                  name: '',
                  type: FacilityType.HOSPITAL,
                  address: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  phone: '',
                  email: ''
                });
              }}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Facility
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingFacility ? 'Edit Facility' : 'Add New Facility'}
            </h3>
            <form onSubmit={editingFacility ? handleUpdateFacility : handleAddFacility} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFacility.name}
                    onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.name 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., City General Hospital"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Type *
                  </label>
                  <select
                    value={newFacility.type}
                    onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value as FacilityType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={FacilityType.HOSPITAL}>Hospital</option>
                    <option value={FacilityType.NURSING_HOME}>Nursing Home</option>
                    <option value={FacilityType.CANCER_CENTER}>Cancer Center</option>
                    <option value={FacilityType.REHAB_FACILITY}>Rehab Facility</option>
                    <option value={FacilityType.URGENT_CARE}>Urgent Care</option>
                    <option value={FacilityType.SPECIALTY_CLINIC}>Specialty Clinic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFacility.address}
                    onChange={(e) => setNewFacility({ ...newFacility, address: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.address 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {validationErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFacility.city}
                    onChange={(e) => setNewFacility({ ...newFacility, city: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.city 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="City"
                  />
                  {validationErrors.city && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFacility.state}
                    onChange={(e) => setNewFacility({ ...newFacility, state: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.state 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="State"
                  />
                  {validationErrors.state && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFacility.zipCode}
                    onChange={(e) => setNewFacility({ ...newFacility, zipCode: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.zipCode 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="12345"
                  />
                  {validationErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.zipCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newFacility.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setNewFacility({ ...newFacility, phone: formatted });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.phone 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="(555) 123-4567"
                    maxLength={14}
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newFacility.email}
                    onChange={(e) => setNewFacility({ ...newFacility, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.email 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="contact@facility.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingFacility(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editingFacility ? 'Update Facility' : 'Add Facility'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFacilities.map((facility) => (
                <tr key={facility.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {facility.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{facility.city}, {facility.state}</div>
                    <div className="text-sm text-gray-500">{facility.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{facility.phone || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{facility.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditFacility(facility)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFacility(facility.id)}
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

        {filteredFacilities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'No facilities match your search.' : 'No facilities found. Add your first facility to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityManagement;
