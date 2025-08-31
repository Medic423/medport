import React, { useState, useEffect } from 'react';
import { Star, Add, Check, LocalShipping } from '@mui/icons-material';

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
  selectedAgencies: string[];
}

interface Agency {
  id: string;
  name: string;
  contactName?: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  units: Array<{
    type: string;
  }>;
  availability: {
    hasAvailableUnits: boolean;
    availableUnits: number;
    totalUnits: number;
  };
}

interface TripFormWithAgencySelectionProps {
  onNavigate?: (page: string) => void;
}

const TripFormWithAgencySelection: React.FC<TripFormWithAgencySelectionProps> = ({ onNavigate }) => {
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
    notes: '',
    selectedAgencies: []
  });

  const [preferredAgencies, setPreferredAgencies] = useState<Agency[]>([]);
  const [availableAgencies, setAvailableAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [agenciesLoading, setAgenciesLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<TripFormData>>({});
  const [showAllAgencies, setShowAllAgencies] = useState(false);

  useEffect(() => {
    loadPreferredAgencies();
  }, []);

  useEffect(() => {
    if (formData.transportLevel) {
      loadAvailableAgencies();
    }
  }, [formData.transportLevel]);

  const loadPreferredAgencies = async () => {
    try {
      setAgenciesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/hospital-agencies/preferred', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const agencies = data.data?.map((pa: any) => ({
          id: pa.agency.id,
          name: pa.agency.name,
          contactName: pa.agency.contactName,
          phone: pa.agency.phone,
          email: pa.agency.email,
          city: pa.agency.city,
          state: pa.agency.state,
          units: pa.agency.units || [],
          availability: {
            hasAvailableUnits: pa.agency.units?.some((unit: any) => 
              unit.unitAvailability?.some((ua: any) => ua.status === 'AVAILABLE')
            ) || false,
            availableUnits: pa.agency.units?.filter((unit: any) => 
              unit.unitAvailability?.some((ua: any) => ua.status === 'AVAILABLE')
            ).length || 0,
            totalUnits: pa.agency.units?.length || 0
          }
        })) || [];
        setPreferredAgencies(agencies);
      }
    } catch (error) {
      console.error('Error loading preferred agencies:', error);
    } finally {
      setAgenciesLoading(false);
    }
  };

  const loadAvailableAgencies = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams();
      if (formData.transportLevel) params.append('transportLevel', formData.transportLevel);
      params.append('hasAvailableUnits', 'true');

      const response = await fetch(`/api/hospital-agencies/available?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableAgencies(data.data || []);
      }
    } catch (error) {
      console.error('Error loading available agencies:', error);
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
    }
  };

  const handleAgencyToggle = (agencyId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAgencies: prev.selectedAgencies.includes(agencyId)
        ? prev.selectedAgencies.filter(id => id !== agencyId)
        : [...prev.selectedAgencies, agencyId]
    }));
  };

  const handleSelectAllPreferred = () => {
    const preferredIds = preferredAgencies
      .filter(agency => agency.availability.hasAvailableUnits)
      .map(agency => agency.id);
    
    setFormData(prev => ({
      ...prev,
      selectedAgencies: [...new Set([...prev.selectedAgencies, ...preferredIds])]
    }));
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
    if (formData.selectedAgencies.length === 0) {
      newErrors.selectedAgencies = 'At least one EMS agency must be selected';
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

  const getTransportLevelIcon = (level: string) => {
    switch (level) {
      case 'BLS': return '🟢';
      case 'ALS': return '🟡';
      case 'CCT': return '🔴';
      case 'OTHER': return '⚪';
      default: return '⚪';
    }
  };

  const getAvailableAgenciesForLevel = (level: string) => {
    return availableAgencies.filter(agency => 
      agency.units.some(unit => unit.type === level) && agency.availability.hasAvailableUnits
    );
  };

  const allAgencies = showAllAgencies ? availableAgencies : preferredAgencies;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Trip Request</h1>
        <p className="mt-2 text-gray-600">Create a new inter-facility transfer request with EMS agency selection</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Trip Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Trip Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin Facility *
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.origin ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., City General Hospital"
              />
              {errors.origin && <p className="mt-1 text-sm text-red-600">{errors.origin}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Facility *
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.destination ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Regional Medical Center"
              />
              {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
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
                <option value="Other">Other - Wheelchair/Medical Taxi</option>
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
                placeholder="e.g., Wheelchair accessible, Bariatric"
              />
            </div>
          </div>
        </div>

        {/* Clinical Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Clinical Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis *
              </label>
              <input
                type="text"
                value={formData.clinicalDetails.diagnosis}
                onChange={(e) => handleInputChange('clinicalDetails.diagnosis', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.clinicalDetails?.diagnosis ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Primary diagnosis"
              />
              {errors.clinicalDetails?.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.clinicalDetails.diagnosis}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobility Level
              </label>
              <select
                value={formData.clinicalDetails.mobility}
                onChange={(e) => handleInputChange('clinicalDetails.mobility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ambulatory">Ambulatory</option>
                <option value="wheelchair">Wheelchair</option>
                <option value="stretcher">Stretcher</option>
                <option value="bed">Bed-bound</option>
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
                Continuous Monitoring Required
              </label>
            </div>
          </div>
        </div>

        {/* EMS Agency Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">EMS Agency Selection</h2>
            <div className="flex space-x-2">
              {!showAllAgencies && preferredAgencies.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllPreferred}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Select All Preferred
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAllAgencies(!showAllAgencies)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showAllAgencies ? 'Show Preferred Only' : 'Show All Available'}
              </button>
            </div>
          </div>

          {agenciesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading agencies...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Select EMS agencies to notify for this transport request. 
                {!showAllAgencies && preferredAgencies.length > 0 && (
                  <span className="text-blue-600"> Showing your preferred agencies first.</span>
                )}
              </p>

              {allAgencies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <LocalShipping className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Agencies</h3>
                  <p className="text-gray-500">
                    No EMS agencies are currently available for {formData.transportLevel} transport level.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allAgencies
                    .filter(agency => 
                      agency.units.some(unit => unit.type === formData.transportLevel) && 
                      agency.availability.hasAvailableUnits
                    )
                    .map((agency) => (
                    <div
                      key={agency.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.selectedAgencies.includes(agency.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAgencyToggle(agency.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.selectedAgencies.includes(agency.id)}
                            onChange={() => handleAgencyToggle(agency.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{agency.name}</h3>
                            <p className="text-sm text-gray-600">
                              {agency.city}, {agency.state} • {agency.phone}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {getTransportLevelIcon(formData.transportLevel)} {formData.transportLevel}
                              </span>
                              <span className="text-xs text-gray-500">
                                {agency.availability.availableUnits}/{agency.availability.totalUnits} units available
                              </span>
                            </div>
                          </div>
                        </div>
                        {formData.selectedAgencies.includes(agency.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.selectedAgencies && (
                <p className="mt-2 text-sm text-red-600">{errors.selectedAgencies}</p>
              )}

              {formData.selectedAgencies.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>{formData.selectedAgencies.length}</strong> agency(ies) selected for notification
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Notes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information about this transport request..."
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

export default TripFormWithAgencySelection;
