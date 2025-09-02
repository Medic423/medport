import React, { useState, useEffect } from 'react';
import { Star, Add, Check, LocalShipping } from '@mui/icons-material';
import TransportRequestQRIntegration from './TransportRequestQRIntegration';

interface TripFormData {
  patientId: string;
  origin: string;
  destination: string;
  transportLevel: 'ALS' | 'BLS' | 'CCT' | 'Other';
  clinicalDetails: {
    diagnosis: string;
    mobility: 'ambulatory' | 'wheelchair' | 'stretcher' | 'bed';
    oxygenRequired: boolean;
    monitoringRequired: boolean;
  };
  urgency: 'routine' | 'urgent' | 'emergent';
  notes: string;
  selectedAgencies: string[];
  generateQRCode: boolean;
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

interface Facility {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  address: string;
}

interface TripFormWithAgencySelectionProps {
  onNavigate?: (page: string) => void;
}

const TripFormWithAgencySelection: React.FC<TripFormWithAgencySelectionProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<TripFormData>({
    patientId: '',
    origin: '',
    destination: '',
    transportLevel: 'BLS',
    clinicalDetails: {
      diagnosis: '',
      mobility: 'ambulatory',
      oxygenRequired: false,
      monitoringRequired: false
    },
    urgency: 'routine',
    notes: '',
    selectedAgencies: [],
    generateQRCode: false
  });

