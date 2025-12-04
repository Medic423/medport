import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Navigation,
  Settings,
  Clock,
  MapPin,
  DollarSign,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import optimizationApi from '../services/optimizationApi';
import {
  Unit,
  TransportRequest,
  OptimizationResponse,
  BackhaulAnalysisResponse,
  RevenueAnalyticsResponse,
  PerformanceMetricsResponse,
  OptimizationSettings
} from '../types/optimization';

const TCCRouteOptimizer: React.FC = () => {
  // State management
  const [startingLocation, setStartingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [matchedFacility, setMatchedFacility] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [manualAddress, setManualAddress] = useState('');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<any[]>([]);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResponse | null>(null);
  const [backhaulAnalysis, setBackhaulAnalysis] = useState<BackhaulAnalysisResponse | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalyticsResponse | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsResponse | null>(null);
  
  // Phase 3: Agency context state
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [availableAgencies, setAvailableAgencies] = useState<any[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [homeBase, setHomeBase] = useState<{ lat: number; lng: number; agencyName?: string; address?: string } | null>(null);
  const [currentTrip, setCurrentTrip] = useState<any | null>(null);
  const [currentTrips, setCurrentTrips] = useState<any[]>([]);
  const [returnOpportunities, setReturnOpportunities] = useState<any[]>([]);
  
  // Phase 4: Proximity settings state
  const [proximityRadius, setProximityRadius] = useState<number>(25); // Default 25 miles
  const [maxLegs, setMaxLegs] = useState<number>(3); // Default 3 legs max
  
  // Phase 5: Expanded multi-leg sequences
  const [expandedSequences, setExpandedSequences] = useState<Set<string>>(new Set());
  
  // Phase 6: Revenue & Savings calculations
  const [showComparison, setShowComparison] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingAgencyContext, setLoadingAgencyContext] = useState(false);
  const [loadingReturnOpportunities, setLoadingReturnOpportunities] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    weights: {
      deadheadMiles: 0.5,
      waitTime: 0.1,
      backhaulBonus: 25.0,
      overtimeRisk: 2.0,
      baseRevenue: 1.0
    },
    constraints: {
      maxDeadheadMiles: 50,
      maxWaitTime: 120,
      maxOvertimeHours: 2,
      maxBackhaulDistance: 15,
      maxBackhaulTimeWindow: 90
    },
    autoOptimize: false,
    refreshInterval: 30
  });

  // Load initial data and settings
  useEffect(() => {
    loadInitialData();
    loadSavedSettings();
    loadFacilities();
    loadAvailableAgencies();
  }, []);

  // Load agency context when agency is selected
  useEffect(() => {
    if (selectedAgencyId) {
      loadAgencyContext();
    } else {
      // Clear agency context when no agency selected
      setHomeBase(null);
      setCurrentTrip(null);
      setCurrentTrips([]);
      setReturnOpportunities([]);
    }
  }, [selectedAgencyId]);

  // Auto-refresh when enabled
  useEffect(() => {
    if (optimizationSettings.autoOptimize) {
      const interval = setInterval(() => {
        if (startingLocation && selectedTrips.length > 0) {
          handleOptimize();
        }
      }, optimizationSettings.refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [optimizationSettings.autoOptimize, optimizationSettings.refreshInterval, startingLocation, selectedTrips]);

  // Filter facilities based on manual address input
  useEffect(() => {
    if (manualAddress.length >= 2) {
      const filtered = facilities.filter(facility =>
        facility.name.toLowerCase().includes(manualAddress.toLowerCase()) ||
        facility.address?.toLowerCase().includes(manualAddress.toLowerCase()) ||
        facility.city?.toLowerCase().includes(manualAddress.toLowerCase())
      );
      setFilteredFacilities(filtered);
    } else {
      setFilteredFacilities([]);
    }
  }, [manualAddress, facilities]);

  const loadSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('tcc_optimization_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setOptimizationSettings(prev => ({ ...prev, ...parsed }));
        console.log('TCC_DEBUG: Loaded saved optimization settings');
      }
      
      // Phase 4: Load saved proximity settings
      const savedProximity = localStorage.getItem('tcc_proximity_settings');
      if (savedProximity) {
        const parsed = JSON.parse(savedProximity);
        if (parsed.proximityRadius) setProximityRadius(parsed.proximityRadius);
        if (parsed.maxLegs) setMaxLegs(parsed.maxLegs);
        console.log('TCC_DEBUG: Loaded saved proximity settings');
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error loading saved settings:', error);
    }
  };


  // Load all facilities for location matching
  const loadFacilities = async () => {
    try {
      const response = await api.get('/api/tcc/facilities');
      if (response.data?.success) {
        setFacilities(response.data.data || []);
        console.log('TCC_DEBUG: Loaded facilities for location matching:', response.data.data?.length);
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error loading facilities:', error);
    }
  };

  // Check if coordinates match any facility
  const checkFacilityMatch = (lat: number, lng: number) => {
    // Match within ~100 meters (roughly 0.001 degrees)
    const threshold = 0.001;
    
    const matched = facilities.find(facility => {
      const latMatch = Math.abs((facility.latitude || 0) - lat) < threshold;
      const lngMatch = Math.abs((facility.longitude || 0) - lng) < threshold;
      return latMatch && lngMatch;
    });

    if (matched) {
      setMatchedFacility(`${matched.name} - ${matched.address || ''}`);
      console.log('TCC_DEBUG: Location matches facility:', matched.name);
    } else {
      setMatchedFacility(null);
    }
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setStartingLocation(location);
        checkFacilityMatch(location.lat, location.lng);
        setGettingLocation(false);
        console.log('TCC_DEBUG: Got current location:', location);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
        console.error('TCC_DEBUG: Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Set location from manual selection (facility or custom)
  const setManualLocation = (facility: any) => {
    if (facility.latitude && facility.longitude) {
      setStartingLocation({
        lat: facility.latitude,
        lng: facility.longitude
      });
      setMatchedFacility(`${facility.name} - ${facility.address || ''}`);
      setManualAddress('');
      setFilteredFacilities([]);
      console.log('TCC_DEBUG: Set manual location:', facility.name);
    }
  };

  // Geocode address using a simple geocoding service
  const geocodeAddress = async (address: string) => {
    try {
      setGettingLocation(true);
      setError(null);
      
      // Use Nominatim (OpenStreetMap) for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'TCC-RouteOptimizer'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        setStartingLocation(location);
        checkFacilityMatch(location.lat, location.lng);
        setManualAddress('');
        console.log('TCC_DEBUG: Geocoded address:', address, 'to', location);
      } else {
        setError('Could not find address. Please try a different address or select from existing facilities.');
      }
    } catch (error) {
      setError('Failed to geocode address. Please select from existing facilities.');
      console.error('TCC_DEBUG: Geocoding error:', error);
    } finally {
      setGettingLocation(false);
    }
  };

  const loadInitialData = async () => {
    try {
      console.log('TCC_DEBUG: Refresh button clicked - reloading all data');
      await Promise.all([
        loadTrips(),
        loadAnalytics(),
        loadAvailableAgencies()
      ]);
      
      // If agency is selected, reload agency context
      if (selectedAgencyId) {
        console.log('TCC_DEBUG: Reloading agency context for selected agency');
        await loadAgencyContext();
      }
      
      // If starting location and home base are set, reload return opportunities
      if (startingLocation && homeBase) {
        console.log('TCC_DEBUG: Reloading return opportunities');
        await findReturnOpportunities();
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error loading initial data:', error);
      setError('Failed to load initial data');
    }
  };

  // Load available EMS agencies for TCC/Admin users
  const loadAvailableAgencies = async () => {
    setLoadingAgencies(true);
    try {
      console.log('TCC_DEBUG: Loading available EMS agencies...');
      // Try /api/tcc/agencies first (for TCC users), fallback to /api/ems-agencies
      let response;
      try {
        response = await api.get('/api/tcc/agencies');
      } catch (err) {
        // Fallback if endpoint doesn't exist
        response = await api.get('/api/ems-agencies');
      }
      
      if (response.data?.success || response.data?.data) {
        const agencies = response.data.data || response.data || [];
        console.log('TCC_DEBUG: Raw agencies response:', JSON.stringify(agencies, null, 2));
        console.log('TCC_DEBUG: Agencies with coordinates:', agencies.map((a: any) => ({
          id: a.id,
          name: a.name,
          hasLat: !!a.latitude,
          hasLng: !!a.longitude,
          lat: a.latitude,
          lng: a.longitude
        })));
        setAvailableAgencies(agencies);
        console.log('TCC_DEBUG: Loaded', agencies.length, 'EMS agencies');
        
        // Auto-select first agency if only one available
        if (agencies.length === 1) {
          setSelectedAgencyId(agencies[0].id);
        }
      } else {
        console.warn('TCC_DEBUG: Failed to load agencies:', response.data?.error);
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error loading agencies:', error);
      // Don't set error - user might be EMS user who doesn't need to select
    } finally {
      setLoadingAgencies(false);
    }
  };

  // Phase 3: Load agency context (home base and current trips) for selected agency
  const loadAgencyContext = async () => {
    if (!selectedAgencyId) {
      return;
    }

    setLoadingAgencyContext(true);
    try {
      console.log('TCC_DEBUG: Loading agency context for agency:', selectedAgencyId);
      
      // Load home base and current trips in parallel, passing agencyId
      const [homeBaseResult, currentTripsResult] = await Promise.all([
        optimizationApi.getAgencyHomeBase(selectedAgencyId),
        optimizationApi.getCurrentTrips(selectedAgencyId)
      ]);

      console.log('TCC_DEBUG: Home base result:', JSON.stringify(homeBaseResult, null, 2));
      console.log('TCC_DEBUG: Selected agencyId:', selectedAgencyId);
      
      if (homeBaseResult.success && homeBaseResult.data) {
        if (homeBaseResult.data.lat && homeBaseResult.data.lng) {
          setHomeBase({
            lat: homeBaseResult.data.lat,
            lng: homeBaseResult.data.lng,
            agencyName: homeBaseResult.data.agencyName,
            address: homeBaseResult.data.address
          });
          console.log('TCC_DEBUG: Home base loaded successfully:', homeBaseResult.data);
          setError(null); // Clear any previous errors
        } else {
          console.warn('TCC_DEBUG: Home base data missing coordinates:', homeBaseResult.data);
          const agencyName = homeBaseResult.data.agencyName || 'the selected agency';
          setError(`Home base coordinates are not set for ${agencyName}. Please contact administrator to set latitude and longitude in agency settings.`);
        }
      } else {
        // Check if we got data even though success is false (coordinates not set)
        if (homeBaseResult.data && homeBaseResult.data.agencyName) {
          console.warn('TCC_DEBUG: Agency found but coordinates not set:', homeBaseResult.data);
          setError(`Home base coordinates are not set for ${homeBaseResult.data.agencyName}. Please contact administrator to set latitude and longitude in agency settings.`);
        } else {
          console.warn('TCC_DEBUG: Failed to load home base. Error:', homeBaseResult.error);
          console.warn('TCC_DEBUG: Full response:', homeBaseResult);
          const errorMsg = homeBaseResult.error || 'Unknown error';
          setError(`Unable to load home base: ${errorMsg}. Please ensure the selected agency has home base coordinates configured in settings.`);
        }
      }

      if (currentTripsResult.success && currentTripsResult.data) {
        const trips = currentTripsResult.data || [];
        setCurrentTrips(trips);
        console.log('TCC_DEBUG: Current trips loaded:', trips.length);

        // Auto-select most recent trip (first in array since they're sorted by responseTimestamp desc)
        if (trips.length > 0) {
          const mostRecentTrip = trips[0];
          setCurrentTrip(mostRecentTrip);

          // Auto-set starting location to trip destination if coordinates are available
          if (mostRecentTrip.destination?.lat && mostRecentTrip.destination?.lng) {
            setStartingLocation({
              lat: mostRecentTrip.destination.lat,
              lng: mostRecentTrip.destination.lng
            });
            setMatchedFacility(mostRecentTrip.destination.name || null);
            console.log('TCC_DEBUG: Auto-set starting location from current trip:', mostRecentTrip.destination);
          }
        }
      } else {
        console.warn('TCC_DEBUG: Failed to load current trips:', currentTripsResult.error);
        // Don't set error - this might be expected for non-EMS users or if no active trips
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error loading agency context:', error);
      // Don't set error - this might be expected for non-EMS users
    } finally {
      setLoadingAgencyContext(false);
    }
  };

  // Phase 3: Find return opportunities when starting location and home base are set
  // Phase 4: Updated to use proximityRadius and maxLegs state
  const findReturnOpportunities = async () => {
    if (!startingLocation || !homeBase) {
      console.warn('TCC_DEBUG: Cannot find return opportunities - missing starting location or home base');
      return;
    }

    setLoadingReturnOpportunities(true);
    setError(null);
    try {
      console.log('TCC_DEBUG: Finding return opportunities...', {
        startingLocation,
        homeBase,
        proximityRadius,
        maxLegs
      });

      const result = await optimizationApi.findReturnOpportunities({
        currentLocation: startingLocation,
        homeBase: {
          lat: homeBase.lat,
          lng: homeBase.lng
        },
        proximityRadius: proximityRadius,
        maxLegs: maxLegs
      });

      if (result.success && result.data) {
        setReturnOpportunities(result.data.allOpportunities || []);
        console.log('TCC_DEBUG: Return opportunities found:', {
          singleLeg: result.data.counts?.singleLeg || 0,
          multiLeg: result.data.counts?.multiLeg || 0,
          total: result.data.counts?.total || 0,
          proximityRadius: result.data.proximityRadius,
          maxLegs: result.data.maxLegs
        });
      } else {
        setError(result.error || 'Failed to find return opportunities');
        setReturnOpportunities([]);
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error finding return opportunities:', error);
      setError('Failed to find return opportunities');
      setReturnOpportunities([]);
    } finally {
      setLoadingReturnOpportunities(false);
    }
  };

  // Auto-find return opportunities when starting location, proximity settings change
  useEffect(() => {
    if (startingLocation && homeBase && currentTrip) {
      findReturnOpportunities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startingLocation, homeBase, currentTrip, proximityRadius, maxLegs]);

  const loadTrips = async () => {
    setLoadingTrips(true);
    try {
      console.log('TCC_DEBUG: Loading trips for route optimization');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Load all trips (same as Trip Management)
      const response = await api.get('/api/trips');

      if (!response.data?.success) {
        throw new Error(`Failed to fetch trips: ${response.data?.message || 'Unknown error'}`);
      }

      const data = response.data;
      console.log('TCC_DEBUG: Trips API response:', data);
      
      if (data.success) {
        const trips = data.data || [];
        console.log('TCC_DEBUG: Trips loaded:', trips.length);
        
        // Filter to show trips that are available for optimization (not completed/cancelled)
        const availableTrips = trips.filter((trip: any) => 
          trip.status !== 'COMPLETED' && 
          trip.status !== 'HEALTHCARE_COMPLETED' && 
          trip.status !== 'CANCELLED'
        );
        
        console.log('TCC_DEBUG: Available trips for optimization:', availableTrips.length);
        setAvailableTrips(availableTrips);
      } else {
        throw new Error(data.error || 'Failed to load trips');
      }
    } catch (err) {
      setError('Failed to load trips');
      console.error('TCC_DEBUG: Trips loading error:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      console.log('TCC_DEBUG: Loading analytics data...');
      const [revenueData, performanceData] = await Promise.all([
        optimizationApi.getRevenueAnalytics('24h'),
        optimizationApi.getPerformanceMetrics('24h')
      ]);

      console.log('TCC_DEBUG: Revenue analytics response:', revenueData);
      console.log('TCC_DEBUG: Performance metrics response:', performanceData);

      setRevenueAnalytics(revenueData);
      setPerformanceMetrics(performanceData);
    } catch (err) {
      console.error('TCC_DEBUG: Analytics loading error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleOptimize = async () => {
    if (!startingLocation) {
      setError('Please set the starting location');
      return;
    }

    if (selectedTrips.length === 0) {
      setError('Please select at least one trip');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('TCC_DEBUG: Optimizing with starting location:', startingLocation, 'and trips:', selectedTrips);
      
      const response = await optimizationApi.optimizeRoutes({
        startingLocation: startingLocation,
        tripIds: selectedTrips,
        constraints: optimizationSettings.constraints
      });

      setOptimizationResults(response);
    } catch (err) {
      setError('Failed to optimize routes');
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackhaulAnalysis = async () => {
    console.log('TCC_DEBUG: handleBackhaulAnalysis called - selectedTrips:', selectedTrips);
    console.log('TCC_DEBUG: selectedTrips.length:', selectedTrips.length);
    
    if (selectedTrips.length < 2) {
      const errorMsg = `Please select at least 2 trips for backhaul analysis (currently ${selectedTrips.length} selected)`;
      setError(errorMsg);
      console.error('TCC_DEBUG: Backhaul analysis requires 2+ trips:', errorMsg);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
      return;
    }

    setLoading(true);
    setError(null);
    setBackhaulAnalysis(null); // Clear previous results

    try {
      console.log('TCC_DEBUG: Starting backhaul analysis with selected trips:', selectedTrips);
      const response = await optimizationApi.analyzeBackhaul(selectedTrips);
      console.log('TCC_DEBUG: Backhaul analysis response:', response);

      if (response.success) {
        setBackhaulAnalysis(response);
        console.log('TCC_DEBUG: Backhaul analysis successful, pairs found:', response.data?.pairs?.length || 0);
      } else {
        setError(response.error || 'Failed to analyze backhaul opportunities');
        console.error('TCC_DEBUG: Backhaul analysis failed:', response.error);
      }
    } catch (err) {
      const errorMsg = 'Failed to analyze backhaul opportunities';
      setError(errorMsg);
      console.error('TCC_DEBUG: Backhaul analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnTripAnalysis = async () => {
    console.log('TCC_DEBUG: handleReturnTripAnalysis called');
    
    setLoading(true);
    setError(null);
    setBackhaulAnalysis(null); // Clear previous results

    try {
      console.log('TCC_DEBUG: Starting return trip analysis...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/api/optimize/return-trips');
      console.log('TCC_DEBUG: Return trips raw response:', response);

      if (!response.data?.success) {
        throw new Error(`Failed to fetch return trips: ${response.data?.message || 'Unknown error'}`);
      }

      const data = response.data;
      console.log('TCC_DEBUG: Return trips response data:', data);
      console.log('TCC_DEBUG: Return trips found:', data.data?.returnTrips?.length || 0);
      
      if (data.success) {
        // Convert return trips to backhaul analysis format for display
        const backhaulResponse = {
          success: true,
          data: {
            pairs: data.data.returnTrips || [],
            statistics: data.data.statistics || {},
            recommendations: data.data.recommendations || []
          }
        };
        setBackhaulAnalysis(backhaulResponse);
        console.log('TCC_DEBUG: Return trip analysis successful, displaying results');
      } else {
        throw new Error(data.error || 'Failed to load return trips');
      }
    } catch (err) {
      const errorMsg = 'Failed to analyze return trip opportunities';
      setError(errorMsg);
      console.error('TCC_DEBUG: Return trip analysis error:', err);
    } finally {
      setLoading(false);
      console.log('TCC_DEBUG: handleReturnTripAnalysis completed');
    }
  };

  const handleTripToggle = (tripId: string) => {
    setSelectedTrips(prev => {
      const newSelection = prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId];
      
      console.log('TCC_DEBUG: Trip selection changed:', {
        tripId,
        action: prev.includes(tripId) ? 'removed' : 'added',
        newSelectionCount: newSelection.length,
        newSelection
      });
      
      return newSelection;
    });
  };

  // Phase 6: Calculate revenue and savings for selected trips
  const calculateSelectedTripsMetrics = () => {
    if (!selectedTrips.length || !returnOpportunities.length || !startingLocation || !homeBase) {
      return null;
    }

    const selectedOpportunities = returnOpportunities.filter(opp => 
      selectedTrips.includes(opp.tripId || opp.legs?.[0]?.tripId)
    );

    if (selectedOpportunities.length === 0) {
      return null;
    }

    // Calculate direct return distance (empty return) using Haversine approximation
    let directReturnDistance = null;
    if (returnOpportunities[0]?.route?.startLocation && returnOpportunities[0]?.route?.endLocation) {
      const start = returnOpportunities[0].route.startLocation;
      const end = returnOpportunities[0].route.endLocation;
      const R = 3959; // Earth radius in miles
      const dLat = (end.lat - start.lat) * Math.PI / 180;
      const dLon = (end.lng - start.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      directReturnDistance = R * c;
    } else if (startingLocation && homeBase) {
      const R = 3959;
      const dLat = (homeBase.lat - startingLocation.lat) * Math.PI / 180;
      const dLon = (homeBase.lng - startingLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(startingLocation.lat * Math.PI / 180) * Math.cos(homeBase.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      directReturnDistance = R * c;
    }

    // Calculate totals from selected opportunities
    let totalRevenue = 0;
    let totalDistance = 0;
    let totalDeadheadMiles = 0;
    let totalDeadheadSavings = 0;
    let totalTripDistance = 0;

    selectedOpportunities.forEach(opp => {
      if (opp.type === 'multi-leg') {
        totalRevenue += opp.totalRevenue || 0;
        totalDistance += opp.totalDistance || 0;
        totalDeadheadMiles += opp.route?.totalDeadheadMiles || 0;
        totalDeadheadSavings += opp.deadheadSavings || 0;
        totalTripDistance += opp.legs?.reduce((sum: number, leg: any) => sum + (leg.tripDistance || 0), 0) || 0;
      } else {
        totalRevenue += opp.estimatedRevenue || 0;
        const routeDistance = (opp.pickup.distanceFromCurrent || opp.route?.currentToPickup || 0) +
                              (opp.route?.pickupToDropoff || 0) +
                              (opp.dropoff.distanceToHome || 0);
        totalDistance += routeDistance;
        totalDeadheadMiles += (opp.pickup.distanceFromCurrent || opp.route?.currentToPickup || 0) +
                              (opp.dropoff.distanceToHome || 0);
        totalDeadheadSavings += opp.deadheadSavings || 0;
        totalTripDistance += opp.route?.pickupToDropoff || 0;
      }
    });

    // Calculate costs
    const deadheadCostPerMile = 2.0;
    const emptyReturnCost = directReturnDistance ? directReturnDistance * deadheadCostPerMile : 0;
    const revenueReturnCost = totalDeadheadMiles * deadheadCostPerMile;
    const netBenefit = totalRevenue - revenueReturnCost;
    const totalSavings = emptyReturnCost - revenueReturnCost + totalRevenue;

    return {
      selectedCount: selectedOpportunities.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalDeadheadMiles: Math.round(totalDeadheadMiles * 10) / 10,
      totalTripDistance: Math.round(totalTripDistance * 10) / 10,
      totalDeadheadSavings: Math.round(totalDeadheadSavings * 10) / 10,
      emptyReturnDistance: directReturnDistance ? Math.round(directReturnDistance * 10) / 10 : null,
      emptyReturnCost: Math.round(emptyReturnCost * 100) / 100,
      revenueReturnCost: Math.round(revenueReturnCost * 100) / 100,
      netBenefit: Math.round(netBenefit * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      fuelSavings: Math.round((totalDeadheadSavings * 0.5) * 100) / 100,
      opportunities: selectedOpportunities
    };
  };

  const selectedMetrics = calculateSelectedTripsMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Route Optimization</h1>
          <p className="mt-1 text-sm text-gray-500">
            Optimize routes for selected trips based on a starting location.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button
            onClick={loadInitialData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Settings</h3>
          
          {/* Auto-optimization Settings */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Auto-Optimization</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-optimize every {optimizationSettings.refreshInterval} seconds
                </label>
                <input
                  type="checkbox"
                  checked={optimizationSettings.autoOptimize}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    autoOptimize: e.target.checked
                  }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  value={optimizationSettings.refreshInterval}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    refreshInterval: parseInt(e.target.value) || 30
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="10"
                  max="300"
                />
              </div>
            </div>
          </div>

          {/* Optimization Weights */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Optimization Weights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadhead Miles Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={optimizationSettings.weights.deadheadMiles}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    weights: { ...prev.weights, deadheadMiles: parseFloat(e.target.value) || 0.5 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wait Time Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={optimizationSettings.weights.waitTime}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    weights: { ...prev.weights, waitTime: parseFloat(e.target.value) || 0.1 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backhaul Bonus ($)
                </label>
                <input
                  type="number"
                  step="5"
                  value={optimizationSettings.weights.backhaulBonus}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    weights: { ...prev.weights, backhaulBonus: parseFloat(e.target.value) || 25.0 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Risk Weight
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={optimizationSettings.weights.overtimeRisk}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    weights: { ...prev.weights, overtimeRisk: parseFloat(e.target.value) || 2.0 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="5"
                />
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Constraints</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Deadhead Miles
                </label>
                <input
                  type="number"
                  value={optimizationSettings.constraints.maxDeadheadMiles}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxDeadheadMiles: parseInt(e.target.value) || 50 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="10"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Wait Time (minutes)
                </label>
                <input
                  type="number"
                  value={optimizationSettings.constraints.maxWaitTime}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxWaitTime: parseInt(e.target.value) || 120 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="30"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Overtime Hours
                </label>
                <input
                  type="number"
                  value={optimizationSettings.constraints.maxOvertimeHours}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxOvertimeHours: parseInt(e.target.value) || 2 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Backhaul Distance (miles)
                </label>
                <input
                  type="number"
                  value={optimizationSettings.constraints.maxBackhaulDistance}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxBackhaulDistance: parseInt(e.target.value) || 15 }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="5"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                // Save settings to localStorage
                localStorage.setItem('tcc_optimization_settings', JSON.stringify(optimizationSettings));
                setShowSettings(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Step 0: Select EMS Agency (for TCC/Admin users) */}
      {availableAgencies.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Step 0: Select EMS Agency</h3>
          {loadingAgencies ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600">Loading agencies...</span>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select the EMS agency to plan return trips for:
              </label>
              <select
                value={selectedAgencyId || ''}
                onChange={(e) => {
                  const selectedId = e.target.value || null;
                  console.log('TCC_DEBUG: Agency selected:', selectedId);
                  const selectedAgency = availableAgencies.find(a => a.id === selectedId);
                  console.log('TCC_DEBUG: Selected agency details:', selectedAgency);
                  console.log('TCC_DEBUG: Selected agency has coordinates?', {
                    hasLat: !!selectedAgency?.latitude,
                    hasLng: !!selectedAgency?.longitude,
                    lat: selectedAgency?.latitude,
                    lng: selectedAgency?.longitude
                  });
                  setSelectedAgencyId(selectedId);
                }}
                className="block w-full md:w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">-- Select an EMS Agency --</option>
                {availableAgencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name} {agency.city ? `(${agency.city}, ${agency.state})` : ''} {agency.latitude && agency.longitude ? '✓' : '⚠'}
                  </option>
                ))}
              </select>
              {selectedAgencyId && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Selected: {availableAgencies.find(a => a.id === selectedAgencyId)?.name}
                  </p>
                  {(() => {
                    const selected = availableAgencies.find(a => a.id === selectedAgencyId);
                    if (selected?.latitude && selected?.longitude) {
                      return (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Coordinates: {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-xs text-yellow-600 mt-1">
                          ⚠ No coordinates set for this agency
                        </p>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Current Trip Display (Phase 3) - Only show if agency selected or EMS user */}
      {availableAgencies.length > 0 && !selectedAgencyId ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Select an EMS Agency</p>
                <p className="text-xs text-blue-700 mt-1">
                  Please select an EMS agency above to continue with route optimization.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : loadingAgencyContext ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Loading agency context...</span>
          </div>
        </div>
      ) : currentTrip ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Outbound Trip</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">
                    Patient {currentTrip.patientId}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({currentTrip.status})
                  </span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">From:</span> {currentTrip.origin?.name || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">To:</span> {currentTrip.destination?.name || 'Unknown'}
                  </div>
                  {currentTrip.destination?.address && (
                    <div className="text-xs text-gray-500 mt-1">
                      {currentTrip.destination.address}
                    </div>
                  )}
                  {startingLocation && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <div className="text-xs text-green-700">
                        <span className="font-medium">Starting Location Set:</span> {matchedFacility || `${startingLocation.lat.toFixed(6)}, ${startingLocation.lng.toFixed(6)}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {currentTrips.length > 1 && (
                <div className="ml-4">
                  <select
                    value={currentTrip.id}
                    onChange={(e) => {
                      const selectedTrip = currentTrips.find(t => t.id === e.target.value);
                      if (selectedTrip) {
                        setCurrentTrip(selectedTrip);
                        if (selectedTrip.destination?.lat && selectedTrip.destination?.lng) {
                          setStartingLocation({
                            lat: selectedTrip.destination.lat,
                            lng: selectedTrip.destination.lng
                          });
                          setMatchedFacility(selectedTrip.destination.name || null);
                        }
                      }
                    }}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    {currentTrips.map(trip => (
                      <option key={trip.id} value={trip.id}>
                        {trip.patientId} - {trip.destination?.name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select different trip</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : homeBase ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">No Active Trips for Selected Agency</p>
                <p className="text-xs text-blue-700 mt-1">
                  {selectedAgencyId && availableAgencies.find(a => a.id === selectedAgencyId)?.name 
                    ? `No active or completed trips found for ${availableAgencies.find(a => a.id === selectedAgencyId)?.name}. `
                    : 'No active or completed trips found for the selected agency. '}
                  You can still find return trip opportunities by setting a starting location manually below.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Starting Location and Trip Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Starting Location Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentTrip ? 'Step 1: Starting Location (Auto-set from Trip)' : 'Step 1: Set Starting Location'}
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Set Starting Point for Route Optimization
              </h4>
              
              {!startingLocation ? (
                    <div className="space-y-3">
                      {/* Mode Toggle */}
                      <div className="flex space-x-2 mb-3">
                        <button
                          onClick={() => setLocationMode('gps')}
                          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                            locationMode === 'gps'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          <Target className="h-4 w-4 inline mr-1" />
                          GPS (Field)
                        </button>
                        <button
                          onClick={() => setLocationMode('manual')}
                          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                            locationMode === 'manual'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Manual (Dispatch)
                        </button>
                      </div>

                      {locationMode === 'gps' ? (
                        /* GPS Mode */
                        <div className="space-y-3">
                          <p className="text-sm text-blue-700">
                            Click the button below to use your current GPS location as the starting point for route optimization.
                          </p>
                          <button
                            onClick={getCurrentLocation}
                            disabled={gettingLocation}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {gettingLocation ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Getting Location...
                              </>
                            ) : (
                              <>
                                <Target className="h-4 w-4 mr-2" />
                                Use My Current Location
                              </>
                            )}
                          </button>
                          <p className="text-xs text-blue-600">
                            💡 Your browser will ask for permission to access your location
                          </p>
                        </div>
                      ) : (
                        /* Manual Mode */
                        <div className="space-y-3">
                          <p className="text-sm text-blue-700">
                            Search for a facility or enter an address to set the starting location.
                          </p>
                          
                          {/* Search Input */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search facilities or enter address..."
                              value={manualAddress}
                              onChange={(e) => setManualAddress(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && manualAddress && filteredFacilities.length === 0) {
                                  geocodeAddress(manualAddress);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            
                            {/* Dropdown for filtered facilities */}
                            {filteredFacilities.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {filteredFacilities.map((facility) => (
                                  <button
                                    key={facility.id}
                                    onClick={() => setManualLocation(facility)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                  >
                                    <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {facility.address || ''} {facility.city ? `• ${facility.city}` : ''}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Geocode button for custom addresses */}
                          {manualAddress && filteredFacilities.length === 0 && (
                            <button
                              onClick={() => geocodeAddress(manualAddress)}
                              disabled={gettingLocation}
                              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                              {gettingLocation ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Finding Address...
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-4 w-4 mr-2" />
                                  Use This Address
                                </>
                              )}
                            </button>
                          )}
                          
                          <p className="text-xs text-blue-600">
                            💡 Start typing to see matching facilities, or enter any address
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Location Set
                          </p>
                          
                          {matchedFacility ? (
                            <div className="mt-1">
                              <p className="text-sm font-medium text-blue-900">
                                📍 {matchedFacility}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                Lat: {startingLocation.lat.toFixed(6)}, Lng: {startingLocation.lng.toFixed(6)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600 mt-1">
                              Lat: {startingLocation.lat.toFixed(6)}, Lng: {startingLocation.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setStartingLocation(null);
                            setMatchedFacility(null);
                            setManualAddress('');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

        {/* Phase 4: Proximity Settings */}
        {startingLocation && homeBase && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Proximity Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proximity Radius (miles)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={proximityRadius}
                    onChange={(e) => {
                      const newRadius = parseInt(e.target.value);
                      setProximityRadius(newRadius);
                      // Save to localStorage
                      localStorage.setItem('tcc_proximity_settings', JSON.stringify({
                        proximityRadius: newRadius,
                        maxLegs: maxLegs
                      }));
                    }}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {proximityRadius} mi
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum distance from current location to pickup and from dropoff to home base
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Legs
                </label>
                <select
                  value={maxLegs}
                  onChange={(e) => {
                    const newMaxLegs = parseInt(e.target.value);
                    setMaxLegs(newMaxLegs);
                    // Save to localStorage
                    localStorage.setItem('tcc_proximity_settings', JSON.stringify({
                      proximityRadius: proximityRadius,
                      maxLegs: newMaxLegs
                    }));
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value={1}>1 leg (Single trip)</option>
                  <option value={2}>2 legs</option>
                  <option value={3}>3 legs</option>
                  <option value={4}>4 legs</option>
                  <option value={5}>5 legs</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of trips in a return sequence
                </p>
              </div>
            </div>
            {returnOpportunities.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-900 font-medium">
                    Found {returnOpportunities.length} opportunity{returnOpportunities.length !== 1 ? 'ies' : ''}
                  </span>
                  <span className="text-blue-700">
                    Using {proximityRadius} mi radius, max {maxLegs} leg{maxLegs !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Return Trip Opportunities Selection */}
        {(availableAgencies.length === 0 || selectedAgencyId) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Step 2: Select Return Trip Opportunities
            {homeBase && (
              <span className="text-xs text-gray-500 ml-2">
                (Home Base: {homeBase.agencyName || 'Your Agency'})
              </span>
            )}
          </h3>
          {loadingReturnOpportunities ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600">Finding return opportunities...</span>
            </div>
          ) : !startingLocation || !homeBase ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    {!startingLocation ? 'Starting Location Required' : 'Home Base Required'}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {!startingLocation 
                      ? 'Please set starting location first using Step 1 above.' 
                      : error || 'Home base coordinates are not available. Please ensure you are logged in as an EMS user and your agency has home base coordinates configured in settings.'}
                  </p>
                  {error && error.includes('coordinates are not set') && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Contact your administrator to set latitude and longitude for your EMS agency in the system settings.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : returnOpportunities.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {returnOpportunities.map((opp, index) => {
                const oppId = opp.tripId || `sequence-${index}`;
                const isExpanded = expandedSequences.has(oppId);
                const isSelected = selectedTrips.includes(opp.tripId || opp.legs?.[0]?.tripId);
                
                return (
                <div
                  key={oppId}
                  className={`border rounded-lg p-3 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTripToggle(opp.tripId || opp.legs?.[0]?.tripId)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1 flex-shrink-0"
                    />
                    <div className="ml-3 flex-1">
                      {opp.type === 'multi-leg' ? (
                        <div>
                          {/* Header with expand/collapse */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center flex-1">
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedSequences);
                                  if (isExpanded) {
                                    newExpanded.delete(oppId);
                                  } else {
                                    newExpanded.add(oppId);
                                  }
                                  setExpandedSequences(newExpanded);
                                }}
                                className="mr-2 text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? (
                                  <span className="text-xs">▼</span>
                                ) : (
                                  <span className="text-xs">▶</span>
                                )}
                              </button>
                              <span className="text-sm font-medium text-gray-900">
                                Multi-Leg Sequence ({opp.legCount} legs)
                              </span>
                              {index === 0 && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                                  ⭐ Best
                                </span>
                              )}
                              {opp.efficiencyScore > 10 && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  High Value
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500">
                                Rank #{index + 1}
                              </span>
                              <div className="text-right">
                                <div className="text-xs font-bold text-green-700">
                                  ${opp.totalRevenue?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Score: {opp.efficiencyScore?.toFixed(2) || '0.00'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <>
                          {/* Visual Route Flow */}
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2 text-xs">
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-500 mt-1 text-[10px]">Start</span>
                              </div>
                              {opp.legs.map((leg: any, legIndex: number) => (
                                <React.Fragment key={legIndex}>
                                  <div className="flex-1 flex items-center">
                                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                                    <div className="px-1 text-gray-400 text-[10px]">
                                      {leg.pickup.distanceFromPrevious?.toFixed(1) || '0'}mi
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center min-w-[80px]">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                                    <span className="text-gray-700 font-medium mt-1 text-[10px] text-center leading-tight">
                                      {leg.pickup.name.length > 12 ? leg.pickup.name.substring(0, 10) + '...' : leg.pickup.name}
                                    </span>
                                  </div>
                                  <div className="flex-1 flex items-center">
                                    <div className="flex-1 h-0.5 bg-blue-400"></div>
                                    <div className="px-1 text-blue-600 text-[10px] font-medium">
                                      {leg.tripDistance?.toFixed(1) || '0'}mi
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center min-w-[80px]">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                                    <span className="text-gray-700 font-medium mt-1 text-[10px] text-center leading-tight">
                                      {leg.dropoff.name.length > 12 ? leg.dropoff.name.substring(0, 10) + '...' : leg.dropoff.name}
                                    </span>
                                  </div>
                                  {legIndex < opp.legs.length - 1 && (
                                    <div className="flex-1 flex items-center">
                                      <div className="flex-1 h-0.5 bg-gray-300"></div>
                                      <div className="px-1 text-gray-400 text-[10px]">
                                        {leg.dropoff.distanceToNext?.toFixed(1) || '0'}mi
                                      </div>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                              <div className="flex-1 flex items-center">
                                <div className="flex-1 h-0.5 bg-gray-300"></div>
                                <div className="px-1 text-gray-400 text-[10px]">
                                  {opp.legs[opp.legs.length - 1]?.dropoff.distanceToNext?.toFixed(1) || '0'}mi
                                </div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-gray-500 mt-1 text-[10px]">Home</span>
                              </div>
                            </div>
                          </div>

                          {/* Detailed Leg Information */}
                          <div className="mb-3 space-y-2">
                            {opp.legs.map((leg: any, legIndex: number) => (
                              <div key={legIndex} className="bg-white border border-gray-200 rounded p-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                      <span className="text-xs font-medium text-gray-700 mr-2">
                                        Leg {leg.legNumber}:
                                      </span>
                                      <span className="text-xs text-gray-600">
                                        Patient {leg.patientId}
                                      </span>
                                      <span className="ml-2 text-xs text-gray-500">
                                        ({leg.transportLevel || 'BLS'})
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-0.5">
                                      <div>
                                        <span className="font-medium">Pickup:</span> {leg.pickup.name}
                                        {leg.pickup.distanceFromPrevious && (
                                          <span className="text-gray-500 ml-1">
                                            ({leg.pickup.distanceFromPrevious.toFixed(1)} mi from {legIndex === 0 ? 'current' : 'previous'})
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-medium">Dropoff:</span> {leg.dropoff.name}
                                        {leg.dropoff.distanceToNext && (
                                          <span className="text-gray-500 ml-1">
                                            ({leg.dropoff.distanceToNext.toFixed(1)} mi to {legIndex === opp.legs.length - 1 ? 'home' : 'next'})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-3 text-right">
                                    <div className="text-xs text-green-700 font-medium">
                                      ${leg.estimatedRevenue?.toFixed(2) || '0.00'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {leg.tripDistance?.toFixed(1) || '0'} mi
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Summary Metrics */}
                          <div className="pt-2 border-t border-gray-200">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-green-700 font-bold text-sm">
                                  ${opp.totalRevenue?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-gray-500">Total Revenue</div>
                              </div>
                              <div className="text-center">
                                <div className="text-blue-700 font-bold text-sm">
                                  {opp.deadheadSavings?.toFixed(1) || '0'} mi
                                </div>
                                <div className="text-gray-500">Deadhead Savings</div>
                              </div>
                              <div className="text-center">
                                <div className="text-purple-700 font-bold text-sm">
                                  {opp.efficiencyScore?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-gray-500">Efficiency Score</div>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>Total Distance: <span className="font-medium">{opp.totalDistance?.toFixed(1) || '0'} mi</span></span>
                                <span>Deadhead Miles: <span className="font-medium">{opp.route?.totalDeadheadMiles?.toFixed(1) || '0'} mi</span></span>
                              </div>
                            </div>
                          </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div>
                          {/* Single-leg compact display */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  Patient {opp.patientId}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  ({opp.transportLevel || 'BLS'})
                                </span>
                                {index < 3 && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    Top {index + 1}
                                  </span>
                                )}
                              </div>
                              
                              {/* Visual route for single-leg */}
                              <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                                <div className="flex items-center space-x-2 text-xs">
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-500 mt-1 text-[10px]">Current</span>
                                  </div>
                                  <div className="flex-1 flex items-center">
                                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                                    <div className="px-1 text-gray-400 text-[10px]">
                                      {opp.pickup.distanceFromCurrent || opp.route?.currentToPickup || '0'}mi
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center min-w-[100px]">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                                    <span className="text-gray-700 font-medium mt-1 text-[10px] text-center leading-tight">
                                      {opp.pickup.name.length > 15 ? opp.pickup.name.substring(0, 13) + '...' : opp.pickup.name}
                                    </span>
                                  </div>
                                  <div className="flex-1 flex items-center">
                                    <div className="flex-1 h-0.5 bg-blue-400"></div>
                                    <div className="px-1 text-blue-600 text-[10px] font-medium">
                                      {opp.route?.pickupToDropoff?.toFixed(1) || '0'}mi
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center min-w-[100px]">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                                    <span className="text-gray-700 font-medium mt-1 text-[10px] text-center leading-tight">
                                      {opp.dropoff.name.length > 15 ? opp.dropoff.name.substring(0, 13) + '...' : opp.dropoff.name}
                                    </span>
                                  </div>
                                  <div className="flex-1 flex items-center">
                                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                                    <div className="px-1 text-gray-400 text-[10px]">
                                      {opp.dropoff.distanceToHome}mi
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-gray-500 mt-1 text-[10px]">Home</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-600 space-y-0.5">
                                <div>
                                  <span className="font-medium">Pickup:</span> {opp.pickup.name}
                                  <span className="text-gray-500 ml-1">
                                    ({opp.pickup.distanceFromCurrent || opp.route?.currentToPickup || '0'} mi from current)
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Dropoff:</span> {opp.dropoff.name}
                                  <span className="text-gray-500 ml-1">
                                    ({opp.dropoff.distanceToHome} mi to home)
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-3 text-right">
                              <div className="text-xs font-bold text-green-700 mb-1">
                                ${opp.estimatedRevenue?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-xs text-blue-700 mb-1">
                                {opp.deadheadSavings?.toFixed(1) || '0'} mi saved
                              </div>
                              <div className="text-xs text-gray-600">
                                Score: {opp.efficiencyScore?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 text-center">
                No return trip opportunities found within {proximityRadius} miles.
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                Try adjusting the proximity radius above or set a different starting location.
              </p>
            </div>
          )}
        </div>
      )}

      </div>

      {/* Phase 6: Revenue & Savings Summary */}
      {selectedMetrics && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Revenue & Savings Summary
            </h3>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>
          </div>

          {showComparison ? (
            /* Comparison View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empty Return */}
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Empty Return (Direct)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{selectedMetrics.emptyReturnDistance || 'N/A'} mi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadhead Cost:</span>
                    <span className="font-medium text-red-700">${selectedMetrics.emptyReturnCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Net Cost:</span>
                      <span className="font-bold text-red-700">${selectedMetrics.emptyReturnCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Return */}
              <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Revenue Return ({selectedMetrics.selectedCount} trip{selectedMetrics.selectedCount !== 1 ? 's' : ''})
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Distance:</span>
                    <span className="font-medium">{selectedMetrics.totalDistance} mi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadhead Miles:</span>
                    <span className="font-medium">{selectedMetrics.totalDeadheadMiles} mi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadhead Cost:</span>
                    <span className="font-medium text-orange-700">${selectedMetrics.revenueReturnCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue Generated:</span>
                    <span className="font-medium text-green-700">${selectedMetrics.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-green-300 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Net Benefit:</span>
                      <span className="font-bold text-green-700">${selectedMetrics.netBenefit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Summary View */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-xs text-green-700 font-medium mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-green-700">${selectedMetrics.totalRevenue.toFixed(2)}</div>
                <div className="text-xs text-green-600 mt-1">{selectedMetrics.selectedCount} trip{selectedMetrics.selectedCount !== 1 ? 's' : ''}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-blue-700 font-medium mb-1">Deadhead Savings</div>
                <div className="text-2xl font-bold text-blue-700">{selectedMetrics.totalDeadheadSavings} mi</div>
                <div className="text-xs text-blue-600 mt-1">vs empty return</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-xs text-purple-700 font-medium mb-1">Net Benefit</div>
                <div className="text-2xl font-bold text-purple-700">${selectedMetrics.netBenefit.toFixed(2)}</div>
                <div className="text-xs text-purple-600 mt-1">Revenue - Costs</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-xs text-orange-700 font-medium mb-1">Total Savings</div>
                <div className="text-2xl font-bold text-orange-700">${selectedMetrics.totalSavings.toFixed(2)}</div>
                <div className="text-xs text-orange-600 mt-1">vs empty return</div>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Detailed Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Total Distance:</span>
                <span className="ml-2 font-medium">{selectedMetrics.totalDistance} mi</span>
              </div>
              <div>
                <span className="text-gray-500">Trip Distance:</span>
                <span className="ml-2 font-medium">{selectedMetrics.totalTripDistance} mi</span>
              </div>
              <div>
                <span className="text-gray-500">Deadhead Miles:</span>
                <span className="ml-2 font-medium">{selectedMetrics.totalDeadheadMiles} mi</span>
              </div>
              <div>
                <span className="text-gray-500">Fuel Savings:</span>
                <span className="ml-2 font-medium text-green-700">${selectedMetrics.fuelSavings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Results */}
      {optimizationResults && optimizationResults.success && optimizationResults.data && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Total Revenue</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ${typeof optimizationResults.data.totalRevenue === 'number' ? optimizationResults.data.totalRevenue.toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Total Distance</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {typeof optimizationResults.data.totalDeadheadMiles === 'number' ? optimizationResults.data.totalDeadheadMiles.toFixed(1) : '0.0'} mi
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Total Wait Time</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {typeof optimizationResults.data.totalWaitTime === 'number' ? optimizationResults.data.totalWaitTime.toFixed(0) : '0'} min
              </p>
            </div>
          </div>
          
          {/* Optimization Details */}
          {optimizationResults.data.optimizedRequests && optimizationResults.data.optimizedRequests.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Optimized Requests</h4>
              <div className="space-y-2">
                {optimizationResults.data.optimizedRequests.map((request: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Request {index + 1}</span>
                      <span className="text-sm text-gray-500 ml-2">Score: {typeof request.score === 'number' ? request.score.toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Revenue: ${typeof request.revenue === 'number' ? request.revenue.toFixed(2) : '0.00'} | 
                      Deadhead: {typeof request.deadheadMiles === 'number' ? request.deadheadMiles.toFixed(1) : '0.0'} mi
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backhaul Analysis Results */}
      {backhaulAnalysis && backhaulAnalysis.success && backhaulAnalysis.data && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Backhaul Analysis</h3>
          <div className="space-y-4">
            {backhaulAnalysis.data.pairs && backhaulAnalysis.data.pairs.map((pair: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pair.request1?.patientId || 'Unknown'} → {pair.request2?.patientId || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Potential savings: ${typeof pair.revenueBonus === 'number' ? pair.revenueBonus.toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Distance: {typeof pair.distance === 'number' ? pair.distance.toFixed(1) : '0.0'} mi | 
                      Time Window: {pair.timeWindow || '0'} min | 
                      Efficiency: {typeof pair.efficiency === 'number' ? (pair.efficiency * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
            {(!backhaulAnalysis.data.pairs || backhaulAnalysis.data.pairs.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No backhaul opportunities found</p>
            )}
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Performance Analytics</h3>
        
        {loadingAnalytics ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            {revenueAnalytics && revenueAnalytics.success && revenueAnalytics.data && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">System Revenue (24h)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="text-sm font-medium">${typeof revenueAnalytics.data.totalRevenue === 'number' ? revenueAnalytics.data.totalRevenue.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue per Hour:</span>
                    <span className="text-sm font-medium">${typeof revenueAnalytics.data.revenuePerHour === 'number' ? revenueAnalytics.data.revenuePerHour.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loaded Mile Ratio:</span>
                    <span className="text-sm font-medium">{typeof revenueAnalytics.data.loadedMileRatio === 'number' ? (revenueAnalytics.data.loadedMileRatio * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {performanceMetrics && performanceMetrics.success && performanceMetrics.data && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">System Performance (24h)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Trips:</span>
                    <span className="text-sm font-medium">{performanceMetrics.data.totalTrips || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Response Time:</span>
                    <span className="text-sm font-medium">{typeof performanceMetrics.data.averageResponseTime === 'number' ? performanceMetrics.data.averageResponseTime.toFixed(1) : '0.0'} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efficiency:</span>
                    <span className="text-sm font-medium">{typeof performanceMetrics.data.efficiency === 'number' ? (performanceMetrics.data.efficiency * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TCCRouteOptimizer;
