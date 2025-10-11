import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MapPin,
  Settings as SettingsIcon,
  Phone,
  Mail,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

interface PickupLocation {
  id: string;
  hospitalId: string;
  name: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  floor?: string;
  room?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hospital?: {
    id: string;
    name: string;
  };
}

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
}

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'USER';
}

interface TCCHospitalSettingsProps {
  user: User;
}

const TCCHospitalSettings: React.FC<TCCHospitalSettingsProps> = ({ user }) => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  
  // Facility information
  const [facility, setFacility] = useState<HealthcareLocation | null>(null);
  const [loadingFacility, setLoadingFacility] = useState(true);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'pickup-locations' | 'dropdowns' | 'contact'>('pickup-locations');
  
  // Pickup locations state
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [pickupSuccess, setPickupSuccess] = useState<string | null>(null);
  
  // Pickup location form states
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [editingPickupLocation, setEditingPickupLocation] = useState<PickupLocation | null>(null);
  const [pickupFormData, setPickupFormData] = useState({
    name: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    floor: '',
    room: ''
  });

  // Load facility information
  useEffect(() => {
    if (facilityId) {
      loadFacility();
      loadPickupLocations();
    }
  }, [facilityId]);

  const loadFacility = async () => {
    try {
      setLoadingFacility(true);
      console.log('TCC_COMMAND: Loading facility:', facilityId);
      
      const response = await api.get(`/api/healthcare/locations/all`);
      if (response.data?.success) {
        const facilityData = response.data.data.find((f: HealthcareLocation) => f.id === facilityId);
        if (facilityData) {
          setFacility(facilityData);
          console.log('TCC_COMMAND: Facility loaded:', facilityData);
        } else {
          setPickupError('Facility not found');
        }
      }
    } catch (error) {
      console.error('TCC_COMMAND: Error loading facility:', error);
      setPickupError('Failed to load facility information');
    } finally {
      setLoadingFacility(false);
    }
  };

  const loadPickupLocations = async () => {
    try {
      setPickupLoading(true);
      setPickupError(null);
      console.log('TCC_COMMAND: Loading pickup locations for facility:', facilityId);
      
      const response = await api.get(`/api/pickup-locations`, {
        params: { hospitalId: facilityId }
      });
      
      console.log('TCC_COMMAND: Pickup locations response:', response.data);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        setPickupLocations(response.data.data);
        console.log('TCC_COMMAND: Loaded', response.data.data.length, 'pickup locations');
      } else {
        setPickupLocations([]);
      }
    } catch (error: any) {
      console.error('TCC_COMMAND: Error loading pickup locations:', error);
      setPickupError(error.response?.data?.error || 'Failed to load pickup locations');
      setPickupLocations([]);
    } finally {
      setPickupLoading(false);
    }
  };

  const handlePickupFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPickupFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPickupLocation = () => {
    setEditingPickupLocation(null);
    setPickupFormData({
      name: '',
      description: '',
      contactPhone: '',
      contactEmail: '',
      floor: '',
      room: ''
    });
    setShowPickupForm(true);
    setPickupError(null);
    setPickupSuccess(null);
  };

  const handleEditPickupLocation = (location: PickupLocation) => {
    setEditingPickupLocation(location);
    setPickupFormData({
      name: location.name,
      description: location.description || '',
      contactPhone: location.contactPhone || '',
      contactEmail: location.contactEmail || '',
      floor: location.floor || '',
      room: location.room || ''
    });
    setShowPickupForm(true);
    setPickupError(null);
    setPickupSuccess(null);
  };

  const handleSavePickupLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pickupFormData.name.trim()) {
      setPickupError('Location name is required');
      return;
    }

    try {
      setPickupLoading(true);
      setPickupError(null);
      
      console.log('TCC_COMMAND: Saving pickup location for facility:', facilityId);

      if (editingPickupLocation) {
        // Update existing
        await api.put(`/api/pickup-locations/${editingPickupLocation.id}`, {
          ...pickupFormData,
          hospitalId: facilityId
        });
        setPickupSuccess('Pickup location updated successfully');
        console.log('TCC_COMMAND: Pickup location updated');
      } else {
        // Create new
        await api.post('/api/pickup-locations', {
          ...pickupFormData,
          hospitalId: facilityId,
          isActive: true
        });
        setPickupSuccess('Pickup location created successfully');
        console.log('TCC_COMMAND: Pickup location created');
      }
      
      setShowPickupForm(false);
      setEditingPickupLocation(null);
      await loadPickupLocations();
      
      setTimeout(() => setPickupSuccess(null), 3000);
    } catch (error: any) {
      console.error('TCC_COMMAND: Error saving pickup location:', error);
      setPickupError(error.response?.data?.error || 'Failed to save pickup location');
    } finally {
      setPickupLoading(false);
    }
  };

  const handleDeletePickupLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this pickup location?')) {
      return;
    }

    try {
      setPickupLoading(true);
      setPickupError(null);
      
      console.log('TCC_COMMAND: Deleting pickup location:', locationId);
      await api.delete(`/api/pickup-locations/${locationId}`);
      
      setPickupSuccess('Pickup location deleted successfully');
      await loadPickupLocations();
      
      setTimeout(() => setPickupSuccess(null), 3000);
    } catch (error: any) {
      console.error('TCC_COMMAND: Error deleting pickup location:', error);
      setPickupError(error.response?.data?.error || 'Failed to delete pickup location');
    } finally {
      setPickupLoading(false);
    }
  };

  if (loadingFacility) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading facility...</p>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">Facility not found</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/hospitals')}
          className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Back to Facilities
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* TCC Command Banner */}
      <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">TCC Command Center - Facility Settings</h2>
              <p className="text-sm text-gray-700 mt-1">
                Managing: <span className="font-semibold">{facility.locationName}</span>
              </p>
              <p className="text-xs text-gray-600">
                {facility.city}, {facility.state} {facility.zipCode} • {facility.facilityType}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/hospitals')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to List
          </button>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pickup-locations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'pickup-locations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Pickup Locations
              <span className="ml-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                Required
              </span>
            </button>
            <button
              onClick={() => setActiveTab('dropdowns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'dropdowns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Dropdown Options
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Phone className="h-4 w-4" />
              Main Contact
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Success/Error Messages */}
          {pickupSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{pickupSuccess}</p>
            </div>
          )}

          {pickupError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800">{pickupError}</p>
                <button 
                  onClick={() => setPickupError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Pickup Locations Tab */}
          {activeTab === 'pickup-locations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Pickup Locations</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage pickup locations within {facility.locationName} for transport requests
                  </p>
                </div>
                <button
                  onClick={handleAddPickupLocation}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pickup Location
                </button>
              </div>

              {/* Pickup Locations List */}
              {pickupLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading pickup locations...</p>
                </div>
              ) : pickupLocations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pickup locations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add pickup locations to enable trip creation for this facility
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleAddPickupLocation}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Pickup Location
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pickupLocations.map(location => (
                    <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                            <h4 className="text-base font-medium text-gray-900">{location.name}</h4>
                            {location.isActive && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Active</span>
                            )}
                          </div>
                          {location.description && (
                            <p className="mt-1 text-sm text-gray-600 ml-7">{location.description}</p>
                          )}
                          <div className="mt-2 ml-7 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500">
                            {location.floor && (
                              <div>
                                <span className="font-medium">Floor:</span> {location.floor}
                              </div>
                            )}
                            {location.room && (
                              <div>
                                <span className="font-medium">Room:</span> {location.room}
                              </div>
                            )}
                            {location.contactPhone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {location.contactPhone}
                              </div>
                            )}
                            {location.contactEmail && (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {location.contactEmail}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditPickupLocation(location)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePickupLocation(location.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Pickup Location Form Modal */}
              {showPickupForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingPickupLocation ? 'Edit Pickup Location' : 'Add Pickup Location'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        For: {facility.locationName}
                      </p>
                    </div>
                    
                    <form onSubmit={handleSavePickupLocation} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={pickupFormData.name}
                          onChange={handlePickupFormChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Emergency Department, ICU, Main Entrance"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={pickupFormData.description}
                          onChange={handlePickupFormChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Additional details about this location..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Floor
                          </label>
                          <input
                            type="text"
                            name="floor"
                            value={pickupFormData.floor}
                            onChange={handlePickupFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 3, Ground"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room
                          </label>
                          <input
                            type="text"
                            name="room"
                            value={pickupFormData.room}
                            onChange={handlePickupFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 301, ED-Main"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            name="contactPhone"
                            value={pickupFormData.contactPhone}
                            onChange={handlePickupFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="(814) 555-1234"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            name="contactEmail"
                            value={pickupFormData.contactEmail}
                            onChange={handlePickupFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="dept@hospital.com"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPickupForm(false);
                            setEditingPickupLocation(null);
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={pickupLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {pickupLoading ? 'Saving...' : editingPickupLocation ? 'Update Location' : 'Create Location'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dropdown Options Tab */}
          {activeTab === 'dropdowns' && (
            <div className="text-center py-12">
              <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Dropdown Options Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Coming soon: Manage dropdown options for this facility
              </p>
            </div>
          )}

          {/* Main Contact Tab */}
          {activeTab === 'contact' && (
            <div className="text-center py-12">
              <Phone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Main Contact Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Coming soon: Manage main contact for this facility
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TCCHospitalSettings;

