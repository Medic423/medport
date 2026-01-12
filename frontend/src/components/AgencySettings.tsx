import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, MapPin, RefreshCw } from 'lucide-react';
import api from '../services/api';

interface AgencySettingsUser {
  id: string;
  email: string;
  name: string;
  userType: string;
  agencyName?: string;
  agencyId?: string;
  orgAdmin?: boolean;
}

interface AgencySaveSuccessPayload {
  user: AgencySettingsUser;
  token?: string;
  emailChanged?: boolean;
}

interface AgencySettingsProps {
  user: AgencySettingsUser;
  onSaveSuccess?: (payload: AgencySaveSuccessPayload) => void;
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
  latitude: number | null;
  longitude: number | null;
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
    latitude: null,
    longitude: null,
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
  const [successMessage, setSuccessMessage] = useState('Agency settings saved successfully!');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

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

  // Load agency data on mount
  useEffect(() => {
    const loadAgencyData = async () => {
      try {
        const response = await api.get('/api/auth/ems/agency/info');
        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          setAgencyInfo(prev => ({
            ...prev,
            agencyName: data.agencyName || user.agencyName || '',
            contactName: data.contactName || user.name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || prev.state || 'PA',
            zipCode: data.zipCode || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
            operatingHours: data.operatingHours && typeof data.operatingHours === 'object'
              ? {
                  start: data.operatingHours.start || '00:00',
                  end: data.operatingHours.end || '23:59'
                }
              : prev.operatingHours,
            smsNotifications: data.smsNotifications !== undefined ? data.smsNotifications : prev.smsNotifications
          }));
        } else {
          // Fallback to user data if API fails
          setAgencyInfo(prev => ({
            ...prev,
            agencyName: user.agencyName || '',
            contactName: user.name || '',
            email: user.email || ''
          }));
        }
      } catch (error) {
        console.error('Error loading agency data:', error);
        // Fallback to user data on error
        setAgencyInfo(prev => ({
          ...prev,
          agencyName: user.agencyName || '',
          contactName: user.name || '',
          email: user.email || ''
        }));
      }
    };

    loadAgencyData();
  }, [user.agencyName, user.name, user.email]);

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

  // Geocode address to get coordinates using backend geocoding API endpoint
  // Backend handles multiple address variations and rate limiting
  const geocodeAddress = async () => {
    if (!agencyInfo.address || !agencyInfo.city || !agencyInfo.state || !agencyInfo.zipCode) {
      setGeocodeError('Please fill in address, city, state, and ZIP code before geocoding.');
      return;
    }

    setGeocoding(true);
    setGeocodeError(null);

    try {
      console.log('TCC_DEBUG: Geocoding agency address:', {
        address: agencyInfo.address,
        city: agencyInfo.city,
        state: agencyInfo.state,
        zipCode: agencyInfo.zipCode,
        agencyName: agencyInfo.agencyName
      });

      // Use backend geocoding endpoint which handles multiple variations and rate limiting
      // Add timeout wrapper to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Geocoding request timed out after 30 seconds')), 30000);
      });

      const geocodePromise = api.post('/api/public/geocode', {
        address: agencyInfo.address,
        city: agencyInfo.city,
        state: agencyInfo.state,
        zipCode: agencyInfo.zipCode,
        facilityName: agencyInfo.agencyName
      });

      const response = await Promise.race([geocodePromise, timeoutPromise]) as any;

      if (response.data.success) {
        const { latitude, longitude } = response.data.data;
        setAgencyInfo(prev => ({
          ...prev,
          latitude: latitude,
          longitude: longitude
        }));
        setGeocodeError(null);
        console.log('TCC_DEBUG: Geocoding successful:', { latitude, longitude });
      } else {
        const errorMsg = response.data.error || 'Could not find coordinates for this address. You can still save settings and add coordinates manually.';
        setGeocodeError(errorMsg);
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Geocoding error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to lookup coordinates. You can still save settings and add coordinates manually.';
      
      if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Geocoding request timed out. You can still save settings and add coordinates manually.';
      } else if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        if (backendError.includes('HTTP 429') || backendError.includes('Too Many Requests')) {
          errorMessage = 'Too many geocoding requests. Please try again later or enter coordinates manually.';
        } else if (backendError.includes('HTTP 503') || backendError.includes('Service Unavailable')) {
          errorMessage = 'Geocoding service is temporarily unavailable. Please try again later or enter coordinates manually.';
        } else if (backendError.includes('No results found') || backendError.includes('Could not find coordinates')) {
          errorMessage = 'Could not find coordinates for this address. You can still save settings and add coordinates manually.';
        } else {
          errorMessage = backendError + ' You can still save settings and add coordinates manually.';
        }
      } else if (error.message) {
        errorMessage = error.message + ' You can still save settings and add coordinates manually.';
      }
      
      setGeocodeError(errorMessage);
    } finally {
      setGeocoding(false);
    }
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
        latitude: agencyInfo.latitude,
        longitude: agencyInfo.longitude,
        capabilities: agencyInfo.capabilities,
        operatingHours: operatingHoursString,
        smsNotifications: agencyInfo.smsNotifications, // Include SMS notifications preference
      };

      console.log('TCC_DEBUG: Payload being sent:', payload);

      const response = await api.put('/api/auth/ems/agency/update', payload);
      console.log('TCC_DEBUG: Success response:', response.data);

      if (response.data?.success) {
        setSuccessMessage(response.data.emailChanged ? 'Agency settings saved. Login email updated successfully.' : 'Agency settings saved successfully!');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);

        // Reload agency data to get updated capabilities and other fields
        try {
          const reloadResponse = await api.get('/api/auth/ems/agency/info');
          if (reloadResponse.data?.success && reloadResponse.data?.data) {
            const data = reloadResponse.data.data;
            setAgencyInfo(prev => ({
              ...prev,
              agencyName: data.agencyName || prev.agencyName,
              contactName: data.contactName || prev.contactName,
              email: data.email || prev.email,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              city: data.city || prev.city,
              state: data.state || prev.state,
              zipCode: data.zipCode || prev.zipCode,
              latitude: data.latitude !== undefined ? data.latitude : prev.latitude,
              longitude: data.longitude !== undefined ? data.longitude : prev.longitude,
              capabilities: Array.isArray(data.capabilities) ? data.capabilities : prev.capabilities,
              operatingHours: data.operatingHours && typeof data.operatingHours === 'object'
                ? {
                    start: data.operatingHours.start || prev.operatingHours.start,
                    end: data.operatingHours.end || prev.operatingHours.end
                  }
                : prev.operatingHours,
              smsNotifications: data.smsNotifications !== undefined ? data.smsNotifications : prev.smsNotifications
            }));
          }
        } catch (reloadError) {
          console.error('Error reloading agency data after save:', reloadError);
          // Continue even if reload fails
        }

        if (response.data?.data) {
          const updatedUser: AgencySettingsUser = {
            id: response.data.data.id,
            email: response.data.data.email,
            name: response.data.data.name,
            userType: response.data.data.userType,
            agencyName: response.data.data.agencyName,
            agencyId: response.data.data.agencyId,
            orgAdmin: response.data.data.orgAdmin,
          };

          onSaveSuccess?.({
            user: updatedUser,
            token: response.data.token,
            emailChanged: response.data.emailChanged,
          });
        } else {
          onSaveSuccess?.({
            user,
            token: response.data.token,
            emailChanged: response.data.emailChanged,
          });
        }
      } else {
        const apiError = response.data?.error || 'Failed to save settings. Please try again.';
        setError(apiError);
        throw new Error(apiError);
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save settings. Please try again.');
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
                    {successMessage}
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

            {/* Geolocation Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-medium text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                    Home Base Coordinates
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Required for route optimization. Coordinates are used to calculate return trip distances.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={geocodeAddress}
                  disabled={geocoding || !agencyInfo.address || !agencyInfo.city || !agencyInfo.state}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {geocoding ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Geocoding...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Coordinates from Address
                    </>
                  )}
                </button>
              </div>

              {geocodeError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">{geocodeError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={agencyInfo.latitude ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAgencyInfo(prev => ({
                        ...prev,
                        latitude: value === '' ? null : parseFloat(value)
                      }));
                    }}
                    step="any"
                    placeholder="40.123456"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Decimal degrees (e.g., 40.123456)
                  </p>
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={agencyInfo.longitude ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAgencyInfo(prev => ({
                        ...prev,
                        longitude: value === '' ? null : parseFloat(value)
                      }));
                    }}
                    step="any"
                    placeholder="-78.123456"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Decimal degrees (e.g., -78.123456)
                  </p>
                </div>
              </div>

              {agencyInfo.latitude && agencyInfo.longitude && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Coordinates Set</p>
                      <p className="text-xs text-green-700 mt-1">
                        {agencyInfo.latitude.toFixed(6)}, {agencyInfo.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(!agencyInfo.latitude || !agencyInfo.longitude) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Coordinates Required</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Home base coordinates are required for route optimization features. Click "Get Coordinates from Address" to automatically geocode your address, or enter coordinates manually.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                    Start Time (24-hour format)
                  </label>
                  <input
                    type="time"
                    id="operatingHours.start"
                    name="operatingHours.start"
                    value={agencyInfo.operatingHours.start}
                    onChange={handleInputChange}
                    step="60"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="operatingHours.end" className="block text-sm text-gray-600">
                    End Time (24-hour format)
                  </label>
                  <input
                    type="time"
                    id="operatingHours.end"
                    name="operatingHours.end"
                    value={agencyInfo.operatingHours.end}
                    onChange={handleInputChange}
                    step="60"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use 24-hour format (00:00 to 23:59). Set to 00:00 - 23:59 for 24/7 operation.
                {typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) && (
                  <span className="block mt-1 text-orange-600">Note: Your browser may display times in 12-hour format, but values are stored in 24-hour format.</span>
                )}
              </p>
            </div>

            {/* Notification Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Preferences
              </label>
              <div className="space-y-2">
                {/* Email notifications removed - only SMS is used */}
                {/* <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={agencyInfo.emailNotifications}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Email Notifications</span>
                </label> */}
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
