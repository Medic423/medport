import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface EMSTripCalculatorProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
    agencyId?: string;
  };
}

const EMSTripCalculator: React.FC<EMSTripCalculatorProps> = ({ user }) => {
  // Revenue settings state
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
    },
    customInsuranceCompanies: [] as Array<{ name: string; rates: { BLS: number; ALS: number; CCT: number } }>
  });

  const [revenuePreview, setRevenuePreview] = useState<any>(null);
  const [newInsuranceCompany, setNewInsuranceCompany] = useState({ name: '', rates: { BLS: '', ALS: '', CCT: '' } });
  const [editingCompany, setEditingCompany] = useState<number | null>(null);
  const [editCompanyData, setEditCompanyData] = useState({ name: '', rates: { BLS: '', ALS: '', CCT: '' } });

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
  const [calculatedRevenue, setCalculatedRevenue] = useState<any>(null);
  const [savedRoutesKey, setSavedRoutesKey] = React.useState(0);

  // Load revenue settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('tcc_revenue_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setRevenueSettings(prev => ({ ...prev, ...parsed }));
    }
  }, []);

  // Calculate revenue preview whenever settings change
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

  // Load facilities
  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoadingFacilities(true);
      const response = await api.get('/api/public/hospitals');
      if (response.data?.success) {
        const facilitiesData = response.data.data || [];
        setFacilities(facilitiesData);
        console.log('TCC_DEBUG: EMS loaded facilities:', facilitiesData.length);
      }
    } catch (error) {
      console.error('Error loading facilities:', error);
    } finally {
      setLoadingFacilities(false);
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal
  };

  const handleFacilitySelection = (field: 'origin' | 'destination', facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    if (facility) {
      const coordinates = facility.latitude && facility.longitude 
        ? { lat: facility.latitude, lng: facility.longitude }
        : null;
      
      setTripData(prev => {
        const updated = {
          ...prev,
          [field]: facility.name,
          [`${field}Coordinates`]: coordinates
        };

        // Auto-calculate distance if both have coordinates
        if (field === 'origin' && coordinates && prev.destinationCoordinates) {
          updated.distanceMiles = calculateDistance(
            coordinates.lat, coordinates.lng,
            prev.destinationCoordinates.lat, prev.destinationCoordinates.lng
          );
        } else if (field === 'destination' && coordinates && prev.originCoordinates) {
          updated.distanceMiles = calculateDistance(
            prev.originCoordinates.lat, prev.originCoordinates.lng,
            coordinates.lat, coordinates.lng
          );
        }

        return updated;
      });

      // Clear manual input
      if (field === 'origin') setManualOrigin('');
      if (field === 'destination') setManualDestination('');
    }
  };

  const handleManualAddress = (field: 'origin' | 'destination', value: string) => {
    if (field === 'origin') {
      setManualOrigin(value);
      setTripData(prev => ({ ...prev, origin: value, originCoordinates: null }));
    } else {
      setManualDestination(value);
      setTripData(prev => ({ ...prev, destination: value, destinationCoordinates: null }));
    }
  };

  const handleTripDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTripData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const calculateRevenue = () => {
    if (!tripData.origin || !tripData.destination || !tripData.distanceMiles) {
      alert('Please fill in origin, destination, and distance');
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
      tripDetails: tripData
    });
  };

  const resetCalculator = () => {
    setTripData({
      origin: '',
      destination: '',
      originCoordinates: null,
      destinationCoordinates: null,
      transportLevel: 'ALS',
      priority: 'MEDIUM',
      distanceMiles: 0,
      specialRequirements: false,
      insuranceCompany: 'medicare'
    });
    setManualOrigin('');
    setManualDestination('');
    setCalculatedRevenue(null);
  };

  // Load saved routes (filtered by agency)
  const loadSavedRoutes = () => {
    try {
      const routes = JSON.parse(localStorage.getItem('tcc_saved_routes') || '[]');
      // Filter routes by agency ID
      return routes.filter((route: any) => route.agencyId === user.agencyId || route.agencyId === user.id);
    } catch {
      return [];
    }
  };

  const saveRoute = () => {
    if (!tripData.origin || !tripData.destination) {
      alert('Please enter origin and destination to save this route');
      return;
    }

    const routeName = `${tripData.origin} → ${tripData.destination}`;
    const allRoutes = JSON.parse(localStorage.getItem('tcc_saved_routes') || '[]');
    
    const existingRoute = allRoutes.find((route: any) => route.name === routeName && (route.agencyId === user.agencyId || route.agencyId === user.id));
    if (existingRoute) {
      if (confirm(`Route "${routeName}" already exists. Overwrite it?`)) {
        const updatedRoutes = allRoutes.map((route: any) => 
          route.name === routeName && (route.agencyId === user.agencyId || route.agencyId === user.id)
            ? { ...route, tripData: { ...tripData }, lastUpdated: new Date().toISOString() }
            : route
        );
        localStorage.setItem('tcc_saved_routes', JSON.stringify(updatedRoutes));
        alert(`Route "${routeName}" updated successfully!`);
        refreshSavedRoutes();
      }
    } else {
      const newRoute = {
        name: routeName,
        agencyId: user.agencyId || user.id,
        agencyName: user.agencyName || user.name,
        tripData: { ...tripData },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      allRoutes.push(newRoute);
      localStorage.setItem('tcc_saved_routes', JSON.stringify(allRoutes));
      alert(`Route "${routeName}" saved successfully!`);
      refreshSavedRoutes();
    }
  };

  const loadRoute = (route: any) => {
    setTripData(route.tripData);
    setManualOrigin('');
    setManualDestination('');
    setCalculatedRevenue(null); // Clear previous results
  };

  const deleteRoute = (routeName: string) => {
    if (!confirm(`Delete route "${routeName}"?`)) return;

    const allRoutes = JSON.parse(localStorage.getItem('tcc_saved_routes') || '[]');
    const updatedRoutes = allRoutes.filter((r: any) => r.name !== routeName);
    localStorage.setItem('tcc_saved_routes', JSON.stringify(updatedRoutes));
    alert(`Route "${routeName}" deleted successfully!`);
    refreshSavedRoutes();
  };

  const refreshSavedRoutes = () => {
    setSavedRoutesKey(prev => prev + 1);
  };

  // Revenue settings handlers
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
  };

  const handleEditCompany = (index: number) => {
    const company = revenueSettings.customInsuranceCompanies[index];
    setEditingCompany(index);
    setEditCompanyData({ 
      name: company.name,
      rates: {
        BLS: company.rates.BLS.toString(),
        ALS: company.rates.ALS.toString(),
        CCT: company.rates.CCT.toString()
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editCompanyData.name.trim()) {
      alert('Please enter a company name');
      return;
    }
    if (!editCompanyData.rates.BLS || !editCompanyData.rates.ALS || !editCompanyData.rates.CCT) {
      alert('Please enter all three rates');
      return;
    }

    const updatedCompanies = [...revenueSettings.customInsuranceCompanies];
    updatedCompanies[editingCompany!] = {
      name: editCompanyData.name,
      rates: {
        BLS: parseFloat(editCompanyData.rates.BLS),
        ALS: parseFloat(editCompanyData.rates.ALS),
        CCT: parseFloat(editCompanyData.rates.CCT)
      }
    };

    setRevenueSettings(prev => ({
      ...prev,
      customInsuranceCompanies: updatedCompanies
    }));
    setEditingCompany(null);
    setEditCompanyData({ name: '', rates: { BLS: '', ALS: '', CCT: '' } });
  };

  const handleCancelEdit = () => {
    setEditingCompany(null);
    setEditCompanyData({ name: '', rates: { BLS: '', ALS: '', CCT: '' } });
  };

  const addInsuranceCompany = () => {
    if (!newInsuranceCompany.name.trim()) {
      alert('Please enter a company name');
      return;
    }
    if (!newInsuranceCompany.rates.BLS || !newInsuranceCompany.rates.ALS || !newInsuranceCompany.rates.CCT) {
      alert('Please enter all three rates (BLS, ALS, CCT)');
      return;
    }

    const newCompany = {
      name: newInsuranceCompany.name,
      rates: {
        BLS: parseFloat(newInsuranceCompany.rates.BLS),
        ALS: parseFloat(newInsuranceCompany.rates.ALS),
        CCT: parseFloat(newInsuranceCompany.rates.CCT)
      }
    };

    setRevenueSettings(prev => ({
      ...prev,
      customInsuranceCompanies: [...prev.customInsuranceCompanies, newCompany]
    }));

    setNewInsuranceCompany({ name: '', rates: { BLS: '', ALS: '', CCT: '' } });
    alert(`Insurance company "${newCompany.name}" added successfully!`);
  };

  const deleteInsuranceCompany = (index: number) => {
    const company = revenueSettings.customInsuranceCompanies[index];
    if (!confirm(`Delete ${company.name}?`)) return;

    setRevenueSettings(prev => ({
      ...prev,
      customInsuranceCompanies: prev.customInsuranceCompanies.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8">
      {/* Revenue Preview - At the top */}
      {revenuePreview && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-md border border-orange-100">
          <div className="px-6 py-4 border-b border-orange-200">
            <h3 className="text-xl font-bold text-gray-900">Revenue Preview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <h5 className="text-sm font-medium text-gray-700">Standard Rate</h5>
                <p className="text-2xl font-bold text-gray-900">${revenuePreview.standardRevenue}</p>
                <p className="text-xs text-gray-500">Base rate × priority</p>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <h5 className="text-sm font-medium text-gray-700">Mileage Rate</h5>
                <p className="text-2xl font-bold text-gray-900">${revenuePreview.mileageRevenue}</p>
                <p className="text-xs text-gray-500">Base + (per mile × distance)</p>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <h5 className="text-sm font-medium text-gray-700">Insurance Rate</h5>
                <p className="text-2xl font-bold text-gray-900">${revenuePreview.insuranceRevenue}</p>
                <p className="text-xs text-gray-500">Insurance rate + mileage</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
      {/* Saved Routes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">My Saved Routes</h3>
            <p className="text-sm text-gray-500">Load previously saved routes for quick calculations</p>
          </div>
          <button
            onClick={refreshSavedRoutes}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Refresh
          </button>
        </div>
        <div className="p-6">
          {loadSavedRoutes().length > 0 ? (
            <div key={savedRoutesKey} className="space-y-2">
              {loadSavedRoutes().map((route: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{route.name}</h4>
                    <p className="text-xs text-gray-500">
                      {route.tripData.origin} → {route.tripData.destination} • {route.tripData.transportLevel} • {route.tripData.priority} • {route.tripData.distanceMiles} miles
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => loadRoute(route)}
                      className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
                    placeholder="Enter custom address"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {tripData.originCoordinates && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs font-medium text-green-800">
                      ✓ GPS Coordinates: {tripData.originCoordinates.lat.toFixed(4)}, {tripData.originCoordinates.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination *</label>
                <div className="space-y-2">
                  <select
                    value={facilities.find(f => f.name === tripData.destination)?.id || ''}
                    onChange={(e) => handleFacilitySelection('destination', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
                    placeholder="Enter custom address"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {tripData.destinationCoordinates && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs font-medium text-green-800">
                      ✓ GPS Coordinates: {tripData.destinationCoordinates.lat.toFixed(4)}, {tripData.destinationCoordinates.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Distance (miles) *
                  {tripData.originCoordinates && tripData.destinationCoordinates && (
                    <span className="ml-2 text-xs text-green-600 font-normal">✓ Auto-calculated</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="distanceMiles"
                  value={tripData.distanceMiles || ''}
                  onChange={handleTripDataChange}
                  disabled={!!(tripData.originCoordinates && tripData.destinationCoordinates)}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                    tripData.originCoordinates && tripData.destinationCoordinates 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : ''
                  }`}
                />
              </div>
            </div>

            {/* Right Column - Additional Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Transport Level *</label>
                <select
                  name="transportLevel"
                  value={tripData.transportLevel}
                  onChange={handleTripDataChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="BLS">BLS</option>
                  <option value="ALS">ALS</option>
                  <option value="CCT">CCT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority *</label>
                <select
                  name="priority"
                  value={tripData.priority}
                  onChange={handleTripDataChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Insurance Company *</label>
                <select
                  name="insuranceCompany"
                  value={tripData.insuranceCompany}
                  onChange={handleTripDataChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="medicare">Medicare</option>
                  <option value="medicaid">Medicaid</option>
                  <option value="private">Private Insurance</option>
                  <option value="selfPay">Self Pay</option>
                  {revenueSettings.customInsuranceCompanies.map((company, idx) => (
                    <option key={idx} value={company.name.toLowerCase().replace(/\s+/g, '_')}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="specialRequirements"
                  checked={tripData.specialRequirements}
                  onChange={handleTripDataChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Special Requirements (adds ${revenueSettings.specialSurcharge} surcharge)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={calculateRevenue}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Calculate Revenue
                </button>
                <button
                  onClick={saveRoute}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Save Route
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reset
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
              
              <div className="mt-4 p-4 bg-orange-50 rounded-md">
                <h6 className="text-sm font-medium text-orange-900">Trip Details:</h6>
                <p className="text-sm text-orange-800 mt-1">
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

      {/* Revenue Settings Section */}
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Surcharges Section */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Surcharges</h3>
              <p className="text-sm text-gray-500">Configure priority level and special requirement surcharges</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Priority Level Surcharges */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Priority Level Surcharges (%)</h4>
                <p className="text-sm text-gray-500 mb-4">Percentage multiplier applied to base rate based on trip priority</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Low Priority</label>
                    <input
                      type="number"
                      step="0.01"
                      value={revenueSettings.priorityMultipliers.LOW}
                      onChange={handleRevenueSettingsChange}
                      name="priorityMultipliers.LOW"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medium Priority</label>
                    <input
                      type="number"
                      step="0.01"
                      value={revenueSettings.priorityMultipliers.MEDIUM}
                      onChange={handleRevenueSettingsChange}
                      name="priorityMultipliers.MEDIUM"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">High Priority</label>
                    <input
                      type="number"
                      step="0.01"
                      value={revenueSettings.priorityMultipliers.HIGH}
                      onChange={handleRevenueSettingsChange}
                      name="priorityMultipliers.HIGH"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgent Priority</label>
                    <input
                      type="number"
                      step="0.01"
                      value={revenueSettings.priorityMultipliers.URGENT}
                      onChange={handleRevenueSettingsChange}
                      name="priorityMultipliers.URGENT"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Special Requirements Surcharge */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Special Requirements Surcharge ($)</h4>
                <p className="text-sm text-gray-500 mb-4">Fixed dollar amount added for trips with special requirements</p>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.specialSurcharge}
                    onChange={(e) => {
                      setRevenueSettings(prev => ({
                        ...prev,
                        specialSurcharge: parseFloat(e.target.value) || 0
                      }));
                    }}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    localStorage.setItem('tcc_revenue_settings', JSON.stringify(revenueSettings));
                    alert('Revenue settings saved!');
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Save Revenue Settings
                </button>
              </div>
            </div>
          </div>

          {/* Insurance Company Management */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Insurance Company Management</h3>
              <p className="text-sm text-gray-500">Add custom insurance companies with their specific rates</p>
            </div>
            <div className="p-6">
              {/* Add New Insurance Company */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Add New Insurance Company</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      value={newInsuranceCompany.name}
                      onChange={(e) => setNewInsuranceCompany(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Blue Cross Blue Shield"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">BLS Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInsuranceCompany.rates.BLS}
                      onChange={(e) => setNewInsuranceCompany(prev => ({ ...prev, rates: { ...prev.rates, BLS: e.target.value } }))}
                      placeholder="120.00"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ALS Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInsuranceCompany.rates.ALS}
                      onChange={(e) => setNewInsuranceCompany(prev => ({ ...prev, rates: { ...prev.rates, ALS: e.target.value } }))}
                      placeholder="200.00"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CCT Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInsuranceCompany.rates.CCT}
                      onChange={(e) => setNewInsuranceCompany(prev => ({ ...prev, rates: { ...prev.rates, CCT: e.target.value } }))}
                      placeholder="350.00"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={addInsuranceCompany}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Add Company
                  </button>
                </div>
              </div>

              {/* Existing Insurance Companies */}
              {revenueSettings.customInsuranceCompanies.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Custom Insurance Companies</h4>
                  <div className="space-y-2">
                    {revenueSettings.customInsuranceCompanies.map((company, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        {editingCompany === index ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <input
                                type="text"
                                value={editCompanyData.name}
                                onChange={(e) => setEditCompanyData(prev => ({ ...prev, name: e.target.value }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                step="0.01"
                                value={editCompanyData.rates.BLS}
                                onChange={(e) => setEditCompanyData(prev => ({ ...prev, rates: { ...prev.rates, BLS: e.target.value } }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                step="0.01"
                                value={editCompanyData.rates.ALS}
                                onChange={(e) => setEditCompanyData(prev => ({ ...prev, rates: { ...prev.rates, ALS: e.target.value } }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                step="0.01"
                                value={editCompanyData.rates.CCT}
                                onChange={(e) => setEditCompanyData(prev => ({ ...prev, rates: { ...prev.rates, CCT: e.target.value } }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{company.name}</h5>
                            <p className="text-sm text-gray-500">
                              BLS: ${company.rates.BLS} | ALS: ${company.rates.ALS} | CCT: ${company.rates.CCT}
                            </p>
                          </div>
                        )}
                        <div className="flex space-x-2 ml-4">
                          {editingCompany === index ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditCompany(index)}
                                className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteInsuranceCompany(index)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMSTripCalculator;

