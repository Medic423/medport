import React, { useState, useEffect } from 'react';

interface AgencyProfileData {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea?: any;
  operatingHours?: any;
  capabilities?: any;
  pricingStructure?: any;
}

interface ProfileFormData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: any;
  operatingHours: any;
  capabilities: any;
  pricingStructure: any;
}

const AgencyProfile: React.FC = () => {
  const [profile, setProfile] = useState<AgencyProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceArea: {},
    operatingHours: {},
    capabilities: {},
    pricingStructure: {}
  });

  const agency = JSON.parse(localStorage.getItem('agency') || '{}');
  const agencyToken = localStorage.getItem('agency_token');
  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
    } else {
      loadProfile();
    }
  }, []);

  const loadDemoData = () => {
    // Demo data for testing
    const demoProfile: AgencyProfileData = {
      id: '1',
      name: 'Demo Transport Agency',
      contactName: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john@demoagency.com',
      address: '123 Main Street',
      city: 'Altoona',
      state: 'PA',
      zipCode: '16601',
      serviceArea: {
        primary: {
          name: 'Central Pennsylvania',
          description: 'Primary service area covering Altoona, State College, and surrounding areas',
          coverageRadius: 75,
          counties: ['Blair', 'Centre', 'Huntingdon', 'Bedford'],
          cities: ['Altoona', 'State College', 'Huntingdon', 'Bedford']
        },
        secondary: {
          name: 'Extended Coverage',
          description: 'Secondary service area for long-distance transports',
          coverageRadius: 150,
          counties: ['Cambria', 'Somerset', 'Clearfield', 'Mifflin'],
          cities: ['Johnstown', 'Somerset', 'Clearfield', 'Lewistown']
        }
      },
      operatingHours: {
        primary: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          hours: '6:00 AM - 6:00 PM',
          emergencyCoverage: '24/7'
        },
        secondary: {
          days: ['Saturday', 'Sunday'],
          hours: '8:00 AM - 4:00 PM',
          emergencyCoverage: '24/7'
        }
      },
      capabilities: {
        transportLevels: ['BLS', 'ALS', 'CCT'],
        specialCapabilities: [
          'Ventilator support',
          'Cardiac monitoring',
          'IV therapy',
          'Pediatric transport',
          'Bariatric transport',
          'Infectious disease protocols'
        ],
        equipment: [
          'Ventilators',
          'Cardiac monitors',
          'IV pumps',
          'Suction units',
          'Oxygen concentrators',
          'Stretchers and wheelchairs'
        ]
      },
      pricingStructure: {
        baseRates: {
          BLS: 150,
          ALS: 250,
          CCT: 400
        },
        mileageRates: {
          base: 3.50,
          longDistance: 2.75,
          longDistanceThreshold: 50
        },
        additionalCharges: {
          afterHours: 50,
          holiday: 75,
          emergency: 100,
          specialEquipment: 25
        }
      }
    };

    setProfile(demoProfile);
    setFormData({
      name: demoProfile.name,
      contactName: demoProfile.contactName,
      phone: demoProfile.phone,
      email: demoProfile.email,
      address: demoProfile.address,
      city: demoProfile.city,
      state: demoProfile.state,
      zipCode: demoProfile.zipCode,
      serviceArea: demoProfile.serviceArea,
      operatingHours: demoProfile.operatingHours,
      capabilities: demoProfile.capabilities,
      pricingStructure: demoProfile.pricingStructure
    });
    setIsLoading(false);
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agency/profile', {
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setFormData({
        name: data.profile.name,
        contactName: data.profile.contactName,
        phone: data.profile.phone,
        email: data.profile.email,
        address: data.profile.address,
        city: data.profile.city,
        state: data.profile.state,
        zipCode: data.profile.zipCode,
        serviceArea: data.profile.serviceArea || {},
        operatingHours: data.profile.operatingHours || {},
        capabilities: data.profile.capabilities || {},
        pricingStructure: data.profile.pricingStructure || {}
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (isDemoMode) {
        // Update demo data
        setProfile(prev => prev ? { ...prev, ...formData } : null);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully (Demo Mode)');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      const response = await fetch('/api/agency/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await loadProfile();
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        contactName: profile.contactName,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        serviceArea: profile.serviceArea || {},
        operatingHours: profile.operatingHours || {},
        capabilities: profile.capabilities || {},
        pricingStructure: profile.pricingStructure || {}
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">⚠️</span>
        <p className="text-lg font-medium text-gray-900">Profile not found</p>
        <p className="text-gray-600">Unable to load agency profile information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agency Profile</h2>
          <p className="text-gray-600">Manage your agency information, capabilities, and service areas</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.contactName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.email}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.zipCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Areas</h3>
        {profile.serviceArea && (
          <div className="space-y-4">
            {Object.entries(profile.serviceArea).map(([key, area]: [string, any]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize mb-2">{key} Service Area</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-600">{area.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Coverage Radius:</span>
                    <p className="text-gray-600">{area.coverageRadius} miles</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-600">{area.description}</p>
                  </div>
                  {area.counties && (
                    <div>
                      <span className="font-medium text-gray-700">Counties:</span>
                      <p className="text-gray-600">{area.counties.join(', ')}</p>
                    </div>
                  )}
                  {area.cities && (
                    <div>
                      <span className="font-medium text-gray-700">Cities:</span>
                      <p className="text-gray-600">{area.cities.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h3>
        {profile.operatingHours && (
          <div className="space-y-4">
            {Object.entries(profile.operatingHours).map(([key, hours]: [string, any]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize mb-2">{key} Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Days:</span>
                    <p className="text-gray-600">{Array.isArray(hours.days) ? hours.days.join(', ') : hours.days}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hours:</span>
                    <p className="text-gray-600">{hours.hours}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Emergency Coverage:</span>
                    <p className="text-gray-600">{hours.emergencyCoverage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Capabilities</h3>
        {profile.capabilities && (
          <div className="space-y-4">
            <div>
              <span className="font-medium text-gray-700">Transport Levels:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.capabilities.transportLevels?.map((level: string) => (
                  <span key={level} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {level}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-700">Special Capabilities:</span>
              <ul className="mt-2 space-y-1">
                {profile.capabilities.specialCapabilities?.map((capability: string, index: number) => (
                  <li key={index} className="text-gray-600 text-sm">• {capability}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-medium text-gray-700">Equipment:</span>
              <ul className="mt-2 space-y-1">
                {profile.capabilities.equipment?.map((item: string, index: number) => (
                  <li key={index} className="text-gray-600 text-sm">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Structure */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Structure</h3>
        {profile.pricingStructure && (
          <div className="space-y-4">
            <div>
              <span className="font-medium text-gray-700">Base Rates:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {Object.entries(profile.pricingStructure.baseRates || {}).map(([level, rate]: [string, any]) => (
                  <div key={level} className="text-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{level}</span>
                    <p className="text-lg font-semibold text-gray-900">${rate}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Mileage Rates:</span>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-gray-600">Base: ${profile.pricingStructure.mileageRates?.base}/mile</p>
                  <p className="text-gray-600">Long Distance: ${profile.pricingStructure.mileageRates?.longDistance}/mile (after {profile.pricingStructure.mileageRates?.longDistanceThreshold} miles)</p>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Additional Charges:</span>
                <div className="mt-2 space-y-1 text-sm">
                  {Object.entries(profile.pricingStructure.additionalCharges || {}).map(([charge, amount]: [string, any]) => (
                    <p key={charge} className="text-gray-600 capitalize">
                      {charge.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${amount}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyProfile;
