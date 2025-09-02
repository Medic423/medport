import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed - using custom routing

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
}

interface TripFormData {
  origin: string;
  destination: string;
  transportLevel: 'ALS' | 'BLS' | 'CCT' | 'Other';
  patientInfo: {
    name: string;
    age: string;
    weight: string;
    specialNeeds: string;
  };
  clinicalDetails: {
    diagnosis: string;
    mobility: 'ambulatory' | 'wheelchair' | 'stretcher' | 'bed';
    oxygenRequired: boolean;
    monitoringRequired: boolean;
  };
  urgency: 'routine' | 'urgent' | 'emergent';
  notes: string;
}

interface NewTripFormProps {
  onNavigate?: (page: string) => void;
}

const NewTripForm: React.FC<NewTripFormProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<TripFormData>({
    origin: '',
    destination: '',
    transportLevel: 'BLS',
    patientInfo: {
      name: '',
      age: '',
      weight: '',
      specialNeeds: ''
    },
    clinicalDetails: {
      diagnosis: '',
      mobility: 'ambulatory',
      oxygenRequired: false,
      monitoringRequired: false
    },
    urgency: 'routine',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<TripFormData>>({});
  
  // Autocomplete state
  const [filteredOriginFacilities, setFilteredOriginFacilities] = useState<Facility[]>([]);
  const [filteredDestinationFacilities, setFilteredDestinationFacilities] = useState<Facility[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Search facilities for autocomplete
  const searchFacilities = async (query: string, type: 'origin' | 'destination') => {
    if (!query.trim()) {
      if (type === 'origin') {
        setFilteredOriginFacilities([]);
        setShowOriginSuggestions(false);
      } else {
        setFilteredDestinationFacilities([]);
        setShowDestinationSuggestions(false);
      }
      return;
    }

    try {
      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-token' : localStorage.getItem('token');

      const response = await fetch(
        `/api/transport-requests/facilities/search?name=${encodeURIComponent(query)}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const filtered = data.facilities || [];
        
        if (type === 'origin') {
          setFilteredOriginFacilities(filtered);
          setShowOriginSuggestions(true);
        } else {
          setFilteredDestinationFacilities(filtered);
          setShowDestinationSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error searching facilities:', error);
    }
  };

  // Select a facility from autocomplete
  const selectFacility = (facility: Facility, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setFormData(prev => ({ ...prev, origin: facility.name }));
      setShowOriginSuggestions(false);
    } else {
      setFormData(prev => ({ ...prev, destination: facility.name }));
      setShowDestinationSuggestions(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof TripFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Trigger autocomplete search for origin/destination
      if (field === 'origin') {
        searchFacilities(value, 'origin');
      } else if (field === 'destination') {
        searchFacilities(value, 'destination');
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TripFormData> = {};

    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required';
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (!formData.patientInfo.name.trim()) {
      newErrors.patientInfo = { ...newErrors.patientInfo, name: 'Patient name is required' };
    }
    if (!formData.clinicalDetails.diagnosis.trim()) {
      newErrors.clinicalDetails = { ...newErrors.clinicalDetails, diagnosis: 'Diagnosis is required' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      console.log('Submitting trip request:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - redirect to dashboard
      onNavigate?.('dashboard');
    } catch (error) {
      console.error('Failed to submit trip request:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate?.('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Trip Request</h1>
        <p className="mt-2 text-gray-600">Create a new inter-facility transfer request</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Trip Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Trip Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin Facility *
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                onFocus={() => formData.origin && setShowOriginSuggestions(true)}
                onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.origin ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Start typing to search facilities..."
              />
              {errors.origin && <p className="mt-1 text-sm text-red-600">{errors.origin}</p>}
              
              {/* Autocomplete dropdown */}
              {showOriginSuggestions && filteredOriginFacilities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredOriginFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      onClick={() => selectFacility(facility, 'origin')}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{facility.name}</div>
                      <div className="text-sm text-gray-500">
                        {facility.address}, {facility.city}, {facility.state} {facility.zipCode}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Facility *
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                onFocus={() => formData.destination && setShowDestinationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.destination ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Start typing to search facilities..."
              />
              {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
              
              {/* Autocomplete dropdown */}
              {showDestinationSuggestions && filteredDestinationFacilities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredDestinationFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      onClick={() => selectFacility(facility, 'destination')}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{facility.name}</div>
                      <div className="text-sm text-gray-500">
                        {facility.address}, {facility.city}, {facility.state} {facility.zipCode}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Level *
              </label>
              <select
                value={formData.transportLevel}
                onChange={(e) => handleInputChange('transportLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="BLS">BLS - Basic Life Support</option>
                <option value="ALS">ALS - Advanced Life Support</option>
                <option value="CCT">CCT - Critical Care Transport</option>
                <option value="Other">Other - Wheelchair Van, Car Service, etc.</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergent">Emergent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                value={formData.patientInfo.name}
                onChange={(e) => handleInputChange('patientInfo.name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.patientInfo?.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Patient's full name"
              />
              {errors.patientInfo?.name && <p className="mt-1 text-sm text-red-600">{errors.patientInfo.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="text"
                value={formData.patientInfo.age}
                onChange={(e) => handleInputChange('patientInfo.age', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 45 years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                value={formData.patientInfo.weight}
                onChange={(e) => handleInputChange('patientInfo.weight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 180 lbs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Needs
              </label>
              <input
                type="text"
                value={formData.patientInfo.specialNeeds}
                onChange={(e) => handleInputChange('patientInfo.specialNeeds', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Ventilator dependent"
              />
            </div>
          </div>
        </div>

        {/* Clinical Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Clinical Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Diagnosis *
              </label>
              <textarea
                value={formData.clinicalDetails.diagnosis}
                onChange={(e) => handleInputChange('clinicalDetails.diagnosis', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.clinicalDetails?.diagnosis ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the primary diagnosis and reason for transfer"
              />
              {errors.clinicalDetails?.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.clinicalDetails.diagnosis}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobility Status
                </label>
                <select
                  value={formData.clinicalDetails.mobility}
                  onChange={(e) => handleInputChange('clinicalDetails.mobility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ambulatory">Ambulatory</option>
                  <option value="wheelchair">Wheelchair</option>
                  <option value="stretcher">Stretcher</option>
                  <option value="bed">Bed</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="oxygenRequired"
                  checked={formData.clinicalDetails.oxygenRequired}
                  onChange={(e) => handleInputChange('clinicalDetails.oxygenRequired', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="oxygenRequired" className="ml-2 block text-sm text-gray-900">
                  Oxygen Required
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="monitoringRequired"
                  checked={formData.clinicalDetails.monitoringRequired}
                  onChange={(e) => handleInputChange('clinicalDetails.monitoringRequired', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="monitoringRequired" className="ml-2 block text-sm text-gray-900">
                  Monitoring Required
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information, special instructions, or notes for EMS crew..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Trip Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTripForm;
