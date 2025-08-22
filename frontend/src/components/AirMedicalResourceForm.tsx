import React, { useState } from 'react';
import { 
  AirMedicalType, 
  CreateAirMedicalResourceData,
  AirMedicalResource 
} from '../types/airMedical';

interface AirMedicalResourceFormProps {
  onSubmit: (data: CreateAirMedicalResourceData) => void;
  onCancel: () => void;
  initialData?: Partial<AirMedicalResource>;
  isEditing?: boolean;
}

const AirMedicalResourceForm: React.FC<AirMedicalResourceFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CreateAirMedicalResourceData>({
    resourceType: initialData?.resourceType || AirMedicalType.HELICOPTER,
    identifier: initialData?.identifier || '',
    baseLocation: initialData?.baseLocation || '',
    serviceArea: initialData?.serviceArea || { radius: 100, units: 'miles' },
    capabilities: initialData?.capabilities || { medical: [], equipment: [] },
    crewSize: initialData?.crewSize || 2,
    maxRange: initialData?.maxRange || 200,
    maxPayload: initialData?.maxPayload || 500,
    weatherMinimums: initialData?.weatherMinimums || { visibility: 1, ceiling: 500 },
    operatingHours: initialData?.operatingHours || { start: '06:00', end: '22:00' },
    contactInfo: initialData?.contactInfo || { phone: '', email: '', radio: '' }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Identifier is required';
    }
    if (!formData.baseLocation.trim()) {
      newErrors.baseLocation = 'Base location is required';
    }
    if (formData.crewSize < 1) {
      newErrors.crewSize = 'Crew size must be at least 1';
    }
    if (formData.maxRange <= 0) {
      newErrors.maxRange = 'Maximum range must be greater than 0';
    }
    if (formData.maxPayload <= 0) {
      newErrors.maxPayload = 'Maximum payload must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CreateAirMedicalResourceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleServiceAreaChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      serviceArea: { ...prev.serviceArea, [field]: value }
    }));
  };

  const handleCapabilitiesChange = (type: 'medical' | 'equipment', value: string[]) => {
    setFormData(prev => ({
      ...prev,
      capabilities: { ...prev.capabilities, [type]: value }
    }));
  };

  const handleWeatherMinimumsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      weatherMinimums: { ...prev.weatherMinimums, [field]: value }
    }));
  };

  const handleOperatingHoursChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: { ...prev.operatingHours, [field]: value }
    }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value }
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Air Medical Resource' : 'Create Air Medical Resource'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type *
            </label>
            <select
              value={formData.resourceType}
              onChange={(e) => handleInputChange('resourceType', e.target.value as AirMedicalType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(AirMedicalType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identifier *
            </label>
            <input
              type="text"
              value={formData.identifier}
              onChange={(e) => handleInputChange('identifier', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.identifier ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., N12345, HEMS-01"
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Location *
            </label>
            <input
              type="text"
              value={formData.baseLocation}
              onChange={(e) => handleInputChange('baseLocation', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.baseLocation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Philadelphia International Airport"
            />
            {errors.baseLocation && (
              <p className="text-red-500 text-sm mt-1">{errors.baseLocation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crew Size *
            </label>
            <input
              type="number"
              value={formData.crewSize}
              onChange={(e) => handleInputChange('crewSize', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.crewSize ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
            />
            {errors.crewSize && (
              <p className="text-red-500 text-sm mt-1">{errors.crewSize}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Range (miles) *
            </label>
            <input
              type="number"
              value={formData.maxRange}
              onChange={(e) => handleInputChange('maxRange', parseFloat(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.maxRange ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.1"
            />
            {errors.maxRange && (
              <p className="text-red-500 text-sm mt-1">{errors.maxRange}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Payload (lbs) *
            </label>
            <input
              type="number"
              value={formData.maxPayload}
              onChange={(e) => handleInputChange('maxPayload', parseFloat(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.maxPayload ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.1"
            />
            {errors.maxPayload && (
              <p className="text-red-500 text-sm mt-1">{errors.maxPayload}</p>
            )}
          </div>
        </div>

        {/* Service Area */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Area</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Radius (miles)
              </label>
              <input
                type="number"
                value={formData.serviceArea.radius}
                onChange={(e) => handleServiceAreaChange('radius', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Units
              </label>
              <select
                value={formData.serviceArea.units}
                onChange={(e) => handleServiceAreaChange('units', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="miles">Miles</option>
                <option value="kilometers">Kilometers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Capabilities
              </label>
              <textarea
                value={Array.isArray(formData.capabilities.medical) ? formData.capabilities.medical.join('\n') : ''}
                onChange={(e) => handleCapabilitiesChange('medical', e.target.value.split('\n').filter(line => line.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter medical capabilities, one per line"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment
              </label>
              <textarea
                value={Array.isArray(formData.capabilities.equipment) ? formData.capabilities.equipment.join('\n') : ''}
                onChange={(e) => handleCapabilitiesChange('equipment', e.target.value.split('\n').filter(line => line.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter equipment list, one per line"
              />
            </div>
          </div>
        </div>

        {/* Weather Minimums */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Minimums</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility (miles)
              </label>
              <input
                type="number"
                value={formData.weatherMinimums.visibility}
                onChange={(e) => handleWeatherMinimumsChange('visibility', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ceiling (feet)
              </label>
              <input
                type="number"
                value={formData.weatherMinimums.ceiling}
                onChange={(e) => handleWeatherMinimumsChange('ceiling', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Operating Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.operatingHours.start}
                onChange={(e) => handleOperatingHoursChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.operatingHours.end}
                onChange={(e) => handleOperatingHoursChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleContactInfoChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="crew@airmedical.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radio Frequency
              </label>
              <input
                type="text"
                value={formData.contactInfo.radio}
                onChange={(e) => handleContactInfoChange('radio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123.45 MHz"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t pt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isEditing ? 'Update Resource' : 'Create Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AirMedicalResourceForm;
