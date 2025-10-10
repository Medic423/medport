import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface AgencySettingsProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
  };
  onSaveSuccess?: () => void;
}

interface AgencyInfo {
  agencyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  capabilities: string[];
  operatingHours: {
    start: string;
    end: string;
  };
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const AgencySettings: React.FC<AgencySettingsProps> = ({ user, onSaveSuccess }) => {
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo>({
    agencyName: user.agencyName || '',
    contactName: user.name || '',
    email: user.email || '',
    phone: '',
    address: '',
    city: '',
    state: 'PA',
    zipCode: '',
    capabilities: [],
    operatingHours: {
      start: '00:00',
      end: '23:59'
    },
    emailNotifications: true,
    smsNotifications: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const capabilities = [
    'BLS',
    'ALS',
    'CCT',
    'Critical Care',
    'Neonatal',
    'Pediatric',
    'Bariatric',
    'Isolation'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'operatingHours.start' || name === 'operatingHours.end') {
      setAgencyInfo(prev => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [name.split('.')[1]]: value
        }
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAgencyInfo(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setAgencyInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCapabilityChange = (capability: string) => {
    setAgencyInfo(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('TCC_DEBUG: Saving agency settings:', agencyInfo);
      console.log('TCC_DEBUG: Operating hours:', agencyInfo.operatingHours);

      // Prepare the payload with operating hours formatted as a string
      const operatingHoursString = agencyInfo.operatingHours.start && agencyInfo.operatingHours.end
        ? `${agencyInfo.operatingHours.start} - ${agencyInfo.operatingHours.end}`
        : '24/7';

      const payload = {
        agencyName: agencyInfo.agencyName,
        contactName: agencyInfo.contactName,
        email: agencyInfo.email,
        phone: agencyInfo.phone || '(555) 000-0000', // Default phone if empty (required field)
        address: agencyInfo.address || '',
        city: agencyInfo.city || '',
        state: agencyInfo.state || '',
        zipCode: agencyInfo.zipCode || '',
        capabilities: agencyInfo.capabilities,
        operatingHours: operatingHoursString,
      };

      console.log('TCC_DEBUG: Payload being sent:', payload);

      const response = await api.put('/api/auth/ems/agency/update', payload);
      console.log('TCC_DEBUG: Success response:', response.data);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Navigate to Available Trips tab after successful save
      if (onSaveSuccess) {
        setTimeout(() => onSaveSuccess(), 1000); // Small delay to show success message
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Agency Information</h3>
          <p className="text-sm text-gray-500">Update your agency contact information and settings</p>
        </div>
        
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Agency settings saved successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Agency Name & Contact Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700">
                  Agency Name *
                </label>
                <input
                  type="text"
                  id="agencyName"
                  name="agencyName"
                  value={agencyInfo.agencyName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                  Contact Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={agencyInfo.contactName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={agencyInfo.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={agencyInfo.phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={agencyInfo.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={agencyInfo.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <select
                  id="state"
                  name="state"
                  value={agencyInfo.state}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={agencyInfo.zipCode}
                  onChange={handleInputChange}
                  placeholder="12345"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Transport Capabilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Capabilities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {capabilities.map((capability) => (
                  <label key={capability} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agencyInfo.capabilities.includes(capability)}
                      onChange={() => handleCapabilityChange(capability)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{capability}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Hours
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="operatingHours.start" className="block text-sm text-gray-600">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="operatingHours.start"
                    name="operatingHours.start"
                    value={agencyInfo.operatingHours.start}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="operatingHours.end" className="block text-sm text-gray-600">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="operatingHours.end"
                    name="operatingHours.end"
                    value={agencyInfo.operatingHours.end}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Set to 00:00 - 23:59 for 24/7 operation</p>
            </div>

            {/* Notification Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Preferences
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={agencyInfo.emailNotifications}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Email Notifications</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={agencyInfo.smsNotifications}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">SMS Notifications</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencySettings;