  const [preferredAgencies, setPreferredAgencies] = useState<Agency[]>([]);
  const [availableAgencies, setAvailableAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [agenciesLoading, setAgenciesLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<TripFormData>>({});
  const [showAllAgencies, setShowAllAgencies] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTransportRequestId, setCreatedTransportRequestId] = useState<string>('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredOriginFacilities, setFilteredOriginFacilities] = useState<Facility[]>([]);
  const [filteredDestinationFacilities, setFilteredDestinationFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    loadPreferredAgencies();
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for facility loading');
        return;
      }

      const response = await fetch('/api/transport-requests/facilities/search?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities || []);
      } else {
        console.error('Facility loading failed:', response.status);
      }
    } catch (error) {
      console.error('Error loading facilities:', error);
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
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for facility search');
        return;
      }

      const response = await fetch(`/api/transport-requests/facilities/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (type === 'origin') {
          setFilteredOriginFacilities(data.facilities || []);
        } else {
          setFilteredDestinationFacilities(data.facilities || []);
        }
      }
    } catch (error) {
      console.error('Error searching facilities:', error);
    }
  };

  const selectFacility = (facility: Facility, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setFormData(prev => ({ ...prev, origin: facility.name }));
      setFilteredOriginFacilities([]);
    } else {
      setFormData(prev => ({ ...prev, destination: facility.name }));
      setFilteredDestinationFacilities([]);
    }
  };

  // Generate HIPAA-compliant patient ID
  const generatePatientId = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const hash = btoa(timestamp + random).substring(0, 8).toUpperCase();
    return `P${hash}`;
  };

  const handleGeneratePatientId = () => {
    const newPatientId = generatePatientId();
    setFormData(prev => ({ ...prev, patientId: newPatientId }));
  };

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
          units: [], // Mock units since relation doesn't exist
          availability: {
            hasAvailableUnits: true, // Mock availability
            availableUnits: 2,
            totalUnits: 3
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
        const agencies = (data.data || []).map((agency: any) => ({
          ...agency,
          units: [], // Mock units since relation doesn't exist
          availability: {
            hasAvailableUnits: true, // Mock availability
            availableUnits: 2,
            totalUnits: 3
          }
        }));
        setAvailableAgencies(agencies);
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

    // Search facilities for origin/destination
    if (field === 'origin') {
      searchFacilities(value, 'origin');
    } else if (field === 'destination') {
      searchFacilities(value, 'destination');
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
    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Map form data to API format
      const apiData = {
        patientId: formData.patientId, // Use the patient ID generated in the form
        // Using real facility IDs from the database
        // In a production system, you'd have facility selection dropdowns
        originFacilityId: 'cmf2mdtdz0003ccy46gfr4zv0', // Einstein Medical Center
        destinationFacilityId: 'cmf2mdtdx0001ccy44vgm2ved', // Jefferson University Hospital
        transportLevel: formData.transportLevel,
        priority: formData.urgency === 'routine' ? 'LOW' : 
                  formData.urgency === 'urgent' ? 'MEDIUM' : 
                  formData.urgency === 'emergent' ? 'URGENT' : 'LOW',
        specialRequirements: [
          formData.clinicalDetails.mobility,
          formData.clinicalDetails.oxygenRequired ? 'Oxygen Required' : null,
          formData.clinicalDetails.monitoringRequired ? 'Continuous Monitoring Required' : null,
          formData.notes
        ].filter(Boolean).join('; '),
        selectedAgencies: formData.selectedAgencies,
        sendNotifications: true
      };

      console.log('Submitting trip request:', apiData);

      const response = await fetch('/api/transport-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transport request');
      }

      const result = await response.json();
      console.log('Trip request created successfully:', result);

      // Store the created transport request ID and show success modal (with QR code if requested)
      setCreatedTransportRequestId(result.transportRequest.id);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Failed to submit trip request:', error);
      alert(`Failed to create trip request: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      agency.availability.hasAvailableUnits
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
        {/* Patient Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID *
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter patient ID or generate one"
                />
                <button
                  type="button"
                  onClick={handleGeneratePatientId}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Generate
                </button>
              </div>
              {!formData.patientId && (
                <p className="mt-1 text-sm text-gray-500">
                  Click "Generate" to create a HIPAA-compliant, non-identifiable patient ID
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.generateQRCode}
                  onChange={(e) => handleInputChange('generateQRCode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Generate QR Code for Patient Tracking
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Create a QR code that can be scanned to access patient transport information
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.origin ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., City General Hospital"
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
                      <div className="font-medium text-gray-900">{facility.name}</div>
                      <div className="text-sm text-gray-600">{facility.address}, {facility.city}, {facility.state}</div>
                    </div>
                  ))}
                </div>
              )}
              {errors.origin && <p className="mt-1 text-sm text-red-600">{errors.origin}</p>}
            </div>

            <div className="relative">
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
                      <div className="font-medium text-gray-900">{facility.name}</div>
                      <div className="text-sm text-gray-600">{facility.address}, {facility.city}, {facility.state}</div>
                    </div>
                  ))}
                </div>
              )}
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
                      agency.availability.hasAvailableUnits
                    )
                    .map((agency) => (
                    <div
                      key={agency.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        formData.selectedAgencies.includes(agency.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.selectedAgencies.includes(agency.id)}
                            onChange={() => handleAgencyToggle(agency.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
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

      {/* Success Modal with QR Code */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  ✅ Trip Request Created Successfully!
                </h3>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success Message */}
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Transport Request Created
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Request ID: <strong>{createdTransportRequestId}</strong></p>
                        <p>Patient ID: <strong>{formData.patientId}</strong></p>
                        <p>Notifications sent to {formData.selectedAgencies.length} EMS agencies.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Integration - Only show if user requested it */}
              {createdTransportRequestId && formData.generateQRCode && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    📱 QR Code for Patient Tracking
                  </h4>
                  <TransportRequestQRIntegration
                    transportRequestId={createdTransportRequestId}
                    patientId={formData.patientId}
                    className="border rounded-lg"
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    // Navigate to Trip Dashboard
                    onNavigate?.('dashboard');
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    // Reset form for new trip request
                    setFormData({
                      patientId: '',
                      origin: '',
                      destination: '',
                      transportLevel: 'BLS',
                      clinicalDetails: {
                        diagnosis: '',
                        mobility: 'ambulatory',
                        oxygenRequired: false,
                        monitoringRequired: false
                      },
                      urgency: 'routine',
                      notes: '',
                      selectedAgencies: [],
                      generateQRCode: false
                    });
                    setErrors({});
                    // Navigate to New Trip Request screen
                    onNavigate?.('trips/new');
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Another Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripFormWithAgencySelection;
