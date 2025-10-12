import React, { useState, useEffect } from 'react';
import { Settings, Calculator } from 'lucide-react';
import api from '../services/api';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('settings');

  const tabs = [
    { id: 'settings', name: 'Revenue Settings', icon: Settings },
    { id: 'calculator', name: 'Trip Calculator', icon: Calculator },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure revenue settings and calculate trip revenue for route planning.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' && <RevenueSettingsTab />}
      {activeTab === 'calculator' && <TripCalculatorTab />}
    </div>
  );
};

const RevenueSettingsTab: React.FC = () => {
  const [revenueSettings, setRevenueSettings] = useState({
    baseRates: {
      BLS: 150.0,
      ALS: 250.0,
      CCT: 400.0
    },
    perMileRates: {
      BLS: 2.50,
      ALS: 3.75,
      CCT: 5.00
    },
    priorityMultipliers: {
      LOW: 1.0,
      MEDIUM: 1.1,
      HIGH: 1.25,
      URGENT: 1.5
    },
    specialSurcharge: 50.0,
    insuranceRates: {
      medicare: { BLS: 120.0, ALS: 200.0, CCT: 350.0 },
      medicaid: { BLS: 100.0, ALS: 180.0, CCT: 300.0 },
      private: { BLS: 180.0, ALS: 300.0, CCT: 450.0 },
      selfPay: { BLS: 200.0, ALS: 350.0, CCT: 500.0 }
    }
  });
  const [revenuePreview, setRevenuePreview] = useState<any>(null);

  const handleRevenueSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [category, subcategory] = name.split('.');
    
    if (subcategory) {
      setRevenueSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev],
          [subcategory]: parseFloat(value) || 0
        }
      }));
    } else {
      setRevenueSettings(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
    
    calculateRevenuePreview();
  };

  const calculateRevenuePreview = () => {
    const sampleTrip = {
      transportLevel: 'ALS',
      priority: 'MEDIUM',
      distanceMiles: 15.0,
      specialRequirements: false,
      insuranceCompany: 'medicare'
    };

    const baseRate = revenueSettings.baseRates[sampleTrip.transportLevel as keyof typeof revenueSettings.baseRates];
    const perMileRate = revenueSettings.perMileRates[sampleTrip.transportLevel as keyof typeof revenueSettings.perMileRates];
    const priorityMultiplier = revenueSettings.priorityMultipliers[sampleTrip.priority as keyof typeof revenueSettings.priorityMultipliers];
    const insuranceRate = revenueSettings.insuranceRates[sampleTrip.insuranceCompany as keyof typeof revenueSettings.insuranceRates][sampleTrip.transportLevel as keyof typeof revenueSettings.insuranceRates.medicare];
    
    const specialSurcharge = sampleTrip.specialRequirements ? revenueSettings.specialSurcharge : 0;
    
    const standardRevenue = (baseRate * priorityMultiplier + specialSurcharge);
    const mileageRevenue = (baseRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;
    const insuranceRevenue = (insuranceRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;

    setRevenuePreview({
      sampleTrip,
      standardRevenue: Math.round(standardRevenue * 100) / 100,
      mileageRevenue: Math.round(mileageRevenue * 100) / 100,
      insuranceRevenue: Math.round(insuranceRevenue * 100) / 100
    });
  };

  useEffect(() => {
    calculateRevenuePreview();
  }, [revenueSettings]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Revenue Settings</h3>
          <p className="text-sm text-gray-500">Configure global pricing rates for revenue calculations</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Base Rates */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Base Rates by Transport Level</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">BLS Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.BLS}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.BLS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ALS Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.ALS}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.ALS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CCT Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.CCT}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.CCT"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Per Mile Rates */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Per Mile Rates</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">BLS Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.BLS}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.BLS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ALS Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.ALS}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.ALS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CCT Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.CCT}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.CCT"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Preview */}
          {revenuePreview && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Revenue Preview</h4>
              <p className="text-sm text-gray-600 mb-4">
                Sample trip: {revenuePreview.sampleTrip.transportLevel} transport, {revenuePreview.sampleTrip.priority} priority, 
                {revenuePreview.sampleTrip.distanceMiles} miles, {revenuePreview.sampleTrip.insuranceCompany} insurance
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Standard Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${revenuePreview.standardRevenue}</p>
                  <p className="text-xs text-gray-500">Base rate × priority</p>
                </div>
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Mileage Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${revenuePreview.mileageRevenue}</p>
                  <p className="text-xs text-gray-500">Base + (per mile × distance)</p>
                </div>
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Insurance Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${revenuePreview.insuranceRevenue}</p>
                  <p className="text-xs text-gray-500">Insurance rate + mileage</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                localStorage.setItem('tcc_revenue_settings', JSON.stringify(revenueSettings));
                alert('Revenue settings saved!');
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Revenue Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TripCalculatorTab: React.FC = () => {
  const [tripData, setTripData] = useState({
    origin: '',
    destination: '',
    originCoordinates: null as { lat: number; lng: number } | null,
    destinationCoordinates: null as { lat: number; lng: number } | null,
    transportLevel: 'ALS',
    priority: 'MEDIUM',
    distanceMiles: 0,
    specialRequirements: false,
    insuranceCompany: 'medicare'
  });
  
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [manualOrigin, setManualOrigin] = useState('');
  const [manualDestination, setManualDestination] = useState('');
  
  const [revenueSettings, setRevenueSettings] = useState({
    baseRates: { BLS: 150.0, ALS: 250.0, CCT: 400.0 },
    perMileRates: { BLS: 2.50, ALS: 3.75, CCT: 5.00 },
    priorityMultipliers: { LOW: 1.0, MEDIUM: 1.1, HIGH: 1.25, URGENT: 1.5 },
    specialSurcharge: 50.0,
    insuranceRates: {
      medicare: { BLS: 120.0, ALS: 200.0, CCT: 350.0 },
      medicaid: { BLS: 100.0, ALS: 180.0, CCT: 300.0 },
      private: { BLS: 180.0, ALS: 300.0, CCT: 450.0 },
      selfPay: { BLS: 200.0, ALS: 350.0, CCT: 500.0 }
    }
  });

  const [calculatedRevenue, setCalculatedRevenue] = useState<any>(null);

  // Load revenue settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('tcc_revenue_settings');
    if (savedSettings) {
      setRevenueSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Load facilities on component mount
  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoadingFacilities(true);
      const response = await api.get('/api/public/hospitals');
      if (response.data?.success) {
        setFacilities(response.data.data || []);
        console.log('TCC_DEBUG: Loaded facilities for trip calculator:', response.data.data?.length);
      }
    } catch (error) {
      console.error('Error loading facilities:', error);
    } finally {
      setLoadingFacilities(false);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Geocode address using browser's geolocation API (simplified for demo)
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    // For now, return null - in a real implementation, you'd use Google Maps API or similar
    // This is a placeholder for the geocoding functionality
    console.log('TCC_DEBUG: Geocoding address:', address);
    return null;
  };

  const handleTripDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTripData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFacilitySelection = (field: 'origin' | 'destination', facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    if (facility) {
      setTripData(prev => ({
        ...prev,
        [field]: facility.name,
        [`${field}Coordinates`]: facility.latitude && facility.longitude ? 
          { lat: parseFloat(facility.latitude), lng: parseFloat(facility.longitude) } : null
      }));
      
      // Clear manual entry for this field
      if (field === 'origin') setManualOrigin('');
      if (field === 'destination') setManualDestination('');
      
      // Auto-calculate distance if both coordinates are available
      if (field === 'destination' && tripData.originCoordinates) {
        const distance = calculateDistance(
          tripData.originCoordinates.lat, tripData.originCoordinates.lng,
          parseFloat(facility.latitude), parseFloat(facility.longitude)
        );
        setTripData(prev => ({ ...prev, distanceMiles: Math.round(distance * 10) / 10 }));
      } else if (field === 'origin' && tripData.destinationCoordinates) {
        const distance = calculateDistance(
          parseFloat(facility.latitude), parseFloat(facility.longitude),
          tripData.destinationCoordinates.lat, tripData.destinationCoordinates.lng
        );
        setTripData(prev => ({ ...prev, distanceMiles: Math.round(distance * 10) / 10 }));
      }
    }
  };

  const handleManualAddress = async (field: 'origin' | 'destination', address: string) => {
    if (field === 'origin') {
      setManualOrigin(address);
      setTripData(prev => ({ ...prev, origin: address }));
    } else {
      setManualDestination(address);
      setTripData(prev => ({ ...prev, destination: address }));
    }
    
    // Try to geocode the address
    const coordinates = await geocodeAddress(address);
    if (coordinates) {
      setTripData(prev => ({
        ...prev,
        [`${field}Coordinates`]: coordinates
      }));
      
      // Auto-calculate distance if both coordinates are available
      if (field === 'destination' && tripData.originCoordinates) {
        const distance = calculateDistance(
          tripData.originCoordinates.lat, tripData.originCoordinates.lng,
          coordinates.lat, coordinates.lng
        );
        setTripData(prev => ({ ...prev, distanceMiles: Math.round(distance * 10) / 10 }));
      } else if (field === 'origin' && tripData.destinationCoordinates) {
        const distance = calculateDistance(
          coordinates.lat, coordinates.lng,
          tripData.destinationCoordinates.lat, tripData.destinationCoordinates.lng
        );
        setTripData(prev => ({ ...prev, distanceMiles: Math.round(distance * 10) / 10 }));
      }
    }
  };

  const calculateRevenue = () => {
    if (!tripData.origin || !tripData.destination || tripData.distanceMiles <= 0) {
      alert('Please fill in all required fields: Origin, Destination, and Distance');
      return;
    }

    const baseRate = revenueSettings.baseRates[tripData.transportLevel as keyof typeof revenueSettings.baseRates];
    const perMileRate = revenueSettings.perMileRates[tripData.transportLevel as keyof typeof revenueSettings.perMileRates];
    const priorityMultiplier = revenueSettings.priorityMultipliers[tripData.priority as keyof typeof revenueSettings.priorityMultipliers];
    const insuranceRate = revenueSettings.insuranceRates[tripData.insuranceCompany as keyof typeof revenueSettings.insuranceRates][tripData.transportLevel as keyof typeof revenueSettings.insuranceRates.medicare];
    
    const specialSurcharge = tripData.specialRequirements ? revenueSettings.specialSurcharge : 0;
    
    const standardRevenue = (baseRate * priorityMultiplier + specialSurcharge);
    const mileageRevenue = (baseRate + (perMileRate * tripData.distanceMiles) + specialSurcharge) * priorityMultiplier;
    const insuranceRevenue = (insuranceRate + (perMileRate * tripData.distanceMiles) + specialSurcharge) * priorityMultiplier;

    setCalculatedRevenue({
      standardRevenue: Math.round(standardRevenue * 100) / 100,
      mileageRevenue: Math.round(mileageRevenue * 100) / 100,
      insuranceRevenue: Math.round(insuranceRevenue * 100) / 100,
      tripDetails: { ...tripData }
    });
  };

  const saveRoute = () => {
    if (!tripData.origin || !tripData.destination) {
      alert('Please enter origin and destination to save this route');
      return;
    }

    const routeName = `${tripData.origin} → ${tripData.destination}`;
    const savedRoutes = JSON.parse(localStorage.getItem('tcc_saved_routes') || '[]');
    
    const existingRoute = savedRoutes.find((route: any) => route.name === routeName);
    if (existingRoute) {
      if (confirm(`Route "${routeName}" already exists. Overwrite it?`)) {
        const updatedRoutes = savedRoutes.map((route: any) => 
          route.name === routeName ? { ...route, tripData, lastUpdated: new Date().toISOString() } : route
        );
        localStorage.setItem('tcc_saved_routes', JSON.stringify(updatedRoutes));
        alert(`Route "${routeName}" updated successfully!`);
      }
    } else {
      const newRoute = {
        name: routeName,
        tripData: { ...tripData },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      savedRoutes.push(newRoute);
      localStorage.setItem('tcc_saved_routes', JSON.stringify(savedRoutes));
      alert(`Route "${routeName}" saved successfully!`);
    }
  };

  const loadSavedRoutes = () => {
    const savedRoutes = JSON.parse(localStorage.getItem('tcc_saved_routes') || '[]');
    return savedRoutes;
  };

  const loadRoute = (route: any) => {
    setTripData(route.tripData);
    setCalculatedRevenue(null);
  };

  const deleteRoute = (routeName: string) => {
    if (confirm(`Delete route "${routeName}"?`)) {
      const savedRoutes = JSON.parse(localStorage.getItem('tcc_saved_routes') || '[]');
      const updatedRoutes = savedRoutes.filter((route: any) => route.name !== routeName);
      localStorage.setItem('tcc_saved_routes', JSON.stringify(updatedRoutes));
      alert(`Route "${routeName}" deleted successfully!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Saved Routes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Saved Routes</h3>
          <p className="text-sm text-gray-500">Load previously saved routes for quick calculations</p>
        </div>
        <div className="p-6">
          {loadSavedRoutes().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadSavedRoutes().map((route: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <h4 className="font-medium text-gray-900">{route.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {route.tripData.transportLevel} • {route.tripData.priority} • {route.tripData.distanceMiles} miles
                  </p>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => loadRoute(route)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteRoute(route.name)}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No saved routes yet. Create and save a route to see it here.</p>
          )}
        </div>
      </div>

      {/* Trip Calculator Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Trip Revenue Calculator</h3>
          <p className="text-sm text-gray-500">Calculate revenue for a specific trip</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Trip Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Origin *</label>
                <div className="space-y-2">
                  <select
                    value={facilities.find(f => f.name === tripData.origin)?.id || ''}
                    onChange={(e) => handleFacilitySelection('origin', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingFacilities}
                  >
                    <option value="">Select from known facilities...</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name} - {facility.city}, {facility.state}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-500">OR</div>
                  <input
                    type="text"
                    value={manualOrigin}
                    onChange={(e) => handleManualAddress('origin', e.target.value)}
                    placeholder="Enter custom address (GPS coordinates will be looked up)"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {tripData.originCoordinates && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ GPS coordinates available ({tripData.originCoordinates.lat.toFixed(4)}, {tripData.originCoordinates.lng.toFixed(4)})
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination *</label>
                <div className="space-y-2">
                  <select
                    value={facilities.find(f => f.name === tripData.destination)?.id || ''}
                    onChange={(e) => handleFacilitySelection('destination', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingFacilities}
                  >
                    <option value="">Select from known facilities...</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name} - {facility.city}, {facility.state}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-500">OR</div>
                  <input
                    type="text"
                    value={manualDestination}
                    onChange={(e) => handleManualAddress('destination', e.target.value)}
                    placeholder="Enter custom address (GPS coordinates will be looked up)"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {tripData.destinationCoordinates && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ GPS coordinates available ({tripData.destinationCoordinates.lat.toFixed(4)}, {tripData.destinationCoordinates.lng.toFixed(4)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Distance (miles) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="distanceMiles"
                  value={tripData.distanceMiles}
                  onChange={handleTripDataChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {tripData.originCoordinates && tripData.destinationCoordinates ? 
                    '✓ Distance auto-calculated from GPS coordinates' : 
                    'Enter distance manually or select facilities with GPS coordinates for auto-calculation'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Transport Level</label>
                <select
                  name="transportLevel"
                  value={tripData.transportLevel}
                  onChange={handleTripDataChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="BLS">BLS</option>
                  <option value="ALS">ALS</option>
                  <option value="CCT">CCT</option>
                </select>
              </div>
            </div>

            {/* Right Column - Additional Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority Level</label>
                <select
                  name="priority"
                  value={tripData.priority}
                  onChange={handleTripDataChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Insurance Company</label>
                <select
                  name="insuranceCompany"
                  value={tripData.insuranceCompany}
                  onChange={handleTripDataChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="medicare">Medicare</option>
                  <option value="medicaid">Medicaid</option>
                  <option value="private">Private Insurance</option>
                  <option value="selfPay">Self Pay</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="specialRequirements"
                  checked={tripData.specialRequirements}
                  onChange={handleTripDataChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Special Requirements (adds ${revenueSettings.specialSurcharge} surcharge)
                </label>
              </div>

              <div className="pt-4">
                <button
                  onClick={calculateRevenue}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Calculate Revenue
                </button>
              </div>

              <div>
                <button
                  onClick={saveRoute}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save This Route
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {calculatedRevenue && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Revenue Calculation Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Standard Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${calculatedRevenue.standardRevenue}</p>
                  <p className="text-xs text-gray-500">Base rate × priority</p>
                </div>
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Mileage Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${calculatedRevenue.mileageRevenue}</p>
                  <p className="text-xs text-gray-500">Base + (per mile × distance)</p>
                </div>
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Insurance Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${calculatedRevenue.insuranceRevenue}</p>
                  <p className="text-xs text-gray-500">Insurance rate + mileage</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h6 className="text-sm font-medium text-blue-900">Trip Details:</h6>
                <p className="text-sm text-blue-800 mt-1">
                  {calculatedRevenue.tripDetails.transportLevel} transport from {calculatedRevenue.tripDetails.origin} to {calculatedRevenue.tripDetails.destination}
                  <br />
                  {calculatedRevenue.tripDetails.distanceMiles} miles • {calculatedRevenue.tripDetails.priority} priority • {calculatedRevenue.tripDetails.insuranceCompany} insurance
                  {calculatedRevenue.tripDetails.specialRequirements && ' • Special requirements included'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
