import React, { useState, useEffect } from 'react';
import { TransportLevel } from '../types/transport';

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
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: TransportLevel;
  specialRequirements: string;
}

const TransportRequestForm: React.FC<TransportRequestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<TransportRequestFormData>({
    originFacilityId: '',
    destinationFacilityId: '',
    transportLevel: TransportLevel.BLS,
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
      
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch('/api/transport-requests/facilities/search?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch(
        `/api/transport-requests/facilities/search?name=${encodeURIComponent(query)}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Transport Request' : 'New Trip Request'}
        </h2>
        <p className="text-gray-600 mt-2">
          Create a new inter-facility transport request with essential information only
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* HIPAA Compliance Notice */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🔒 HIPAA Compliant</h3>
          <p className="text-blue-800 text-sm">
            Patient information is handled securely with auto-generated, non-identifiable patient IDs. 
            No personal health information is stored in this system.
          </p>
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
                <option value={TransportLevel.OTHER}>Other - Wheelchair Van, Medical Taxi, etc.</option>
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
