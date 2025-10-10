import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
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
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/tcc/hospitals');
      setHospitals(response.data.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching hospitals:', err);
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
        longitude: hospital.longitude?.toString() || ''
      });
      setEditError(null);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Geocoding function using OpenStreetMap Nominatim API (free)
  const geocodeAddress = async () => {
    if (!editFormData.address || !editFormData.city || !editFormData.state || !editFormData.zipCode) {
      setEditError('Please fill in address, city, state, and ZIP code before looking up coordinates');
      return;
    }

    setGeocoding(true);
    setEditError(null);

    try {
      const fullAddress = `${editFormData.address}, ${editFormData.city}, ${editFormData.state} ${editFormData.zipCode}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setEditFormData(prev => ({
          ...prev,
          latitude: result.lat,
          longitude: result.lon
        }));
        setEditError(null);
      } else {
        setEditError('Address not found. Please enter coordinates manually.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setEditError('Failed to lookup coordinates. Please enter them manually.');
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
      const response = await api.put(`/api/tcc/hospitals/${editingHospital.id}`, editFormData);

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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Healthcare Facilities List</h3>
            <button 
              onClick={() => {
                // Clear the current session and redirect to main page for registration
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to main page with healthcare registration parameter
                window.location.href = '/?register=healthcare';
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Healthcare Facility
            </button>
          </div>
        </div>

        {hospitals.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hospitals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new hospital.
            </p>
          </div>
        ) : (
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
                {hospitals.map((hospital) => (
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
                          onClick={() => handleEdit(hospital.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit hospital"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(hospital.id)}
                          className="text-red-600 hover:text-red-900"
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
        )}
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
