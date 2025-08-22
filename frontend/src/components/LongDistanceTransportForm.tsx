import React, { useState, useEffect } from 'react';
import { 
  LongDistanceTransport, 
  TransportLeg, 
  Facility, 
  TransportLevel, 
  WeatherConditions,
  LongDistanceStatus 
} from '../types/transport';

interface LongDistanceTransportFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  facilities: Facility[];
  coordinatorId: string;
}

const LongDistanceTransportForm: React.FC<LongDistanceTransportFormProps> = ({
  onSubmit,
  onCancel,
  facilities,
  coordinatorId
}) => {
  const [transportLegs, setTransportLegs] = useState<Partial<TransportLeg>[]>([
    {
      originFacilityId: '',
      destinationFacilityId: '',
      patientId: '',
      transportLevel: TransportLevel.BLS,
      specialRequirements: '',
      plannedStartTime: '',
      plannedEndTime: ''
    }
  ]);

  const [weatherConditions, setWeatherConditions] = useState<Partial<WeatherConditions>>({
    temperature: 70,
    windSpeed: 10,
    visibility: 10,
    precipitation: 0,
    conditions: 'Clear',
    isAirMedicalSuitable: true,
    groundTransportRequired: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add new transport leg
  const addTransportLeg = () => {
    setTransportLegs([
      ...transportLegs,
      {
        originFacilityId: '',
        destinationFacilityId: '',
        patientId: '',
        transportLevel: TransportLevel.BLS,
        specialRequirements: '',
        plannedStartTime: '',
        plannedEndTime: ''
      }
    ]);
  };

  // Remove transport leg
  const removeTransportLeg = (index: number) => {
    if (transportLegs.length > 1) {
      setTransportLegs(transportLegs.filter((_, i) => i !== index));
    }
  };

  // Update transport leg field
  const updateTransportLeg = (index: number, field: keyof TransportLeg, value: any) => {
    const updated = [...transportLegs];
    updated[index] = { ...updated[index], [field]: value };
    setTransportLegs(updated);
  };

  // Update weather conditions
  const updateWeatherConditions = (field: keyof WeatherConditions, value: any) => {
    setWeatherConditions(prev => ({ ...prev, [field]: value }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    transportLegs.forEach((leg, index) => {
      if (!leg.originFacilityId) {
        newErrors[`origin${index}`] = 'Origin facility is required';
      }
      if (!leg.destinationFacilityId) {
        newErrors[`destination${index}`] = 'Destination facility is required';
      }
      if (leg.originFacilityId === leg.destinationFacilityId) {
        newErrors[`destination${index}`] = 'Destination must be different from origin';
      }
      if (!leg.plannedStartTime) {
        newErrors[`startTime${index}`] = 'Planned start time is required';
      }
      if (!leg.plannedEndTime) {
        newErrors[`endTime${index}`] = 'Planned end time is required';
      }
      if (leg.plannedStartTime && leg.plannedEndTime && 
          new Date(leg.plannedStartTime) >= new Date(leg.plannedEndTime)) {
        newErrors[`endTime${index}`] = 'End time must be after start time';
      }
    });

    // Validate time sequence across legs
    for (let i = 1; i < transportLegs.length; i++) {
      const prevLeg = transportLegs[i - 1];
      const currentLeg = transportLegs[i];
      
      if (prevLeg.plannedEndTime && currentLeg.plannedStartTime && 
          new Date(prevLeg.plannedEndTime) > new Date(currentLeg.plannedStartTime)) {
        newErrors[`startTime${i}`] = 'Start time must be after previous leg end time';
      }
    }

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
      const submissionData = {
        coordinatorId,
        transportLegs,
        weatherConditions
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting long-distance transport:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total distance (rough estimate)
  const calculateTotalDistance = () => {
    // This would be calculated by the backend using actual distance matrix
    return transportLegs.length * 150; // Rough estimate: 150 miles per leg
  };

  // Calculate estimated duration
  const calculateEstimatedDuration = () => {
    // This would be calculated by the backend using actual distance matrix
    return transportLegs.length * 120; // Rough estimate: 2 hours per leg
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Long-Distance Transport Planning
        </h2>
        <p className="text-gray-600">
          Plan multi-leg transports with weather considerations and route optimization
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transport Overview */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Transport Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{transportLegs.length}</div>
              <div className="text-blue-700">Transport Legs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{calculateTotalDistance()}</div>
              <div className="text-blue-700">Total Miles (Est.)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{calculateEstimatedDuration()}</div>
              <div className="text-blue-700">Total Hours (Est.)</div>
            </div>
          </div>
        </div>

        {/* Weather Conditions Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Conditions & Air Medical Suitability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°F)
              </label>
              <input
                type="number"
                value={weatherConditions.temperature || ''}
                onChange={(e) => updateWeatherConditions('temperature', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wind Speed (mph)
              </label>
              <input
                type="number"
                value={weatherConditions.windSpeed || ''}
                onChange={(e) => updateWeatherConditions('windSpeed', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility (miles)
              </label>
              <input
                type="number"
                value={weatherConditions.visibility || ''}
                onChange={(e) => updateWeatherConditions('visibility', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precipitation (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={weatherConditions.precipitation || ''}
                onChange={(e) => updateWeatherConditions('precipitation', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conditions
              </label>
              <select
                value={weatherConditions.conditions || ''}
                onChange={(e) => updateWeatherConditions('conditions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Clear">Clear</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rain">Rain</option>
                <option value="Snow">Snow</option>
                <option value="Fog">Fog</option>
                <option value="Storm">Storm</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="airMedicalSuitable"
                checked={weatherConditions.isAirMedicalSuitable || false}
                onChange={(e) => updateWeatherConditions('isAirMedicalSuitable', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="airMedicalSuitable" className="text-sm font-medium text-gray-700">
                Air Medical Suitable
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="groundTransportRequired"
                checked={weatherConditions.groundTransportRequired || false}
                onChange={(e) => updateWeatherConditions('groundTransportRequired', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="groundTransportRequired" className="text-sm font-medium text-gray-700">
                Ground Transport Required
              </label>
            </div>
          </div>
        </div>

        {/* Transport Legs Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Transport Legs ({transportLegs.length})
            </h3>
            <button
              type="button"
              onClick={addTransportLeg}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Leg
            </button>
          </div>

          <div className="space-y-4">
            {transportLegs.map((leg, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">
                    Transport Leg #{index + 1}
                  </h4>
                  {transportLegs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTransportLeg(index)}
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
                      Patient ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={leg.patientId || ''}
                      onChange={(e) => updateTransportLeg(index, 'patientId', e.target.value)}
                      placeholder="Leave empty if no patient"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Origin Facility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origin Facility *
                    </label>
                    <select
                      value={leg.originFacilityId || ''}
                      onChange={(e) => updateTransportLeg(index, 'originFacilityId', e.target.value)}
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
                      value={leg.destinationFacilityId || ''}
                      onChange={(e) => updateTransportLeg(index, 'destinationFacilityId', e.target.value)}
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
                      value={leg.transportLevel || TransportLevel.BLS}
                      onChange={(e) => updateTransportLeg(index, 'transportLevel', e.target.value as TransportLevel)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={TransportLevel.BLS}>BLS - Basic Life Support</option>
                      <option value={TransportLevel.ALS}>ALS - Advanced Life Support</option>
                      <option value={TransportLevel.CCT}>CCT - Critical Care Transport</option>
                    </select>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements
                    </label>
                    <input
                      type="text"
                      value={leg.specialRequirements || ''}
                      onChange={(e) => updateTransportLeg(index, 'specialRequirements', e.target.value)}
                      placeholder="e.g., equipment, crew requirements"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Planned Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planned Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={leg.plannedStartTime || ''}
                      onChange={(e) => updateTransportLeg(index, 'plannedStartTime', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`startTime${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`startTime${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`startTime${index}`]}</p>
                    )}
                  </div>

                  {/* Planned End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planned End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={leg.plannedEndTime || ''}
                      onChange={(e) => updateTransportLeg(index, 'plannedEndTime', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`endTime${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`endTime${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`endTime${index}`]}</p>
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
            {isSubmitting ? 'Creating...' : 'Create Long-Distance Transport'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LongDistanceTransportForm;
