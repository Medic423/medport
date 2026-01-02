import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';
import api from '../services/api';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  type: string;
  capabilities: string[];
  region: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  requiresReview: boolean;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

const Hospitals: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('TCC_DEBUG: Hospitals component rendering');
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      console.log('TCC_COMMAND: Fetching healthcare facilities...');
      
      // Fetch from healthcare_locations table (not old hospitals table)
      const response = await api.get('/api/healthcare/locations/all');
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        // Map healthcare_locations to Hospital interface format
        const facilitiesData = response.data.data.map((loc: any) => ({
          id: loc.id,
          name: loc.locationName,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          zipCode: loc.zipCode,
          phone: loc.phone || '',
          email: loc.healthcareUser?.email || '', // Get email from linked healthcareUser
          type: loc.facilityType,
          capabilities: [],
          region: loc.state,
          latitude: loc.latitude,
          longitude: loc.longitude,
          isActive: loc.isActive,
          requiresReview: false,
          createdAt: loc.createdAt,
          updatedAt: loc.updatedAt
        }));
        
        setHospitals(facilitiesData);
        console.log('TCC_COMMAND: Loaded', facilitiesData.length, 'healthcare facilities');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching healthcare facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hospitalId: string) => {
    try {
      const response = await api.put(`/api/tcc/hospitals/${hospitalId}/approve`);
      console.log('Hospital approved:', response.data);
      
      // Refresh the hospitals list
      await fetchHospitals();
    } catch (err) {
      console.error('Error approving hospital:', err);
      setError('Failed to approve hospital');
    }
  };

  const handleReject = async (hospitalId: string) => {
    try {
      const response = await api.put(`/api/tcc/hospitals/${hospitalId}/reject`);
      console.log('Hospital rejected:', response.data);
      
      // Refresh the hospitals list
      await fetchHospitals();
    } catch (err) {
      console.error('Error rejecting hospital:', err);
      setError('Failed to reject hospital');
    }
  };

  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    type: '',
    capabilities: [] as string[],
    region: '',
    latitude: '',
    longitude: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const handleEdit = (hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital) {
      setEditingHospital(hospital);
      setEditFormData({
        name: hospital.name,
        address: hospital.address,
        city: hospital.city,
        state: hospital.state,
        zipCode: hospital.zipCode,
        phone: hospital.phone || '',
        email: hospital.email || '',
        type: hospital.type,
        capabilities: hospital.capabilities,
        region: hospital.region,
        latitude: hospital.latitude?.toString() || '',
        longitude: hospital.longitude?.toString() || '',
        isActive: hospital.isActive ?? true
      });
      setEditError(null);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Geocoding function using backend geocoding API endpoint
  // Backend handles multiple address variations and rate limiting
  const geocodeAddress = async () => {
    if (!editFormData.address || !editFormData.city || !editFormData.state || !editFormData.zipCode) {
      setEditError('Please fill in address, city, state, and ZIP code before looking up coordinates');
      return;
    }

    setGeocoding(true);
    setEditError(null);

    try {
      console.log('TCC_DEBUG: Geocoding hospital address:', {
        address: editFormData.address,
        city: editFormData.city,
        state: editFormData.state,
        zipCode: editFormData.zipCode,
        hospitalName: editFormData.name
      });

      // Add timeout wrapper to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Geocoding request timed out after 30 seconds')), 30000);
      });

      const geocodePromise = api.post('/api/public/geocode', {
        address: editFormData.address,
        city: editFormData.city,
        state: editFormData.state,
        zipCode: editFormData.zipCode,
        facilityName: editFormData.name
      });

      const response = await Promise.race([geocodePromise, timeoutPromise]) as any;

      if (response.data.success) {
        const { latitude, longitude } = response.data.data;
        setEditFormData(prev => ({
          ...prev,
          latitude: parseFloat(latitude.toString()),
          longitude: parseFloat(longitude.toString())
        }));
        setEditError(null);
        console.log('TCC_DEBUG: Coordinates set successfully:', latitude, longitude);
      } else {
        const errorMsg = response.data.error || 'Could not find coordinates for this address. You can still save the hospital and add coordinates manually.';
        setEditError(errorMsg);
      }
    } catch (err: any) {
      console.error('Geocoding error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to lookup coordinates. You can still save the hospital and add coordinates manually.';
      
      if (err.message && err.message.includes('timeout')) {
        errorMessage = 'Geocoding request timed out. You can still save the hospital and add coordinates manually.';
      } else if (err.response?.data?.error) {
        const backendError = err.response.data.error;
        if (backendError.includes('HTTP 429') || backendError.includes('Too Many Requests')) {
          errorMessage = 'Too many geocoding requests. Please try again later or enter coordinates manually.';
        } else if (backendError.includes('HTTP 503') || backendError.includes('Service Unavailable')) {
          errorMessage = 'Geocoding service is temporarily unavailable. Please try again later or enter coordinates manually.';
        } else if (backendError.includes('No results found') || backendError.includes('Could not find coordinates')) {
          errorMessage = 'Could not find coordinates for this address. You can still save the hospital and add coordinates manually.';
        } else {
          errorMessage = backendError + ' You can still save the hospital and add coordinates manually.';
        }
      } else if (err.message) {
        errorMessage = err.message + ' You can still save the hospital and add coordinates manually.';
      }
      
      setEditError(errorMessage);
    } finally {
      setGeocoding(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospital) return;

    setEditLoading(true);
    setEditError(null);

    try {
      // Update healthcareLocation record directly (since the list shows healthcareLocation records)
      // Use admin endpoint since we're in Command dashboard
      console.log('TCC_DEBUG: Updating healthcare location:', editingHospital.id);
      console.log('TCC_DEBUG: Edit form data:', editFormData);
      console.log('TCC_DEBUG: isActive value:', editFormData.isActive, 'type:', typeof editFormData.isActive);
      
      const response = await api.put(`/api/healthcare/locations/${editingHospital.id}/admin`, {
        locationName: editFormData.name,
        address: editFormData.address,
        city: editFormData.city,
        state: editFormData.state,
        zipCode: editFormData.zipCode,
        phone: editFormData.phone || null,
        facilityType: editFormData.type,
        latitude: editFormData.latitude ? parseFloat(editFormData.latitude) : null,
        longitude: editFormData.longitude ? parseFloat(editFormData.longitude) : null,
        isActive: Boolean(editFormData.isActive), // Ensure boolean value
        email: editFormData.email || null // Include email to update healthcareUser
      });
      
      console.log('TCC_DEBUG: Update response:', response.data);

      // Refresh the hospitals list
      await fetchHospitals();
      setEditingHospital(null);
    } catch (err: any) {
      console.error('Error updating hospital:', err);
      setEditError(err.message || 'Failed to update hospital');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingHospital(null);
    setEditError(null);
  };

  const handleDelete = async (hospitalId: string) => {
    if (!window.confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/tcc/hospitals/${hospitalId}`);
      console.log('Hospital deleted:', response.data);
      
      // Refresh the hospitals list
      await fetchHospitals();
    } catch (err) {
      console.error('Error deleting hospital:', err);
      setError('Failed to delete hospital');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading hospitals</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Healthcare Facilities</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage healthcare facilities in the system. {hospitals.length} facilities found.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Healthcare Facilities List</h3>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('TCC_DEBUG: Add Healthcare Facility button clicked');
                console.log('TCC_DEBUG: Current location:', window.location.href);
                console.log('TCC_DEBUG: Target URL:', window.location.origin + '/healthcare-register');
                
                // Navigate to healthcare registration without clearing TCC session
                // Use full URL to escape the dashboard routing context
                const targetUrl = window.location.origin + '/healthcare-register';
                console.log('TCC_DEBUG: Navigating to:', targetUrl);
                window.location.href = targetUrl;
                
                console.log('TCC_DEBUG: Navigation command executed');
              }}
              onMouseDown={() => console.log('TCC_DEBUG: Button mouse down event')}
              onMouseUp={() => console.log('TCC_DEBUG: Button mouse up event')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              style={{ position: 'relative', zIndex: 9999 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Healthcare Facility
            </button>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search Facilities</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, city, or ZIP..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">All States</option>
                {Array.from(new Set(hospitals.map(h => h.state))).sort().map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {(() => {
          // Apply filters
          const filteredHospitals = hospitals.filter(hospital => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
              hospital.name.toLowerCase().includes(searchLower) ||
              hospital.city.toLowerCase().includes(searchLower) ||
              hospital.zipCode.includes(searchTerm) ||
              hospital.address.toLowerCase().includes(searchLower);
            
            // State filter
            const matchesState = !stateFilter || hospital.state === stateFilter;
            
            // Status filter
            const matchesStatus = statusFilter === 'all' || 
              (statusFilter === 'active' && hospital.isActive) ||
              (statusFilter === 'inactive' && !hospital.isActive);
            
            return matchesSearch && matchesState && matchesStatus;
          });
          
          return filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No facilities match your filters</h3>
              <p className="mt-1 text-sm text-gray-500">
                {hospitals.length === 0 
                  ? 'Get started by adding a new hospital.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {(searchTerm || stateFilter || statusFilter !== 'active') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStateFilter('');
                    setStatusFilter('active');
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs text-gray-600">
                  Showing {filteredHospitals.length} of {hospitals.length} facilities
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                        <div className="text-sm text-gray-500">{hospital.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {hospital.city}, {hospital.state} {hospital.zipCode}
                      </div>
                      <div className="text-sm text-gray-500">{hospital.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {hospital.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {hospital.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : hospital.requiresReview ? (
                          <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          hospital.isActive 
                            ? 'text-green-800' 
                            : hospital.requiresReview 
                            ? 'text-yellow-800' 
                            : 'text-red-800'
                        }`}>
                          {hospital.isActive 
                            ? 'Active' 
                            : hospital.requiresReview 
                            ? 'Pending Review' 
                            : 'Inactive'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {hospital.requiresReview && (
                          <>
                            <button
                              onClick={() => handleApprove(hospital.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(hospital.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => navigate(`/dashboard/hospitals/${hospital.id}/settings`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Manage Settings (Pickup Locations, etc.)"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(hospital.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                          title="Edit facility info"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(hospital.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete hospital"
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
            </>
          );
        })()}
      </div>

      {/* Edit Hospital Modal */}
      {editingHospital && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Healthcare Facility</h3>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              {editError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{editError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facility Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={editFormData.city}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={editFormData.state}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Zip Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={editFormData.zipCode}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Urgent Care">Urgent Care</option>
                    <option value="Rehabilitation Facility">Rehabilitation Facility</option>
                    <option value="Doctor's Office">Doctor's Office</option>
                    <option value="Dialysis Center">Dialysis Center</option>
                    <option value="Nursing Home">Nursing Home</option>
                    <option value="Assisted Living">Assisted Living</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Region *</label>
                  <input
                    type="text"
                    name="region"
                    value={editFormData.region}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Active Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={editFormData.isActive ?? true}
                      onChange={handleEditInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-700">
                      Active Facility
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Uncheck to deactivate this facility. Inactive facilities won't appear in trip requests.
                  </p>
                </div>

                {/* Location Coordinates */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-blue-800">Location Coordinates</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Location coordinates are required for agency distance calculations. You can either lookup coordinates automatically or enter them manually.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Geocoding Button */}
                    <div>
                      <button
                        type="button"
                        onClick={geocodeAddress}
                        disabled={geocoding || !editFormData.address || !editFormData.city || !editFormData.state || !editFormData.zipCode}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {geocoding ? (
                          <>
                            <div className="animate-spin -ml-1 mr-3 h-4 w-4 text-white">
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            </div>
                            Looking up...
                          </>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4 mr-2" />
                            Lookup Coordinates
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        Click to automatically find coordinates from the address
                      </p>
                    </div>

                    {/* Manual Coordinate Entry */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          value={editFormData.latitude}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 40.1234"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          value={editFormData.longitude}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., -78.5678"
                        />
                      </div>
                    </div>
                    
                    {editFormData.latitude && editFormData.longitude && (
                      <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">
                        ✓ Coordinates set: {editFormData.latitude}, {editFormData.longitude}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {editLoading ? 'Updating...' : 'Update Facility'}
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

export default Hospitals;
