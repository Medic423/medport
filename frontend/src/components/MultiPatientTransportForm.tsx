import React, { useState, useEffect } from 'react';
import { 
  MultiPatientTransport, 
  PatientTransport, 
  Facility, 
  TransportLevel, 
  Priority,
  MultiPatientStatus 
} from '../types/transport';

interface MultiPatientTransportFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  facilities: Facility[];
  coordinatorId: string;
}

const MultiPatientTransportForm: React.FC<MultiPatientTransportFormProps> = ({
  onSubmit,
  onCancel,
  facilities,
  coordinatorId
}) => {
  const [patientTransports, setPatientTransports] = useState<Partial<PatientTransport>[]>([
    {
      patientId: '',
      originFacilityId: '',
      destinationFacilityId: '',
      transportLevel: TransportLevel.BLS,
      priority: Priority.MEDIUM,
      specialRequirements: '',
      estimatedPickupTime: '',
      estimatedDropoffTime: ''
    }
  ]);

  const [plannedStartTime, setPlannedStartTime] = useState('');
  const [plannedEndTime, setPlannedEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate unique patient ID if not provided
  const generatePatientId = (index: number) => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const hash = btoa(timestamp + random + index).substring(0, 8).toUpperCase();
    return `P${hash}`;
  };

  // Add new patient transport row
  const addPatientTransport = () => {
    setPatientTransports([
      ...patientTransports,
      {
        patientId: '',
        originFacilityId: '',
        destinationFacilityId: '',
        transportLevel: TransportLevel.BLS,
        priority: Priority.MEDIUM,
        specialRequirements: '',
        estimatedPickupTime: '',
        estimatedDropoffTime: ''
      }
    ]);
  };

  // Remove patient transport row
  const removePatientTransport = (index: number) => {
    if (patientTransports.length > 1) {
      setPatientTransports(patientTransports.filter((_, i) => i !== index));
    }
  };

  // Update patient transport field
  const updatePatientTransport = (index: number, field: keyof PatientTransport, value: any) => {
    const updated = [...patientTransports];
    updated[index] = { ...updated[index], [field]: value };
    setPatientTransports(updated);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!plannedStartTime) {
      newErrors.plannedStartTime = 'Planned start time is required';
    }

    if (!plannedEndTime) {
      newErrors.plannedEndTime = 'Planned end time is required';
    }

    if (new Date(plannedStartTime) >= new Date(plannedEndTime)) {
      newErrors.plannedEndTime = 'End time must be after start time';
    }

    patientTransports.forEach((pt, index) => {
      if (!pt.originFacilityId) {
        newErrors[`origin${index}`] = 'Origin facility is required';
      }
      if (!pt.destinationFacilityId) {
        newErrors[`destination${index}`] = 'Destination facility is required';
      }
      if (pt.originFacilityId === pt.destinationFacilityId) {
        newErrors[`destination${index}`] = 'Destination must be different from origin';
      }
      if (!pt.estimatedPickupTime) {
        newErrors[`pickup${index}`] = 'Estimated pickup time is required';
      }
      if (!pt.estimatedDropoffTime) {
        newErrors[`dropoff${index}`] = 'Estimated dropoff time is required';
      }
      if (pt.estimatedPickupTime && pt.estimatedDropoffTime && 
          new Date(pt.estimatedPickupTime) >= new Date(pt.estimatedDropoffTime)) {
        newErrors[`dropoff${index}`] = 'Dropoff time must be after pickup time';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submissionData = {
        coordinatorId,
        patientTransports: patientTransports.map((pt, index) => ({
          ...pt,
          patientId: pt.patientId || generatePatientId(index)
        })),
        plannedStartTime,
        plannedEndTime
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting multi-patient transport:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Multi-Patient Transport Coordination
        </h2>
        <p className="text-gray-600">
          Coordinate multiple patient transports for maximum efficiency and cost savings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Time Planning Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Time Planning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned Start Time *
              </label>
              <input
                type="datetime-local"
                value={plannedStartTime}
                onChange={(e) => setPlannedStartTime(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.plannedStartTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.plannedStartTime && (
                <p className="text-red-500 text-sm mt-1">{errors.plannedStartTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned End Time *
              </label>
              <input
                type="datetime-local"
                value={plannedEndTime}
                onChange={(e) => setPlannedEndTime(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.plannedEndTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.plannedEndTime && (
                <p className="text-red-500 text-sm mt-1">{errors.plannedEndTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Patient Transports Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Patient Transports ({patientTransports.length})
            </h3>
            <button
              type="button"
              onClick={addPatientTransport}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Patient
            </button>
          </div>

          <div className="space-y-4">
            {patientTransports.map((pt, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">
                    Patient Transport #{index + 1}
                  </h4>
                  {patientTransports.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePatientTransport(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Patient ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      value={pt.patientId || ''}
                      onChange={(e) => updatePatientTransport(index, 'patientId', e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Origin Facility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origin Facility *
                    </label>
                    <select
                      value={pt.originFacilityId || ''}
                      onChange={(e) => updatePatientTransport(index, 'originFacilityId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`origin${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Origin Facility</option>
                      {facilities.map(facility => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name} - {facility.city}, {facility.state}
                        </option>
                      ))}
                    </select>
                    {errors[`origin${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`origin${index}`]}</p>
                    )}
                  </div>

                  {/* Destination Facility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination Facility *
                    </label>
                    <select
                      value={pt.destinationFacilityId || ''}
                      onChange={(e) => updatePatientTransport(index, 'destinationFacilityId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`destination${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Destination Facility</option>
                      {facilities.map(facility => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name} - {facility.city}, {facility.state}
                        </option>
                      ))}
                    </select>
                    {errors[`destination${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`destination${index}`]}</p>
                    )}
                  </div>

                  {/* Transport Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transport Level
                    </label>
                    <select
                      value={pt.transportLevel || TransportLevel.BLS}
                      onChange={(e) => updatePatientTransport(index, 'transportLevel', e.target.value as TransportLevel)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={TransportLevel.BLS}>BLS - Basic Life Support</option>
                      <option value={TransportLevel.ALS}>ALS - Advanced Life Support</option>
                      <option value={TransportLevel.CCT}>CCT - Critical Care Transport</option>
                      <option value={TransportLevel.OTHER}>Other - Wheelchair Van, Medical Taxi, etc.</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={pt.priority || Priority.MEDIUM}
                      onChange={(e) => updatePatientTransport(index, 'priority', e.target.value as Priority)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={Priority.LOW}>Low</option>
                      <option value={Priority.MEDIUM}>Medium</option>
                      <option value={Priority.HIGH}>High</option>
                      <option value={Priority.URGENT}>Urgent</option>
                    </select>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements
                    </label>
                    <input
                      type="text"
                      value={pt.specialRequirements || ''}
                      onChange={(e) => updatePatientTransport(index, 'specialRequirements', e.target.value)}
                      placeholder="e.g., wheelchair, oxygen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Estimated Pickup Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Pickup Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={pt.estimatedPickupTime || ''}
                      onChange={(e) => updatePatientTransport(index, 'estimatedPickupTime', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`pickup${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`pickup${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`pickup${index}`]}</p>
                    )}
                  </div>

                  {/* Estimated Dropoff Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Dropoff Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={pt.estimatedDropoffTime || ''}
                      onChange={(e) => updatePatientTransport(index, 'estimatedDropoffTime', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`dropoff${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`dropoff${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`dropoff${index}`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Multi-Patient Transport'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MultiPatientTransportForm;
