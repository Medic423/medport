import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Plus, Edit, Trash2, Star, X, Check } from 'lucide-react';
import api from '../services/api';

interface HealthcareLocation {
  id: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  facilityType: string;
  isActive: boolean;
  isPrimary: boolean;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  facilityName?: string;
  manageMultipleLocations?: boolean;
}

interface HealthcareLocationSettingsProps {
  user: User;
}

const HealthcareLocationSettings: React.FC<HealthcareLocationSettingsProps> = ({ user }) => {
  const [locations, setLocations] = useState<HealthcareLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  console.log('MULTI_LOC: HealthcareLocationSettings rendered with user:', user);
  console.log('MULTI_LOC: User manageMultipleLocations:', user.manageMultipleLocations);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<HealthcareLocation | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    locationName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    facilityType: 'Hospital'
  });

  // GPS lookup state
  const [gpsLookupStatus, setGpsLookupStatus] = useState<'idle' | 'looking' | 'found' | 'error'>('idle');
  const [gpsCoordinates, setGpsCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const facilityTypes = [
    'Hospital',
    'Clinic',
    "Doctor's Office",
    'Urgent Care',
    'Other'
  ];

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('MULTI_LOC: Loading locations for user');
      
      const response = await api.get('/api/healthcare/locations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        setLocations(response.data.data);
        console.log('MULTI_LOC: Loaded', response.data.data.length, 'locations');
      } else {
        console.error('MULTI_LOC: Invalid response format:', response.data);
        setLocations([]);
      }
    } catch (error: any) {
      console.error('MULTI_LOC: Error loading locations:', error);
      setError(error.response?.data?.error || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData({
      locationName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      facilityType: 'Hospital'
    });
    setGpsLookupStatus('idle');
    setGpsCoordinates(null);
    setShowModal(true);
  };

  const handleEditLocation = (location: HealthcareLocation) => {
    setEditingLocation(location);
    setFormData({
      locationName: location.locationName,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      phone: location.phone || '',
      facilityType: location.facilityType
    });
    // Set GPS coordinates if they exist
    if (location.latitude && location.longitude) {
      setGpsCoordinates({
        latitude: location.latitude,
        longitude: location.longitude
      });
      setGpsLookupStatus('found');
    } else {
      setGpsCoordinates(null);
      setGpsLookupStatus('idle');
    }
    setShowModal(true);
  };

  // GPS lookup function using backend geocoding API endpoint
  // Backend handles multiple address variations and rate limiting
  const geocodeAddress = async (address: string, city: string, state: string, zipCode: string, locationName?: string): Promise<{latitude: number, longitude: number} | null> => {
    try {
      setGpsLookupStatus('looking');
      console.log('MULTI_LOC: Geocoding address:', { address, city, state, zipCode, locationName });
      
      // Use backend geocoding endpoint
      const response = await api.post('/api/public/geocode', {
        address,
        city,
        state,
        zipCode,
        facilityName: locationName
      });
      
      if (response.data.success) {
        const { latitude, longitude } = response.data.data;
        const coordinates = {
          latitude,
          longitude
        };
        console.log('MULTI_LOC: Geocoded coordinates:', coordinates);
        setGpsCoordinates(coordinates);
        setGpsLookupStatus('found');
        return coordinates;
      } else {
        console.warn('MULTI_LOC: No coordinates found for address:', { address, city, state, zipCode });
        setGpsLookupStatus('error');
        return null;
      }
    } catch (error) {
      console.error('MULTI_LOC: Geocoding error:', error);
      setGpsLookupStatus('error');
      return null;
    }
  };

  // Manual GPS lookup function
  const handleGpsLookup = async () => {
    if (!formData.address.trim() || !formData.city.trim() || !formData.state || !formData.zipCode.trim()) {
      setError('Please fill in address, city, state, and ZIP code before looking up GPS coordinates');
      return;
    }

    await geocodeAddress(
      formData.address.trim(),
      formData.city.trim(),
      formData.state,
      formData.zipCode.trim()
    );
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationName.trim() || !formData.address.trim() || !formData.city.trim() || !formData.state || !formData.zipCode.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Get GPS coordinates (use stored ones if available, otherwise lookup)
      let coordinates = gpsCoordinates;
      if (!coordinates) {
        coordinates = await geocodeAddress(
          formData.address.trim(),
          formData.city.trim(),
          formData.state,
          formData.zipCode.trim(),
          formData.locationName.trim() // Pass location name for better geocoding
        );
      }

      const data = {
        locationName: formData.locationName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        zipCode: formData.zipCode.trim(),
        phone: formData.phone.trim() || null,
        facilityType: formData.facilityType,
        isPrimary: locations.length === 0, // First location is automatically primary
        // ✅ NEW: GPS coordinates
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null
      };

      console.log('MULTI_LOC: Saving location:', data);

      let response;
      if (editingLocation) {
        response = await api.put(`/api/healthcare/locations/${editingLocation.id}`, data, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await api.post('/api/healthcare/locations', data, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (response.data) {
        setSuccess(editingLocation ? 'Location updated successfully' : 'Location added successfully');
        setShowModal(false);
        loadLocations();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('MULTI_LOC: Error saving location:', error);
      setError(error.response?.data?.error || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      console.log('MULTI_LOC: Deleting location:', id);

      await api.delete(`/api/healthcare/locations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Location deleted successfully');
      loadLocations();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('MULTI_LOC: Error deleting location:', error);
      setError(error.response?.data?.error || 'Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      console.log('MULTI_LOC: Setting primary location:', id);

      await api.put(`/api/healthcare/locations/${id}/set-primary`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Primary location updated');
      loadLocations();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('MULTI_LOC: Error setting primary location:', error);
      setError(error.response?.data?.error || 'Failed to set primary location');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if user has multi-location enabled
  if (!user.manageMultipleLocations) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Multi-location management not enabled</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your account is not configured to manage multiple locations.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Contact support if you need to manage multiple healthcare facilities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Locations</h2>
        <p className="text-gray-600">
          Manage the hospitals, clinics, and facilities under your organization
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-start">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Location Button */}
      <div className="mb-6">
        <button
          onClick={handleAddLocation}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </button>
      </div>

      {/* Locations List */}
      {loading && locations.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading locations...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No locations yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first location.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(Array.isArray(locations) ? locations : []).map((location) => (
            <div 
              key={location.id}
              className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {location.locationName}
                  </h3>
                  {location.isPrimary && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </span>
                  )}
                  {!location.isActive && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{location.address}, {location.city}, {location.state} {location.zipCode}</span>
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Type: {location.facilityType}</span>
                    {location.phone && <span>Phone: {location.phone}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {!location.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(location.id)}
                    disabled={loading}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleEditLocation(location)}
                  disabled={loading}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Edit location"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteLocation(location.id)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete location"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveLocation} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    id="locationName"
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Penn Highlands Tyrone"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="facilityType" className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Type *
                  </label>
                  <select
                    id="facilityType"
                    name="facilityType"
                    value={formData.facilityType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    {facilityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 187 Hospital Drive"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="ZIP"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* GPS Lookup Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">GPS Coordinates</h4>
                    <button
                      type="button"
                      onClick={handleGpsLookup}
                      disabled={gpsLookupStatus === 'looking' || !formData.address.trim() || !formData.city.trim() || !formData.state || !formData.zipCode.trim()}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {gpsLookupStatus === 'looking' ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                          Looking up...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3 mr-1" />
                          Lookup GPS
                        </>
                      )}
                    </button>
                  </div>
                  
                  {gpsLookupStatus === 'found' && gpsCoordinates && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-800">
                          GPS coordinates found: {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {gpsLookupStatus === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center">
                        <X className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-800">
                          GPS lookup failed. Coordinates will be saved as null.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {gpsLookupStatus === 'idle' && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-600">
                        Fill in the address fields above and click "Lookup GPS" to automatically find coordinates.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (editingLocation ? 'Update Location' : 'Add Location')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="font-semibold text-blue-900 mb-2">How to use</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add all hospitals, clinics, and facilities your organization manages</li>
          <li>• The first location you add will automatically be set as primary</li>
          <li>• When creating transport requests, you'll select which location needs transport</li>
          <li>• You can set a different location as primary at any time by clicking the star icon</li>
          <li>• Edit or delete locations as needed (cannot delete if trips exist)</li>
        </ul>
      </div>
    </div>
  );
};

export default HealthcareLocationSettings;

