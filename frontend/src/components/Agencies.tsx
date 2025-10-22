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
  RefreshCw
} from 'lucide-react';
import { agenciesAPI } from '../services/api';

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
}


const Agencies: React.FC = () => {
  console.log('TCC_DEBUG: Agencies component mounted/rendered');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
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
    serviceType: 'BLS/ALS'
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);


  useEffect(() => {
    console.log('TCC_DEBUG: Agencies.useEffect() initial load');
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      console.log('TCC_DEBUG: Agencies.loadAgencies(): calling agenciesAPI.getAll');
      const response = await agenciesAPI.getAll();
      console.log('TCC_DEBUG: Agencies.loadAgencies(): response status', response.status);
      console.log('TCC_DEBUG: Agencies.loadAgencies(): response data', response.data);
      if (response.data.success) {
        // Transform the data to match the expected structure
        const transformedAgencies = response.data.data.map((agency: any) => ({
          ...agency,
          // Data comes directly from the database, not nested under contactInfo
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
        }));
        console.log('TCC_DEBUG: Agencies.loadAgencies(): transformed count', transformedAgencies.length);
        setAgencies(transformedAgencies);
      } else {
        setError('Failed to load agencies');
      }
    } catch (err) {
      console.error('TCC_DEBUG: Agencies.loadAgencies(): error', err);
      setError('Failed to load agencies');
    } finally {
      setLoading(false);
    }
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
      serviceType: 'BLS/ALS' // Default value, could be enhanced to store this
    });
    setEditError(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await agenciesAPI.update(editingAgency.id, editFormData);
      if (response.data.success) {
        // Update the agencies list
        setAgencies(agencies.map(agency => 
          agency.id === editingAgency.id 
            ? { ...agency, ...editFormData, updatedAt: new Date().toISOString() }
            : agency
        ));
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
      serviceType: 'BLS/ALS'
    });
    setEditError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      try {
        await agenciesAPI.delete(id);
        await loadAgencies();
      } catch (err) {
        console.error('Error deleting agency:', err);
        setError('Failed to delete agency');
      }
    }
  };


  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && agency.isActive) ||
                         (filterStatus === 'inactive' && !agency.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">EMS Agencies</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage EMS agencies and their capabilities.
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
              placeholder="Search agencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => {
              // Clear the current session and redirect to main page for registration
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // Redirect to EMS registration page
              window.location.href = '/ems-register';
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Agency
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agencies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new agency.'}
            </p>
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
                        <div className="text-lg font-semibold text-gray-900">{agency.name}</div>
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
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
                        {agency.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${
                          agency.isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {agency.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(agency)}
                          className="text-primary-600 hover:text-primary-900"
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

      {/* Edit Agency Modal */}
      {editingAgency && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Agency</h3>
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
                  <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={editFormData.state}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={editFormData.zipCode}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Type</label>
                  <select
                    name="serviceType"
                    value={editFormData.serviceType}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="BLS">BLS Only</option>
                    <option value="ALS">ALS Only</option>
                    <option value="BLS/ALS">BLS/ALS</option>
                    <option value="Critical Care">Critical Care</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
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

export default Agencies;
