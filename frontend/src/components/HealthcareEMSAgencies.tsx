import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Star,
  StarOff
} from 'lucide-react';
import api, { healthcareAgenciesAPI } from '../services/api';

interface Agency {
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
  operatingHours: any;
  capabilities: string[];
  pricingStructure: any;
  isActive: boolean;
  status: string;
  addedBy: string;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
  isPreferred?: boolean;
}

interface HealthcareEMSAgenciesProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
}

const HealthcareEMSAgencies: React.FC<HealthcareEMSAgenciesProps> = ({ user }) => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingPreferred, setTogglingPreferred] = useState<string | null>(null);
  
  // Capabilities list
  const capabilitiesList = [
    'BLS',
    'ALS',
    'CCT',
    'Critical Care',
    'Neonatal',
    'Pediatric',
    'Bariatric',
    'Isolation'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  
  // Add modal state
  const [addFormData, setAddFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    capabilities: [] as string[],
    isPreferred: false,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  
  // Edit modal state
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    capabilities: [] as string[],
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const response = await healthcareAgenciesAPI.getAll(params);
      if (response.data.success) {
        const transformedAgencies = response.data.data.map((agency: any) => ({
          ...agency,
          contactName: agency.contactName || 'N/A',
          phone: agency.phone || 'N/A',
          email: agency.email || 'N/A',
          address: agency.address || 'N/A',
          city: agency.city || 'N/A',
          state: agency.state || 'N/A',
          zipCode: agency.zipCode || 'N/A',
          capabilities: agency.capabilities || [],
          serviceArea: agency.serviceArea || [],
          operatingHours: agency.operatingHours || null,
          pricingStructure: agency.pricingStructure || null,
          status: agency.status || 'ACTIVE',
          isPreferred: agency.isPreferred || false,
        }));
        setAgencies(transformedAgencies);
      } else {
        setError('Failed to load agencies');
      }
    } catch (err) {
      console.error('Error loading agencies:', err);
      setError('Failed to load agencies');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setAddFormData({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      latitude: '',
      longitude: '',
      capabilities: [],
      isPreferred: false,
    });
    setAddError(null);
    setShowAddModal(true);
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCapabilityChange = (capability: string) => {
    setAddFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  // Geocoding function using backend geocoding API endpoint
  // Backend handles multiple address variations and rate limiting
  const geocodeAddress = async () => {
    if (!addFormData.address || !addFormData.city || !addFormData.state || !addFormData.zipCode) {
      setAddError('Please fill in address, city, state, and ZIP code before looking up coordinates');
      return;
    }

    setGeocoding(true);
    setAddError(null);

    console.log('TCC_DEBUG: Geocoding healthcare agency address:', {
      address: addFormData.address,
      city: addFormData.city,
      state: addFormData.state,
      zipCode: addFormData.zipCode,
      agencyName: addFormData.name
    });

    try {
      // Add timeout wrapper to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Geocoding request timed out after 30 seconds')), 30000);
      });

      const geocodePromise = api.post('/api/public/geocode', {
        address: addFormData.address,
        city: addFormData.city,
        state: addFormData.state,
        zipCode: addFormData.zipCode,
        facilityName: addFormData.name
      });

      const response = await Promise.race([geocodePromise, timeoutPromise]) as any;

      if (response.data.success) {
        const { latitude, longitude } = response.data.data;
        setAddFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        setAddError(null);
        console.log('TCC_DEBUG: Coordinates set successfully:', latitude, longitude);
      } else {
        const errorMsg = response.data.error || 'Could not find coordinates for this address. You can still save the agency and add coordinates manually.';
        setAddError(errorMsg);
      }
    } catch (err: any) {
      console.error('Geocoding error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to lookup coordinates. You can still save the agency and add coordinates manually.';
      
      if (err.message && err.message.includes('timeout')) {
        errorMessage = 'Geocoding request timed out. You can still save the agency and add coordinates manually.';
      } else if (err.response?.data?.error) {
        const backendError = err.response.data.error;
        if (backendError.includes('HTTP 429') || backendError.includes('Too Many Requests')) {
          errorMessage = 'Too many geocoding requests. Please try again later or enter coordinates manually.';
        } else if (backendError.includes('HTTP 503') || backendError.includes('Service Unavailable')) {
          errorMessage = 'Geocoding service is temporarily unavailable. Please try again later or enter coordinates manually.';
        } else if (backendError.includes('No results found') || backendError.includes('Could not find coordinates')) {
          errorMessage = 'Could not find coordinates for this address. You can still save the agency and add coordinates manually.';
        } else {
          errorMessage = backendError + ' You can still save the agency and add coordinates manually.';
        }
      } else if (err.message) {
        errorMessage = err.message + ' You can still save the agency and add coordinates manually.';
      }
      
      setAddError(errorMessage);
    } finally {
      setGeocoding(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      const response = await healthcareAgenciesAPI.create({
        ...addFormData,
      });
      
      if (response.data.success) {
        await loadAgencies();
        setShowAddModal(false);
      } else {
        setAddError(response.data.error || 'Failed to create agency');
      }
    } catch (error: any) {
      console.error('Error creating agency:', error);
      setAddError(error.response?.data?.error || 'Failed to create agency');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddCancel = () => {
    setShowAddModal(false);
    setAddFormData({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      latitude: '',
      longitude: '',
      capabilities: [],
      isPreferred: false,
    });
    setAddError(null);
  };

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setEditFormData({
      name: agency.name,
      contactName: agency.contactName,
      phone: agency.phone,
      email: agency.email,
      address: agency.address,
      city: agency.city,
      state: agency.state,
      zipCode: agency.zipCode,
      capabilities: agency.capabilities || [],
    });
    setEditError(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgency) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const response = await healthcareAgenciesAPI.update(editingAgency.id, editFormData);
      if (response.data.success) {
        await loadAgencies();
        setEditingAgency(null);
      } else {
        setEditError(response.data.error || 'Failed to update agency');
      }
    } catch (error: any) {
      console.error('Error updating agency:', error);
      setEditError(error.response?.data?.error || 'Failed to update agency');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingAgency(null);
    setEditFormData({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      capabilities: [],
    });
    setEditError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      try {
        await healthcareAgenciesAPI.delete(id);
        await loadAgencies();
      } catch (err) {
        console.error('Error deleting agency:', err);
        setError('Failed to delete agency');
      }
    }
  };

  const handleTogglePreferred = async (agency: Agency) => {
    if (!agency.id) return;
    
    setTogglingPreferred(agency.id);
    try {
      const newPreferredStatus = !agency.isPreferred;
      await healthcareAgenciesAPI.togglePreferred(agency.id, newPreferredStatus);
      await loadAgencies();
    } catch (err) {
      console.error('Error toggling preferred status:', err);
      setError('Failed to update preferred status');
    } finally {
      setTogglingPreferred(null);
    }
  };

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'preferred' && agency.isPreferred) ||
                         (filterStatus === 'regular' && !agency.isPreferred);
    return matchesSearch && matchesStatus;
  });

  // Reload when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAgencies();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus]);

  if (loading && agencies.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My EMS Providers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your list of EMS transport providers and mark them as preferred or regular.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="preferred">Preferred</option>
            <option value="regular">Regular</option>
          </select>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </button>
          <button
            onClick={loadAgencies}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Agencies List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredAgencies.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No providers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new provider.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capabilities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 flex items-center">
                          {agency.isPreferred && (
                            <Star className="h-4 w-4 text-yellow-500 mr-2 fill-current" />
                          )}
                          {agency.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{agency.contactName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {agency.phone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {agency.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agency.city}, {agency.state}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {agency.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {agency.capabilities && agency.capabilities.length > 0 ? (
                          agency.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {cap}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No capabilities</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {agency.isPreferred ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Preferred
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Regular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleTogglePreferred(agency)}
                          disabled={togglingPreferred === agency.id}
                          className={`${
                            agency.isPreferred
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-gray-400 hover:text-yellow-600'
                          } disabled:opacity-50`}
                          title={agency.isPreferred ? 'Mark as regular' : 'Mark as preferred'}
                        >
                          {agency.isPreferred ? (
                            <Star className="h-4 w-4 fill-current" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(agency)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(agency.id)}
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

      {/* Add Agency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Add Provider</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a new EMS provider to your preferred list
                  </p>
                </div>
                <button
                  onClick={handleAddCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              {addError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {addError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="providerName" className="block text-sm font-medium text-gray-700 mb-2">
                      Provider Name *
                    </label>
                    <input
                      type="text"
                      id="providerName"
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter provider name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={addFormData.contactName}
                      onChange={handleAddInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter contact person name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={addFormData.email}
                        onChange={handleAddInputChange}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={addFormData.phone}
                        onChange={handleAddInputChange}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={addFormData.address}
                      onChange={handleAddInputChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter street address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={addFormData.city}
                      onChange={handleAddInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={addFormData.state}
                      onChange={handleAddInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={addFormData.zipCode}
                      onChange={handleAddInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>

                {/* Location Coordinates */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-blue-800">Location Coordinates</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Location coordinates are required for distance calculations. You can either lookup coordinates automatically or enter them manually.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Geocoding Button */}
                    <div>
                      <button
                        type="button"
                        onClick={geocodeAddress}
                        disabled={geocoding || !addFormData.address || !addFormData.city || !addFormData.state || !addFormData.zipCode}
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
                            <MapPin className="h-4 w-4 mr-2" />
                            Lookup Coordinates
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {(geocoding || !addFormData.address || !addFormData.city || !addFormData.state || !addFormData.zipCode) ? (
                          geocoding ? 'Looking up coordinates...' : 'Please fill in address fields above'
                        ) : 'Click to automatically look up GPS coordinates'}
                      </p>
                    </div>
                    
                    {/* Manual Entry */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input
                          type="text"
                          name="latitude"
                          value={addFormData.latitude}
                          onChange={handleAddInputChange}
                          placeholder="e.g., 40.123456"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input
                          type="text"
                          name="longitude"
                          value={addFormData.longitude}
                          onChange={handleAddInputChange}
                          placeholder="e.g., -75.123456"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Capabilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Capabilities * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {capabilitiesList.map(capability => (
                      <label key={capability} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={addFormData.capabilities.includes(capability)}
                          onChange={() => handleCapabilityChange(capability)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{capability}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPreferred"
                    id="isPreferred"
                    checked={addFormData.isPreferred}
                    onChange={handleAddInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPreferred" className="ml-2 block text-sm text-gray-700">
                    Mark as Preferred Provider
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleAddCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {addLoading ? 'Adding...' : 'Add Provider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agency Modal */}
      {editingAgency && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Provider</h3>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {editError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    name="contactName"
                    value={editFormData.contactName}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={editFormData.city}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={editFormData.state}
                      onChange={handleEditInputChange}
                      maxLength={2}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={editFormData.zipCode}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
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

export default HealthcareEMSAgencies;

