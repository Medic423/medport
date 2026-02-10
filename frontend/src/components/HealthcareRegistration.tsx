import React, { useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';

interface HealthcareRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

const HealthcareRegistration: React.FC<HealthcareRegistrationProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    facilityName: '',
    facilityType: '',
    manageMultipleLocations: false,
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [showCoordinateWarning, setShowCoordinateWarning] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null); // Separate error for GPS lookup

  const facilityTypes = [
    'Hospital',
    'Clinic',
    'Urgent Care',
    'Rehabilitation Facility',
    'Doctor\'s Office',
    'Dialysis Center',
    'Nursing Home',
    'Assisted Living',
    'Other'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Geocoding function using backend geocoding API endpoint
  // Backend handles multiple address variations and rate limiting
  const geocodeAddress = async () => {
    if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in address, city, state, and ZIP code before looking up coordinates');
      return;
    }

    setGeocoding(true);
    setGeocodingError(null); // Clear previous GPS lookup errors
    setError(null); // Also clear general errors

    console.log('TCC_DEBUG: Geocoding healthcare registration address:', {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      facilityName: formData.facilityName
    });

    try {
      // Increase timeout to 30 seconds to account for backend retries and rate limiting
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Geocoding request timed out after 30 seconds')), 30000);
      });

      const geocodePromise = api.post('/api/public/geocode', {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        facilityName: formData.facilityName
      });

      const response = await Promise.race([geocodePromise, timeoutPromise]) as any;

      if (response.data.success) {
        const { latitude, longitude } = response.data.data;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        setGeocodingError(null); // Clear any GPS errors
        setError(null);
        setShowCoordinateWarning(false); // Clear warning when coordinates are set
        console.log('TCC_DEBUG: Coordinates set successfully:', { latitude, longitude });
      } else {
        // Set GPS lookup error (non-blocking, informational only)
        setGeocodingError(response.data.error || 'No coordinates found for this address. You can still create the account and add coordinates later.');
      }
    } catch (err: any) {
      console.error('TCC_DEBUG: Geocoding error:', err);
      console.error('TCC_DEBUG: Geocoding error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        code: err.code
      });
      
      // Provide user-friendly error messages (non-blocking, informational only)
      let errorMessage = 'Failed to lookup coordinates. You can still create the account and add coordinates later.';
      
      if (err.message && err.message.includes('timeout')) {
        errorMessage = 'Geocoding request timed out. You can still create the account and add coordinates later via Facility Settings.';
      } else if (err.response?.data?.error) {
        const backendError = err.response.data.error;
        if (backendError.includes('HTTP 429') || backendError.includes('Too Many Requests')) {
          errorMessage = 'Too many geocoding requests. You can still create the account and add coordinates later.';
        } else if (backendError.includes('HTTP 503') || backendError.includes('Service Unavailable')) {
          errorMessage = 'Geocoding service is temporarily unavailable. You can still create the account and add coordinates later.';
        } else if (backendError.includes('No results found') || backendError.includes('Could not find coordinates')) {
          errorMessage = 'Could not find coordinates for this address. You can still create the account and add coordinates later via Facility Settings.';
        } else {
          errorMessage = backendError + ' You can still create the account and add coordinates later.';
        }
      } else if (err.message) {
        errorMessage = err.message + ' You can still create the account and add coordinates later.';
      }
      
      setGeocodingError(errorMessage); // Set as GPS lookup error, not blocking error
    } finally {
      setGeocoding(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Debug logging for email field to catch autofill issues
    if (name === 'email') {
      console.log('TCC_DEBUG: Email field onChange - value:', value, 'type:', type);
    }
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      // Clear warning if coordinates are now provided
      if ((name === 'latitude' || name === 'longitude') && updated.latitude && updated.longitude) {
        setShowCoordinateWarning(false);
      }
      
      // Debug logging for email field after state update
      if (name === 'email') {
        console.log('TCC_DEBUG: Email field state updated to:', updated.email);
      }
      
      return updated;
    });
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Log the actual value when field loses focus (after browser autofill might have occurred)
    console.log('TCC_DEBUG: Email field onBlur - actual value:', e.target.value);
    console.log('TCC_DEBUG: Email field onBlur - formData.email:', formData.email);
    
    // If browser autofilled a different value, update state
    if (e.target.value !== formData.email) {
      console.warn('TCC_DEBUG: Browser autofill detected! Updating state from', formData.email, 'to', e.target.value);
      setFormData(prev => ({
        ...prev,
        email: e.target.value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear any blocking errors
    setGeocodingError(null); // Clear GPS lookup errors (they're informational only)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Coordinate validation - only validate if coordinates are provided
    const hasCoordinates = formData.latitude && formData.longitude;
    
    if (hasCoordinates) {
      // Validate coordinate ranges only if coordinates are provided
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        setError('Please enter valid numeric coordinates.');
        setLoading(false);
        return;
      }

      if (lat < -90 || lat > 90) {
        setError('Latitude must be between -90 and 90 degrees.');
        setLoading(false);
        return;
      }

      if (lng < -180 || lng > 180) {
        setError('Longitude must be between -180 and 180 degrees.');
        setLoading(false);
        return;
      }
    } else {
      // Show warning if coordinates are missing, but allow submission
      setShowCoordinateWarning(true);
      setError(null); // Clear any previous errors
    }

    try {
      // Log the actual form data being submitted
      const submitData = {
        name: formData.contactName,
        email: formData.email,
        password: formData.password ? '[HIDDEN]' : '[MISSING]',
        facilityName: formData.facilityName,
        facilityType: formData.facilityType,
        manageMultipleLocations: formData.manageMultipleLocations,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      
      console.log('TCC_DEBUG: Submitting healthcare registration with data:', submitData);
      console.log('TCC_DEBUG: Email field value:', formData.email);
      console.log('TCC_DEBUG: Contact name:', formData.contactName);

      const response = await api.post('/api/auth/healthcare/register', {
        name: formData.contactName,
        email: formData.email,
        password: formData.password,
        facilityName: formData.facilityName,
        facilityType: formData.facilityType,
        manageMultipleLocations: formData.manageMultipleLocations, // ✅ NEW: Multi-location flag
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });

      const data = response.data;

      if (!data.success) {
        // Show the specific error message from the backend
        const errorMessage = data.error || data.message || 'Registration failed. Please try again.';
        throw new Error(errorMessage);
      }

      console.log('TCC_DEBUG: Healthcare registration successful:', data);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 5000); // Show success message for 5 seconds
    } catch (err: any) {
      console.error('Healthcare registration error:', err);
      // Show the specific error message
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Registration Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your healthcare facility account has been created successfully.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Email: <strong>{formData.email}</strong>
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">
                🎉 Your free trial is active!
              </p>
              <p className="text-sm text-blue-700">
                You have <strong>7 days</strong> to explore all TRACC features at no cost. After your trial ends, you can upgrade to a paid subscription to continue using the platform.
              </p>
              <a 
                href="/pricing" 
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800 underline"
              >
                View pricing plans →
              </a>
            </div>
            {!formData.latitude || !formData.longitude ? (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ GPS coordinates were not set. You can add them later in the Facility Settings menu after logging in.
                </p>
              </div>
            ) : null}
            <p className="mt-4 text-sm text-gray-600">
              You can now log in with your email and password to start using TRACC.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Healthcare Facility Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Register your healthcare facility to start using TCC
          </p>
        </div>

        {/* Free Trial Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                🎉 Start your 7-day free trial! Your account will be active immediately upon registration.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message (Blocking errors only) */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* GPS Lookup Error (Informational, non-blocking) */}
        {geocodingError && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-blue-800">{geocodingError}</p>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setGeocodingError(null)}
                    className="text-sm text-blue-800 hover:text-blue-900 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning Message for Missing Coordinates */}
        {showCoordinateWarning && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  This account will not have full functionality until GPS Coordinates are provided. You can add them in the Facility Settings menu after creating the account.
                </p>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCoordinateWarning(false)}
                    className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Healthcare Facility Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter your healthcare facility details to create an account
            </p>
          </div>
          <div className="px-6 py-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="facilityName" className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    id="facilityName"
                    name="facilityName"
                    required
                    value={formData.facilityName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter facility name"
                  />
                </div>
                <div>
                  <label htmlFor="facilityType" className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Type *
                  </label>
                  <select
                    id="facilityType"
                    name="facilityType"
                    required
                    value={formData.facilityType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select facility type</option>
                    {facilityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Location Checkbox */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="manageMultipleLocations"
                      name="manageMultipleLocations"
                      checked={formData.manageMultipleLocations}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="manageMultipleLocations" className="font-medium text-gray-900">
                      Manage Multiple Locations
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Check this if you manage multiple hospitals, clinics, or facilities that need to arrange transportation. 
                      You'll be able to add and manage all your locations after creating your account.
                    </p>
                    {formData.manageMultipleLocations && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-sm text-green-800">
                          ✓ You'll be able to add your locations in Settings after registration
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    required
                    autoComplete="off"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleEmailBlur}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  {/* Empty div for grid alignment */}
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="ZIP Code"
                  />
                </div>
              </div>


              {/* Location Coordinates */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-800">Location Coordinates</h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Location coordinates are required for agency distance calculations. You can either lookup coordinates automatically or enter them manually.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Tip:</strong> If the exact address doesn't work, try using just the facility name and city (e.g., "Hurley Medical Center, Flint, MI") or a well-known address format like "123 Main St, City, State 12345"
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* Geocoding Button */}
                  <div>
                    <button
                      type="button"
                      onClick={geocodeAddress}
                      disabled={geocoding || !formData.address?.trim() || !formData.city?.trim() || !formData.state?.trim() || !formData.zipCode?.trim()}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        geocoding || !formData.address?.trim() || !formData.city?.trim() || !formData.state?.trim() || !formData.zipCode?.trim()
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {geocoding ? (
                        <>
                          <div className="animate-spin -ml-1 mr-3 h-4 w-4 text-white">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          </div>
                          Looking up...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Lookup Coordinates
                        </>
                      )}
                    </button>
                    {(geocoding || !formData.address?.trim() || !formData.city?.trim() || !formData.state?.trim() || !formData.zipCode?.trim()) ? (
                      <p className="text-xs text-red-500 mt-1">
                        {geocoding ? 'Looking up coordinates...' : 
                         `Please fill in: ${[
                           !formData.address?.trim() && 'Address',
                           !formData.city?.trim() && 'City',
                           !formData.state?.trim() && 'State',
                           !formData.zipCode?.trim() && 'ZIP Code'
                         ].filter(Boolean).join(', ')}`}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Click to automatically find coordinates from your address
                      </p>
                    )}
                  </div>

                  {/* Manual Coordinate Entry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 40.1234"
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., -78.5678"
                      />
                    </div>
                  </div>
                  
                  {formData.latitude && formData.longitude && (
                    <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">
                      ✓ Coordinates set: {formData.latitude}, {formData.longitude}
                    </div>
                  )}
                  
                  {/* Manual Coordinate Entry Helper */}
                  <div className="mt-2 text-xs text-gray-600">
                    <p>
                      Need help finding coordinates? Visit{' '}
                      <a 
                        href="https://www.gps-coordinates.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        gps-coordinates.org
                      </a>
                      {' '}to look them up manually.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter password (min 8 characters)"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 inline" />
                  Back to Login Selection
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareRegistration;
