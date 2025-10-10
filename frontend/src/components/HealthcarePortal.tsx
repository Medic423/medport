import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Shield, 
  Weight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { tripsAPI, facilitiesAPI } from '../services/api';

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
}

interface TripFormData {
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: 'BLS' | 'ALS' | 'CCT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  specialRequirements: string;
  readyStart: string;
  readyEnd: string;
  isolation: boolean;
  bariatric: boolean;
}

const HealthcarePortal: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TripFormData>({
    patientId: '',
    originFacilityId: '',
    destinationFacilityId: '',
    transportLevel: 'BLS',
    priority: 'MEDIUM',
    specialRequirements: '',
    readyStart: '',
    readyEnd: '',
    isolation: false,
    bariatric: false,
  });

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const response = await facilitiesAPI.getAll();
      setFacilities(response.data.data || []);
    } catch (error) {
      console.error('TCC_DEBUG: Error loading facilities:', error);
      setError('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.originFacilityId || !formData.destinationFacilityId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.readyStart || !formData.readyEnd) {
      setError('Please select ready time window');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await tripsAPI.create(formData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          patientId: '',
          originFacilityId: '',
          destinationFacilityId: '',
          transportLevel: 'BLS',
          priority: 'MEDIUM',
          specialRequirements: '',
          readyStart: '',
          readyEnd: '',
          isolation: false,
          bariatric: false,
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.data.error || 'Failed to create transport request');
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Error creating trip:', error);
      setError(error.response?.data?.error || 'Failed to create transport request');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Plus className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Create Transport Request</h2>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Submit a new transport request for patient transfer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Transport request created successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID *
              </label>
              <input
                type="text"
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter patient ID"
                required
              />
            </div>
          </div>

          {/* Facility Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="originFacilityId" className="block text-sm font-medium text-gray-700 mb-2">
                Origin Facility *
              </label>
              <select
                id="originFacilityId"
                name="originFacilityId"
                value={formData.originFacilityId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select origin facility</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} - {facility.city}, {facility.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="destinationFacilityId" className="block text-sm font-medium text-gray-700 mb-2">
                Destination Facility *
              </label>
              <select
                id="destinationFacilityId"
                name="destinationFacilityId"
                value={formData.destinationFacilityId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select destination facility</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} - {facility.city}, {facility.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transport Level and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="transportLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Level of Service *
              </label>
              <select
                id="transportLevel"
                name="transportLevel"
                value={formData.transportLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="BLS">BLS - Basic Life Support</option>
                <option value="ALS">ALS - Advanced Life Support</option>
                <option value="CCT">CCT - Critical Care Transport</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="LOW">LOW - Non-urgent</option>
                <option value="MEDIUM">MEDIUM - Standard</option>
                <option value="HIGH">HIGH - Urgent</option>
                <option value="CRITICAL">CRITICAL - Emergency</option>
              </select>
            </div>
          </div>

          {/* Time Window */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="readyStart" className="block text-sm font-medium text-gray-700 mb-2">
                Ready Start Time *
              </label>
              <input
                type="datetime-local"
                id="readyStart"
                name="readyStart"
                value={formData.readyStart}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label htmlFor="readyEnd" className="block text-sm font-medium text-gray-700 mb-2">
                Ready End Time *
              </label>
              <input
                type="datetime-local"
                id="readyEnd"
                name="readyEnd"
                value={formData.readyEnd}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter any special requirements or notes..."
            />
          </div>

          {/* Special Flags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Special Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isolation"
                  name="isolation"
                  checked={formData.isolation}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isolation" className="ml-2 block text-sm text-gray-900">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-yellow-600 mr-1" />
                    Isolation Required
                  </div>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bariatric"
                  name="bariatric"
                  checked={formData.bariatric}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="bariatric" className="ml-2 block text-sm text-gray-900">
                  <div className="flex items-center">
                    <Weight className="h-4 w-4 text-blue-600 mr-1" />
                    Bariatric Transport
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Request...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Transport Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthcarePortal;
