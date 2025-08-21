import React, { useState, useEffect } from 'react';
import { TransportLevel, Priority } from '../types/transport';

interface Facility {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  address: string;
}

interface TransportRequestFormProps {
  onSubmit: (data: TransportRequestFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TransportRequestFormData>;
  isEditing?: boolean;
}

export interface TransportRequestFormData {
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: TransportLevel;
  priority: Priority;
  specialRequirements: string;
}

const TransportRequestForm: React.FC<TransportRequestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<TransportRequestFormData>({
    patientId: '',
    originFacilityId: '',
    destinationFacilityId: '',
    transportLevel: TransportLevel.BLS,
    priority: Priority.MEDIUM,
    specialRequirements: ''
  });

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredOriginFacilities, setFilteredOriginFacilities] = useState<Facility[]>([]);
  const [filteredDestinationFacilities, setFilteredDestinationFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load facilities on component mount
  useEffect(() => {
    loadFacilities();
  }, []);

  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/transport-requests/facilities/search?limit=100');
      if (response.ok) {
        try {
          const data = await response.json();
          setFacilities(data.facilities || []);
        } catch (parseError) {
          console.error('[MedPort:TransportRequestForm] Failed to parse facility response:', parseError);
          setFacilities([]);
        }
      } else {
        if (response.status === 401) {
          console.warn('[MedPort:TransportRequestForm] Authentication required for facility loading');
          setFacilities([]);
        } else {
          console.error('[MedPort:TransportRequestForm] Facility loading failed:', response.status);
          setFacilities([]);
        }
      }
    } catch (error) {
      console.error('[MedPort:TransportRequestForm] Error loading facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchFacilities = async (query: string, type: 'origin' | 'destination') => {
    if (!query.trim()) {
      if (type === 'origin') {
        setFilteredOriginFacilities([]);
      } else {
        setFilteredDestinationFacilities([]);
      }
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/transport-requests/facilities/search?name=${encodeURIComponent(query)}&limit=20`
      );
      if (response.ok) {
        try {
          const data = await response.json();
          const filtered = data.facilities || [];
          
          if (type === 'origin') {
            setFilteredOriginFacilities(filtered);
          } else {
            setFilteredDestinationFacilities(filtered);
          }
        } catch (parseError) {
          console.error('[MedPort:TransportRequestForm] Failed to parse facility search response:', parseError);
          if (type === 'origin') {
            setFilteredOriginFacilities([]);
          } else {
            setFilteredDestinationFacilities([]);
          }
        }
      } else {
        if (response.status === 401) {
          console.warn('[MedPort:TransportRequestForm] Authentication required for facility search');
          return;
        }
        console.error('[MedPort:TransportRequestForm] Facility search failed:', response.status);
      }
    } catch (error) {
      console.error('[MedPort:TransportRequestForm] Error searching facilities:', error);
    }
  };

  const handleInputChange = (field: keyof TransportRequestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Search facilities for origin/destination
    if (field === 'originFacilityId') {
      searchFacilities(value, 'origin');
    } else if (field === 'destinationFacilityId') {
      searchFacilities(value, 'destination');
    }
  };

  const selectFacility = (facility: Facility, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setFormData(prev => ({ ...prev, originFacilityId: facility.name }));
      setFilteredOriginFacilities([]);
    } else {
      setFormData(prev => ({ ...prev, destinationFacilityId: facility.name }));
      setFilteredDestinationFacilities([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.originFacilityId.trim()) {
      newErrors.originFacilityId = 'Origin facility is required';
    }

    if (!formData.destinationFacilityId.trim()) {
      newErrors.destinationFacilityId = 'Destination facility is required';
    }

    if (formData.originFacilityId === formData.destinationFacilityId) {
      newErrors.destinationFacilityId = 'Origin and destination facilities must be different';
    }

    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if we're in demo mode (no facilities loaded)
    if (facilities.length === 0) {
      // Demo mode - use placeholder facility IDs
      const submitData = {
        ...formData,
        originFacilityId: 'demo-origin-001',
        destinationFacilityId: 'demo-destination-001'
      };
      
      // Show demo message
      alert('Demo Mode: This is a demonstration. In a real system, you would be able to select actual facilities and submit the request.');
      console.log('[MedPort:Demo] Form submitted with demo data:', submitData);
      return;
    }

    // Find facility IDs from names
    const originFacility = facilities.find(f => f.name === formData.originFacilityId);
    const destinationFacility = facilities.find(f => f.name === formData.destinationFacilityId);

    if (!originFacility || !destinationFacility) {
      setErrors({ submit: 'Please select valid facilities from the dropdown' });
      return;
    }

    const submitData = {
      ...formData,
      originFacilityId: originFacility.id,
      destinationFacilityId: destinationFacility.id
    };

    onSubmit(submitData);
  };

  const generatePatientId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const patientId = `P${timestamp.substring(timestamp.length - 6)}${random.substring(0, 2).toUpperCase()}`;
    setFormData(prev => ({ ...prev, patientId }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Transport Request' : 'Create New Transport Request'}
        </h2>
        <p className="text-gray-600 mt-2">
          Fill out the form below to create a new medical transport request
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.patientId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter patient ID or generate one"
                />
                <button
                  type="button"
                  onClick={generatePatientId}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Generate
                </button>
              </div>
              {errors.patientId && (
                <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Facility Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Selection</h3>
          
          {facilities.length === 0 && !loading && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                🔒 <strong>Demo Mode:</strong> Facility data requires authentication. 
                You can still explore the form interface and submit demo requests.
                <br />
                <span className="text-xs">💡 Try typing facility names and submitting the form to see how it works!</span>
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origin Facility */}
            <div className="relative">
              <label htmlFor="originFacility" className="block text-sm font-medium text-gray-700 mb-2">
                Origin Facility *
              </label>
              <input
                type="text"
                id="originFacility"
                value={formData.originFacilityId}
                onChange={(e) => handleInputChange('originFacilityId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.originFacilityId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Search for origin facility..."
                autoComplete="off"
              />
              {filteredOriginFacilities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredOriginFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      onClick={() => selectFacility(facility, 'origin')}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-sm text-gray-600">
                        {facility.type} • {facility.city}, {facility.state}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.originFacilityId && (
                <p className="text-red-500 text-sm mt-1">{errors.originFacilityId}</p>
              )}
            </div>

            {/* Destination Facility */}
            <div className="relative">
              <label htmlFor="destinationFacility" className="block text-sm font-medium text-gray-700 mb-2">
                Destination Facility *
              </label>
              <input
                type="text"
                id="destinationFacility"
                value={formData.destinationFacilityId}
                onChange={(e) => handleInputChange('destinationFacilityId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.destinationFacilityId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Search for destination facility..."
                autoComplete="off"
              />
              {filteredDestinationFacilities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredDestinationFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      onClick={() => selectFacility(facility, 'destination')}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-sm text-gray-600">
                        {facility.type} • {facility.city}, {facility.state}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.destinationFacilityId && (
                <p className="text-red-500 text-sm mt-1">{errors.destinationFacilityId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Transport Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transport Level */}
            <div>
              <label htmlFor="transportLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Transport Level *
              </label>
              <select
                id="transportLevel"
                value={formData.transportLevel}
                onChange={(e) => handleInputChange('transportLevel', e.target.value as TransportLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={TransportLevel.BLS}>BLS - Basic Life Support</option>
                <option value={TransportLevel.ALS}>ALS - Advanced Life Support</option>
                <option value={TransportLevel.CCT}>CCT - Critical Care Transport</option>
              </select>
            </div>

            {/* Priority Level */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level *
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.URGENT}>Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
          
          <div>
            <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements & Notes
            </label>
            <textarea
              id="specialRequirements"
              value={formData.specialRequirements}
              onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any special requirements, equipment needs, or additional notes..."
            />
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Request' : 'Create Request')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransportRequestForm;
