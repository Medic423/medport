import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CheckCircle, 
  AlertCircle, 
  X,
  ChevronRight,
  ChevronLeft,
  MapPin,
  User,
  Stethoscope,
  Truck,
  Building2,
  RefreshCw
} from 'lucide-react';
import { tripsAPI, dropdownOptionsAPI, healthcareDestinationsAPI } from '../services/api';

interface EnhancedTripFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    facilityName?: string;
    facilityType?: string;
    manageMultipleLocations?: boolean;
  };
  onTripCreated: (tripId?: string) => void; // Phase 3: Pass tripId to open dispatch screen
  onCancel?: () => void;
}

interface FormData {
  // Patient Information
  patientId: string;
  ageYears?: string; // direct entry years
  isNewborn?: boolean;
  isInfant?: boolean;
  isToddler?: boolean;
  patientWeight: string;
  specialNeeds: string;
  insuranceCompany: string;
  secondaryInsurance: string;
  generateQRCode: boolean;
  
  // Trip Details
  fromLocation: string;
  fromLocationId: string; // ✅ NEW: Reference to healthcare location
  pickupLocationId: string;
  toLocation: string;
  scheduledTime: string;
  transportLevel: string;
  urgencyLevel: string;
  
  // Clinical Details
  diagnosis: string;
  mobilityLevel: string;
  
  // Agency Selection
  selectedAgencies: string[];
  notificationRadius: number;
  
  // Unit Assignment (disabled)
  assignedUnitId: string;
  
  // Additional Notes
  notes: string;
}

interface PickupLocation {
  id: string;
  hospitalId: string;
  name: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  floor?: string;
  room?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hospital?: {
    id: string;
    name: string;
  };
  hospitals?: {  // Backend returns 'hospitals' (plural)
    id: string;
    name: string;
  };
}

interface HealthcareLocation {
  id: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  facilityType: string;
  isActive: boolean;
  isPrimary: boolean;
}

interface FormOptions {
  diagnosis: string[];
  mobility: string[];
  transportLevel: string[];
  urgency: string[];
  insurance: string[];
  secondaryInsurance: string[];
  specialNeeds: string[];
  facilities: any[];
  agencies: any[];
  pickupLocations: PickupLocation[];
  healthcareLocations: HealthcareLocation[]; // ✅ NEW: Healthcare locations for multi-location users
  availableUnits: any[]; // Units not used in Option B
}

const EnhancedTripForm: React.FC<EnhancedTripFormProps> = ({ user, onTripCreated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formOptions, setFormOptions] = useState<FormOptions>({
    diagnosis: [],
    mobility: [],
    transportLevel: [],
    urgency: [],
    insurance: [],
    secondaryInsurance: [],
    specialNeeds: [],
    facilities: [],
    agencies: [],
    pickupLocations: [],
    healthcareLocations: [], // ✅ NEW: Healthcare locations for multi-location users
    availableUnits: [] // Available units for optional assignment
  });

  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    ageYears: '',
    isNewborn: false,
    isInfant: false,
    isToddler: false,
    patientWeight: '',
    specialNeeds: '',
    insuranceCompany: '',
    secondaryInsurance: '',
    generateQRCode: false,
    fromLocation: user.facilityName || '',
    fromLocationId: '', // ✅ NEW: Will be set based on user's locations
    pickupLocationId: '',
    toLocation: '',
    scheduledTime: new Date().toISOString().slice(0, 16), // Default to current time in datetime-local format
    transportLevel: 'BLS',
    urgencyLevel: 'Routine',
    diagnosis: '',
    mobilityLevel: 'Ambulatory',
    selectedAgencies: [],
    notificationRadius: 100,
    assignedUnitId: 'N/A',
    notes: ''
  });

  const [destinationMode, setDestinationMode] = useState<'select' | 'manual'>('select');
  const [loadingPickupLocations, setLoadingPickupLocations] = useState(false);
  const [loadingFormData, setLoadingFormData] = useState(true); // Track when form options are being loaded
  // Phase A: Geographic filtering state
  const [showAllStates, setShowAllStates] = useState(false);
  
  // TCC Command: Facility selection for admin/user creating trips on behalf of facilities
  const [selectedTCCFacilityId, setSelectedTCCFacilityId] = useState<string>('');
  const [tccHealthcareFacilities, setTccHealthcareFacilities] = useState<HealthcareLocation[]>([]);
  const [loadingTCCFacilities, setLoadingTCCFacilities] = useState(false);
  const [tccFacilitySearch, setTccFacilitySearch] = useState<string>('');
  const [tccStateFilter, setTccStateFilter] = useState<string>('');

  // Phase A: Function to reload facilities when geographic filter changes
  const reloadFacilities = async () => {
    if (!user.manageMultipleLocations) return; // Only for multi-location users
    
    try {
      console.log('PHASE_A: Reloading facilities with showAllStates:', showAllStates);
      
      // Get the user's primary healthcare location for origin coordinates
      // Add cache-busting timestamp to ensure fresh data
      const cacheBuster1 = `_t=${Date.now()}`;
      const healthcareLocationsResponse = await api.get(`/api/healthcare/locations/active?${cacheBuster1}`);
      if (healthcareLocationsResponse.data?.success && Array.isArray(healthcareLocationsResponse.data.data)) {
        const healthcareLocations = healthcareLocationsResponse.data.data;
        const primaryLocation = healthcareLocations.find(loc => loc.isPrimary) || healthcareLocations[0];
        
        let facilitiesResponse;
        
        if (showAllStates) {
          // Load all facilities with geographic filtering
          console.log('PHASE_A: Loading all facilities within 100 miles');
          facilitiesResponse = await api.get('/api/tcc/facilities', {
            params: {
              originLat: primaryLocation.latitude,
              originLng: primaryLocation.longitude,
              radius: 100,
              isActive: true
            }
          });
        } else {
          // Load PA facilities only with geographic filtering
          console.log('PHASE_A: Loading PA facilities within 100 miles');
          facilitiesResponse = await api.get('/api/tcc/facilities', {
            params: {
              state: 'PA',
              originLat: primaryLocation.latitude,
              originLng: primaryLocation.longitude,
              radius: 100,
              isActive: true
            }
          });
        }
        
        if (facilitiesResponse.data?.success && Array.isArray(facilitiesResponse.data.data)) {
          const facilities = facilitiesResponse.data.data;
          console.log('PHASE_A: Reloaded', facilities.length, 'facilities');
          
          // Update form options
          setFormOptions(prev => ({
            ...prev,
            facilities
          }));
        }
      }
    } catch (error) {
      console.error('PHASE_A: Error reloading facilities:', error);
    }
  };

  const steps = [
    { id: 1, name: 'Patient Info', icon: User },
    { id: 2, name: 'Trip Details', icon: MapPin },
    { id: 3, name: 'Clinical Info', icon: Stethoscope },
    // { id: 4, name: 'Agency Selection', icon: Truck },
    // { id: 5, name: 'Review & Submit', icon: CheckCircle }
  ];

  useEffect(() => {
    console.log('MULTI_LOC: EnhancedTripForm useEffect triggered');
    console.log('MULTI_LOC: User object:', user);
    console.log('MULTI_LOC: user.manageMultipleLocations:', user.manageMultipleLocations);
    console.log('TCC_DEBUG: EnhancedTripForm mounting/remounting, loading fresh form options...');
    
    // Reset form data and options to clear any stale state
    setFormData({
      patientId: '',
      ageYears: '',
      isNewborn: false,
      isInfant: false,
      isToddler: false,
      patientWeight: '',
      specialNeeds: '',
      insuranceCompany: '',
      generateQRCode: false,
      fromLocation: user.facilityName || '',
      fromLocationId: '',
      pickupLocationId: '',
      toLocation: '',
      scheduledTime: new Date().toISOString().slice(0, 16),
      transportLevel: 'BLS',
      urgencyLevel: 'Routine',
      diagnosis: '',
      mobilityLevel: 'Ambulatory',
      selectedAgencies: [],
      notificationRadius: 100,
      assignedUnitId: 'N/A',
      notes: ''
    });
    
    // Clear form options to prevent showing stale dropdown data
    setFormOptions({
      diagnosis: [],
      mobility: [],
      transportLevel: [],
      urgency: [],
      insurance: [],
      specialNeeds: [],
      facilities: [],
      agencies: [],
      pickupLocations: [],
      healthcareLocations: [],
      availableUnits: []
    });
    
    // Always reload form options when component mounts or remounts
    // Cache-busting is added to API calls to ensure fresh data
    loadFormOptions();
    // Note: loadHealthcareLocations is now handled within loadFormOptions
    
    // TCC Command: Load all healthcare facilities for admin/user
    if (user.userType === 'ADMIN' || user.userType === 'USER') {
      loadTCCHealthcareFacilities();
    }
  }, [user.id]); // Re-run if user changes (e.g., switching accounts/tabs)
  
  // TCC Command: Fetch all healthcare facilities for facility selection
  const loadTCCHealthcareFacilities = async () => {
    try {
      setLoadingTCCFacilities(true);
      console.log('TCC_COMMAND: Loading all healthcare facilities for command staff...');
      
      // Use the /all endpoint for TCC command staff to get ALL facilities
      const response = await api.get('/api/healthcare/locations/all');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setTccHealthcareFacilities(response.data.data);
        console.log('TCC_COMMAND: Loaded', response.data.data.length, 'active healthcare facilities');
      }
    } catch (error) {
      console.error('TCC_COMMAND: Error loading healthcare facilities:', error);
      setError('Failed to load healthcare facilities. Please refresh and try again.');
    } finally {
      setLoadingTCCFacilities(false);
    }
  };
  
  // TCC Command: Handle facility selection
  const handleTCCFacilitySelection = (facilityId: string) => {
    console.log('TCC_COMMAND: Facility selected:', facilityId);
    setSelectedTCCFacilityId(facilityId);
    
    const facility = tccHealthcareFacilities.find(f => f.id === facilityId);
    if (facility) {
      // Pre-fill form with selected facility information
      setFormData(prev => ({
        ...prev,
        fromLocation: facility.locationName,
        fromLocationId: facility.id
      }));
      console.log('TCC_COMMAND: Pre-filled fromLocation with:', facility.locationName);
    }
  };

  // Load pickup locations when fromLocation is set (including pre-selected facility)
  useEffect(() => {
    // For multi-location users, use healthcare location ID
    if (user.manageMultipleLocations && formData.fromLocationId) {
      console.log('MULTI_LOC: Loading pickup locations for healthcare location:', formData.fromLocationId);
      loadPickupLocationsForHospital(formData.fromLocationId);
    }
    // For single-location users, use their hospital ID
    else if (!user.manageMultipleLocations && formData.fromLocation && formOptions.facilities.length > 0) {
      const selectedFacility = formOptions.facilities.find(f => f.name === formData.fromLocation);
      if (selectedFacility) {
        // Use hospital ID for pickup locations if available, otherwise use facility ID
        const pickupLocationId = selectedFacility.hospitalId || selectedFacility.id;
        console.log('SINGLE_LOC: Loading pickup locations for user facility:', pickupLocationId);
        loadPickupLocationsForHospital(pickupLocationId);
      } else {
        console.log('SINGLE_LOC: Facility not found in options yet:', formData.fromLocation, 'Available:', formOptions.facilities.map(f => f.name));
      }
    }
  }, [formData.fromLocation, formData.fromLocationId, formOptions.facilities, user.manageMultipleLocations]);

  // Load pickup locations when TCC facility is selected
  useEffect(() => {
    if (selectedTCCFacilityId && (user.userType === 'ADMIN' || user.userType === 'USER')) {
      console.log('TCC_COMMAND: Loading pickup locations for selected TCC facility:', selectedTCCFacilityId);
      loadPickupLocationsForHospital(selectedTCCFacilityId);
    }
  }, [selectedTCCFacilityId, user.userType]);

  // Load agencies when reaching step 4 (Agency Selection)
  useEffect(() => {
    console.log('TCC_DEBUG: Agency loading useEffect triggered', {
      currentStep,
      fromLocation: formData.fromLocation,
      facilitiesCount: formOptions.facilities.length
    });
    
    if (currentStep === 4 && formData.fromLocation && formOptions.facilities.length > 0) {
      const selectedFacility = formOptions.facilities.find(f => f.name === formData.fromLocation);
      console.log('TCC_DEBUG: Selected facility:', selectedFacility);
      if (selectedFacility) {
        loadAgenciesForHospital(selectedFacility.id);
      }
    }
  }, [currentStep, formData.fromLocation, formOptions.facilities]);

  const loadFormOptions = async () => {
    setLoadingFormData(true); // Start loading
    try {
      console.log('TCC_DEBUG: Loading real form options from API...');
      
      // Phase A: Smart defaults for geographic filtering
      let facilities = [];
    let healthcareLocations: HealthcareLocation[] = [];

      // Determine effective multi-location behavior with persistence
      const isMultiLocationUser = ((): boolean => {
        const persisted = typeof window !== 'undefined' ? localStorage.getItem('tcc_multi_loc') === 'true' : false;
        const effective = user.manageMultipleLocations || persisted;
        console.log('[FORM-DEBUG] isMultiLocationUser calculation:', {
          'user.manageMultipleLocations': user.manageMultipleLocations,
          'persisted (localStorage)': persisted,
          'effective (result)': effective
        });
        if (effective && typeof window !== 'undefined') {
          localStorage.setItem('tcc_multi_loc', 'true');
        }
        return effective;
      })();
      
      console.log('[FORM-DEBUG] About to load facilities. isMultiLocationUser:', isMultiLocationUser);
      
      if (isMultiLocationUser) {
        // For Penn Highlands users, load healthcare locations AND facilities with geographic filtering
        console.log('PHASE_A: Loading healthcare locations and facilities for Penn Highlands user');
        
        // Get the user's healthcare locations for the "From Location" dropdown
        // Add cache-busting timestamp to ensure fresh data
        const cacheBuster = `_t=${Date.now()}`;
        const healthcareLocationsResponse = await api.get(`/api/healthcare/locations/active?${cacheBuster}`);
        if (healthcareLocationsResponse.data?.success && Array.isArray(healthcareLocationsResponse.data.data)) {
          healthcareLocations = healthcareLocationsResponse.data.data;
          console.log('MULTI_LOC: Loaded', healthcareLocations.length, 'healthcare locations for form options:', healthcareLocations.map(l => l.locationName));
          
          const primaryLocation = healthcareLocations.find(loc => loc.isPrimary) || healthcareLocations[0];
          
          if (primaryLocation && primaryLocation.latitude && primaryLocation.longitude) {
            console.log('PHASE_A: Using primary location as origin:', primaryLocation.locationName);
            
            // Load facilities within 100 miles of the primary location, limited to PA
            console.log('[FORM-DEBUG] Attempting to fetch facilities API with params:', { state: 'PA', radius: 100 });
            try {
              const facilitiesResponse = await api.get('/api/tcc/facilities', {
                params: {
                  state: 'PA',
                  originLat: primaryLocation.latitude,
                  originLng: primaryLocation.longitude,
                  radius: 100,
                  _t: Date.now(), // Cache-busting
                  isActive: true
                }
              });
              console.log('[FORM-DEBUG] Facilities API response:', facilitiesResponse.data);
              if (facilitiesResponse.data?.success && Array.isArray(facilitiesResponse.data.data)) {
                facilities = facilitiesResponse.data.data;
                console.log('PHASE_A: Loaded', facilities.length, 'PA facilities within 100 miles of', primaryLocation.locationName);
              }
            } catch (e) {
              console.error('[FORM-DEBUG] Facilities API failed with error:', e);
              console.warn('PHASE_A: Facilities API failed, falling back to public hospitals');
            }
            // Fallback if protected facilities returned none
            console.log('[FORM-DEBUG] Checking if facilities fallback is needed. Current facilities count:', facilities.length);
            if (!facilities || facilities.length === 0) {
              console.log('[FORM-DEBUG] Facilities empty or zero, attempting public hospitals fallback');
              try {
                const publicHospitals = await api.get('/api/public/hospitals');
                console.log('[FORM-DEBUG] Public hospitals response:', publicHospitals.data);
                if (publicHospitals.data?.success && Array.isArray(publicHospitals.data.data)) {
                  // Filter to PA only
                  facilities = publicHospitals.data.data.filter((f: any) => f.state === 'PA');
                  console.log('PHASE_A: Fallback loaded', facilities.length, 'public hospitals in PA');
                }
              } catch (e) {
                console.error('[FORM-DEBUG] Public hospitals fallback failed:', e);
                console.warn('PHASE_A: Public hospitals fallback failed');
              }
            }
          } else {
            console.warn('PHASE_A: Primary location missing coordinates, falling back to PA facilities only');
            // Fallback to PA facilities only without geographic filtering
            try {
              const facilitiesResponse = await api.get('/api/tcc/facilities', {
                params: { state: 'PA', isActive: true, _t: Date.now() } // Cache-busting
              });
              if (facilitiesResponse.data?.success && Array.isArray(facilitiesResponse.data.data)) {
                facilities = facilitiesResponse.data.data;
              }
            } catch (e) {
              console.warn('PHASE_A: Facilities API (no-geo) failed, using public hospitals fallback');
            }
            if (!facilities || facilities.length === 0) {
              try {
                const publicHospitals = await api.get('/api/public/hospitals');
                if (publicHospitals.data?.success && Array.isArray(publicHospitals.data.data)) {
                  facilities = publicHospitals.data.data.filter((f: any) => f.state === 'PA');
                }
              } catch {}
            }
          }
        }
      } else {
        // For single-location users, load ALL facilities for destination selection
        console.log('SINGLE_LOC: Single-location user - loading all facilities for destination options');
        
        // Load ALL facilities from /api/public/hospitals for "To Location" dropdown
        const facilitiesResponse = await api.get('/api/public/hospitals');
        if (facilitiesResponse.data?.success && Array.isArray(facilitiesResponse.data.data)) {
          facilities = facilitiesResponse.data.data;
          console.log('SINGLE_LOC: Loaded', facilities.length, 'facilities for destination selection');
        }
        
        // Find the user's own facility for "From Location" (already loaded above)
        let userHospital = facilities.find((h: any) => h.name === user.facilityName);
        
        // Special case: If "Test Hospital" is found with hosp_ ID, we need to handle both facility and hospital IDs
        if (userHospital && userHospital.id === 'hosp_test_001') {
          // Keep the original hospital ID for pickup locations, but use facility ID for trip creation
          userHospital = {
            ...userHospital,
            id: 'fac_test_hospital_001', // Use facility ID for trip creation
            hospitalId: 'hosp_test_001'  // Keep hospital ID for pickup locations
          };
          // Update the facilities array to use the correct ID
          facilities = facilities.map(f => 
            f.id === 'hosp_test_001' ? { ...f, id: 'fac_test_hospital_001' } : f
          );
        }
        
        if (userHospital) {
          console.log('SINGLE_LOC: Found user hospital for pickup locations:', userHospital);
          
          // Set fromLocation to user's facility
          setFormData(prev => ({
            ...prev,
            fromLocation: user.facilityName || '',
          }));
        } else {
          console.warn('SINGLE_LOC: User facility not found in hospitals list:', user.facilityName);
        }
        
        // Ensure healthcareLocations is empty for single-location users
        healthcareLocations = [];
      }
      
      // ✅ Phase 3: Load healthcare locations (9 Penn Highlands locations) and healthcare destinations (Maybrook Hills)
      // These should be combined with facilities for the "To Location" dropdown
      let healthcareLocationsForDestinations: any[] = [];
      let healthcareDestinations: any[] = [];
      
      try {
        // Load healthcare locations (Hospital Settings -> Manage Locations)
        // Add cache-busting timestamp to ensure fresh data
        const cacheBuster2 = `_t=${Date.now()}`;
        const locationsResponse = await api.get(`/api/healthcare/locations/active?${cacheBuster2}`);
        if (locationsResponse.data?.success && Array.isArray(locationsResponse.data.data)) {
          healthcareLocationsForDestinations = locationsResponse.data.data.map((loc: any) => ({
            id: `loc_${loc.id}`,
            name: loc.locationName,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zipCode,
            type: loc.facilityType || 'Hospital',
            phone: loc.phone || '',
            email: '',
            capabilities: [],
            region: loc.state,
            isActive: loc.isActive,
            latitude: loc.latitude,
            longitude: loc.longitude
          }));
          console.log('PHASE3_DESTINATIONS: Loaded', healthcareLocationsForDestinations.length, 'healthcare locations for To Location dropdown');
        }
      } catch (error) {
        console.error('PHASE3_DESTINATIONS: Error loading healthcare locations:', error);
      }
      
      try {
        // Load healthcare destinations (Healthcare -> My Healthcare Destinations)
        const destinationsResponse = await healthcareDestinationsAPI.getAll({ isActive: true });
        if (destinationsResponse.data?.success && Array.isArray(destinationsResponse.data.data)) {
          healthcareDestinations = destinationsResponse.data.data.map((dest: any) => ({
            id: `dest_${dest.id}`,
            name: dest.name,
            address: dest.address,
            city: dest.city,
            state: dest.state,
            zipCode: dest.zipCode,
            type: dest.type || 'Destination',
            phone: dest.phone || '',
            email: dest.email || '',
            capabilities: [],
            region: dest.state,
            isActive: dest.isActive,
            latitude: dest.latitude,
            longitude: dest.longitude
          }));
          console.log('PHASE3_DESTINATIONS: Loaded', healthcareDestinations.length, 'healthcare destinations for To Location dropdown');
        }
      } catch (error) {
        console.error('PHASE3_DESTINATIONS: Error loading healthcare destinations:', error);
      }
      
      // Combine all destinations: facilities + healthcare locations + healthcare destinations
      // Remove duplicates by name to avoid showing the same destination multiple times
      const allDestinations = [
        ...facilities,
        ...healthcareLocationsForDestinations,
        ...healthcareDestinations
      ];
      
      // Deduplicate by name (keep first occurrence)
      const uniqueDestinations = allDestinations.filter((dest, index, self) =>
        index === self.findIndex(d => d.name === dest.name && d.city === dest.city && d.state === dest.state)
      );
      
      console.log('PHASE3_DESTINATIONS: Combined destinations:', {
        facilities: facilities.length,
        healthcareLocations: healthcareLocationsForDestinations.length,
        healthcareDestinations: healthcareDestinations.length,
        total: allDestinations.length,
        unique: uniqueDestinations.length
      });
      
      if (facilities.length === 0 && uniqueDestinations.length === 0) {
        console.warn('TCC_DEBUG: Failed to load any destinations, using fallback');
        facilities = [];
      } else {
        // Use the combined unique destinations
        facilities = uniqueDestinations;
      }
      
      // Load dropdown options from backend Hospital Settings
      const [diagRes, mobRes, tlRes, urgRes, insRes, secInsRes, snRes] = await Promise.all([
        dropdownOptionsAPI.getByCategory('diagnosis').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('mobility').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('transport-level').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('urgency').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('insurance').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('secondary-insurance').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('special-needs').catch(() => ({ data: { success: false, data: [] }})),
      ]);

      const toValues = (resp: any, fallback: string[]) => (resp?.data?.success && Array.isArray(resp.data.data) ? resp.data.data.map((o: any) => o.value) : fallback);

      // Ensure urgency always has baseline defaults merged with hospital settings
      // Filter out "Critical" since backend only accepts Routine/Urgent/Emergent
      const urgencyDefaults = ['Routine', 'Urgent', 'Emergent'];
      const urgencyFromAPI = toValues(urgRes, []);
      const urgencyOptions = [...urgencyDefaults, ...urgencyFromAPI.filter(val => !urgencyDefaults.includes(val) && val !== 'Critical')];

      const options: FormOptions = {
        diagnosis: toValues(diagRes, ['Cardiac', 'Respiratory', 'Neurological', 'Trauma']),
        mobility: toValues(mobRes, ['Ambulatory', 'Wheelchair', 'Stretcher', 'Bed-bound']),
        transportLevel: toValues(tlRes, ['BLS', 'ALS', 'CCT', 'Other']),
        urgency: urgencyOptions,
        insurance: toValues(insRes, ['Medicare', 'Medicaid', 'Private', 'Self-pay']),
        secondaryInsurance: toValues(secInsRes, []),
        specialNeeds: toValues(snRes, ['Bariatric Stretcher']),
        facilities: facilities,
        agencies: [],
        pickupLocations: [],
        healthcareLocations: healthcareLocations, // ✅ Use the loaded healthcare locations
        availableUnits: [] // Available units for optional assignment
      };
 
      console.log('TCC_DEBUG: Setting real form options:', options);
      console.log('MULTI_LOC: Healthcare locations being set in formOptions:', healthcareLocations.length, 'locations');
      setFormOptions(options);
      
      // Set default fromLocation and fromLocationId for multi-location users
      if (isMultiLocationUser && healthcareLocations.length > 0) {
        const primaryLocation = healthcareLocations.find(loc => loc.isPrimary);
        console.log('MULTI_LOC: Primary location found:', primaryLocation);
        if (primaryLocation) {
          setFormData(prev => ({
            ...prev,
            fromLocation: primaryLocation.locationName,
            fromLocationId: primaryLocation.id
          }));
          console.log('MULTI_LOC: Set default location:', primaryLocation.locationName);
        }
      }
 
      // Apply defaults from backend
      try {
        const [tl, urg, dx, mob, ins, sn] = await Promise.all([
          api.get('/api/dropdown-options/transport-level/default'),
          api.get('/api/dropdown-options/urgency/default'),
          api.get('/api/dropdown-options/diagnosis/default'),
          api.get('/api/dropdown-options/mobility/default'),
          api.get('/api/dropdown-options/insurance/default'),
          api.get('/api/dropdown-options/special-needs/default')
        ]);
        setFormData(prev => {
          // Filter out "Critical" from urgency default since backend doesn't accept it
          const backendUrgencyDefault = urg.data?.data?.option?.value;
          const validUrgencyDefault = backendUrgencyDefault && ['Routine', 'Urgent', 'Emergent'].includes(backendUrgencyDefault) 
            ? backendUrgencyDefault 
            : prev.urgencyLevel;
          
          return {
          ...prev,
          transportLevel: tl.data?.data?.option?.value || prev.transportLevel,
          urgencyLevel: validUrgencyDefault,
          diagnosis: dx.data?.data?.option?.value ? dx.data.data.option.value : '',
          mobilityLevel: mob.data?.data?.option?.value || prev.mobilityLevel,
          insuranceCompany: ins.data?.data?.option?.value || prev.insuranceCompany,
          specialNeeds: sn.data?.data?.option?.value || prev.specialNeeds
          };
        });
      } catch (e) {
        console.warn('TCC_DEBUG: Defaults not available yet');
      }
      
      setLoadingFormData(false); // Done loading
    } catch (error) {
      console.error('Error loading form options:', error);
      setLoadingFormData(false); // Done loading even on error
      // Fallback to basic options if API fails
      const fallbackOptions: FormOptions = {
        diagnosis: ['Cardiac', 'Respiratory', 'Neurological', 'Trauma'],
        mobility: ['Ambulatory', 'Wheelchair', 'Stretcher', 'Bed-bound'],
        transportLevel: ['BLS', 'ALS', 'CCT', 'Other'],
        urgency: ['Routine', 'Urgent', 'Emergent'],
        insurance: ['Medicare', 'Medicaid', 'Private', 'Self-pay'],
        specialNeeds: ['Bariatric Stretcher'],
        facilities: [],
        agencies: [],
        pickupLocations: [],
        healthcareLocations: [], // ✅ Initialize empty array for healthcare locations
        availableUnits: [] // Available units for optional assignment
      };
      setFormOptions(fallbackOptions);
    }
  };

  // Note: loadHealthcareLocations functionality has been moved into loadFormOptions
  // to prevent race conditions and ensure healthcare locations are properly set

  const loadAgenciesForHospital = async (hospitalId: string) => {
    try {
      console.log('TCC_DEBUG: Loading agencies for hospital:', hospitalId, 'with radius:', formData.notificationRadius);
      
      if (!hospitalId) {
        console.warn('TCC_DEBUG: No hospital ID provided for agencies');
        setFormOptions(prev => ({
          ...prev,
          agencies: []
        }));
        return;
      }

      const response = await tripsAPI.getAgenciesForHospital(hospitalId, formData.notificationRadius);
      console.log('TCC_DEBUG: Agencies response:', response.data);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        console.log('TCC_DEBUG: Setting agencies:', response.data.data.length, 'agencies');
        setFormOptions(prev => ({
          ...prev,
          agencies: response.data.data
        }));
      } else {
        console.warn('TCC_DEBUG: Invalid agencies response structure:', response.data);
        setFormOptions(prev => ({
          ...prev,
          agencies: []
        }));
      }
    } catch (error) {
      console.error('Error loading agencies:', error);
      setFormOptions(prev => ({
        ...prev,
        agencies: []
      }));
    }
  };

  const loadAvailableUnits = async () => {
    try {
      console.log('TCC_DEBUG: Loading available units for selected agencies:', formData.selectedAgencies);
      
      if (formData.selectedAgencies.length === 0) {
        setFormOptions(prev => ({
          ...prev,
          availableUnits: []
        }));
        return;
      }

      // Units not used for assignment in Option B
      setFormOptions(prev => ({ ...prev, availableUnits: [] }));
    } catch (error) {
      console.error('TCC_DEBUG: Error loading available units:', error);
      setFormOptions(prev => ({
        ...prev,
        availableUnits: []
      }));
    }
  };

  const loadPickupLocationsForHospital = async (hospitalId: string) => {
    try {
      setLoadingPickupLocations(true);
      console.log('TCC_DEBUG: Loading pickup locations for hospital:', hospitalId);
      
      if (!hospitalId) {
        console.warn('TCC_DEBUG: No hospital ID provided for pickup locations');
        setFormOptions(prev => ({
          ...prev,
          pickupLocations: []
        }));
        return;
      }

      const response = await api.get(`/api/tcc/pickup-locations/hospital/${hospitalId}`);
      console.log('TCC_DEBUG: Pickup locations response:', response.data);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        console.log('TCC_DEBUG: Setting pickup locations:', response.data.data.length, 'locations');
        
        // Transform the data to ensure it matches our interface
        const transformedLocations = response.data.data.map((location: any) => ({
          id: location.id || `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          hospitalId: location.hospitalId || '',
          name: location.name || 'Unnamed Location',
          description: location.description || '',
          contactPhone: location.contactPhone || '',
          contactEmail: location.contactEmail || '',
          floor: location.floor || '',
          room: location.room || '',
          isActive: location.isActive !== undefined ? location.isActive : true,
          createdAt: location.createdAt || new Date().toISOString(),
          updatedAt: location.updatedAt || new Date().toISOString(),
          hospital: location.hospital || location.hospitals || null, // Handle both singular and plural
          hospitals: location.hospitals || location.hospital || null
        }));
        
        console.log('TCC_DEBUG: Transformed pickup locations:', transformedLocations);
        setFormOptions(prev => ({
          ...prev,
          pickupLocations: transformedLocations
        }));
      } else {
        console.warn('TCC_DEBUG: Invalid pickup locations response structure:', response.data);
        setFormOptions(prev => ({
          ...prev,
          pickupLocations: []
        }));
      }
    } catch (error) {
      console.error('Error loading pickup locations:', error);
      setFormOptions(prev => ({
        ...prev,
        pickupLocations: []
      }));
    } finally {
      setLoadingPickupLocations(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle healthcare location selection for multi-location users
    if (name === 'fromLocation' && (user.manageMultipleLocations || (typeof window !== 'undefined' && localStorage.getItem('tcc_multi_loc') === 'true'))) {
      const selectedLocation = formOptions.healthcareLocations.find(loc => loc.locationName === value);
      if (selectedLocation) {
        setFormData(prev => ({
          ...prev,
          fromLocation: selectedLocation.locationName,
          fromLocationId: selectedLocation.id
        }));
        console.log('MULTI_LOC: Selected healthcare location:', selectedLocation);
        // Load pickup locations for this healthcare location
        loadPickupLocationsForHospital(selectedLocation.id);
      }
    } else {
      // Handle number inputs (convert to number)
      if (type === 'number') {
        const numValue = value === '' ? 0 : Number(value);
        setFormData(prev => ({
          ...prev,
          [name]: isNaN(numValue) ? prev[name as keyof FormData] : numValue
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
      }
    }

    // Load pickup locations when fromLocation changes (for regular facilities)
    if (name === 'fromLocation' && value && !user.manageMultipleLocations) {
      const selectedFacility = formOptions.facilities.find(f => f.name === value);
      if (selectedFacility) {
        loadPickupLocationsForHospital(selectedFacility.id);
      } else {
        // Clear pickup locations if facility not found
        setFormOptions(prev => ({
          ...prev,
          pickupLocations: []
        }));
        setFormData(prev => ({
          ...prev,
          pickupLocationId: ''
        }));
      }
    }

    // Load agencies when destination changes (only for selected facilities)
    if (name === 'toLocation' && value && destinationMode === 'select') {
      const selectedFacility = formOptions.facilities.find(f => f.name === value);
      if (selectedFacility) {
        loadAgenciesForHospital(selectedFacility.id);
      }
    }
  };

  const handleSpecialNeedsChange = (need: string, checked: boolean) => {
    setFormData(prev => {
      const currentNeeds = prev.specialNeeds 
        ? prev.specialNeeds.split(',').map(n => n.trim()).filter(n => n !== '')
        : [];
      
      let newNeeds: string[];
      if (checked) {
        // Add if not already present
        newNeeds = currentNeeds.includes(need) 
          ? currentNeeds 
          : [...currentNeeds, need];
      } else {
        // Remove
        newNeeds = currentNeeds.filter(n => n !== need);
      }
      
      return {
        ...prev,
        specialNeeds: newNeeds.join(', ')
      };
    });
  };

  const handleDestinationModeChange = (mode: 'select' | 'manual') => {
    setDestinationMode(mode);
    // Clear destination when switching modes
    setFormData(prev => ({
      ...prev,
      toLocation: ''
    }));
    // Clear agencies when switching to manual mode
    if (mode === 'manual') {
      setFormOptions(prev => ({
        ...prev,
        agencies: []
      }));
    }
  };

  const handleAgencyToggle = (agencyId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAgencies: prev.selectedAgencies.includes(agencyId)
        ? prev.selectedAgencies.filter(id => id !== agencyId)
        : [...prev.selectedAgencies, agencyId],
      assignedUnitId: 'N/A'
    }));
  };

  // Load available units when selected agencies change
  useEffect(() => {
    loadAvailableUnits();
  }, [formData.selectedAgencies]);

  const generatePatientId = () => {
    // Generate a random patient ID (in real app, this would be more sophisticated)
    const randomId = 'P' + Math.random().toString(36).substr(2, 8).toUpperCase();
    setFormData(prev => ({
      ...prev,
      patientId: randomId
    }));
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent any form submission
    console.log('TCC_DEBUG: handleNext called, current step:', currentStep, 'total steps:', steps.length);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      console.log('TCC_DEBUG: Advanced to step:', currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TCC_DEBUG: handleSubmit called, current step:', currentStep);
    
    // Prevent submission if data is still loading
    if (loadingFormData) {
      console.log('TCC_DEBUG: Form data is still loading, please wait...');
      setError('Please wait for form data to finish loading');
      return;
    }
    
    // Only allow submission on the final step
    if (currentStep < steps.length) {
      console.log('TCC_DEBUG: Submission blocked - not on final step');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Validate step 1 required fields (Patient Info)
      if (!formData.patientId || !formData.patientWeight) {
        throw new Error('Please fill in Patient ID and Patient Weight');
      }
      // Age logic: require valid years only if not newborn/infant-toddler
      if (!formData.isNewborn && !formData.isInfant && !formData.isToddler) {
        const years = parseInt((formData.ageYears || '').trim(), 10);
        if (!Number.isInteger(years) || years < 1 || years > 110) {
          throw new Error('Please enter a valid patient age (1-110 years) or select Newborn/Infant-Toddler');
        }
      }

      // Validate patient weight is a number
      const weight = parseFloat(formData.patientWeight);
      if (isNaN(weight) || weight <= 0) {
        throw new Error('Please enter a valid patient weight');
      }

      // Validate step 2 required fields (Trip Details)
      // Pickup Location is optional for some facilities; do not block submission on it
      console.log('TCC_DEBUG: Validating trip details:', {
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        scheduledTime: formData.scheduledTime,
        transportLevel: formData.transportLevel,
        urgencyLevel: formData.urgencyLevel
      });
      
      const missingFields: string[] = [];
      if (!formData.fromLocation || formData.fromLocation.trim() === '') missingFields.push('From Location');
      if (!formData.toLocation || formData.toLocation.trim() === '') missingFields.push('To Location');
      if (!formData.scheduledTime || formData.scheduledTime.trim() === '') missingFields.push('Scheduled Time');
      if (!formData.transportLevel || formData.transportLevel.trim() === '') missingFields.push('Transport Level');
      if (!formData.urgencyLevel || formData.urgencyLevel.trim() === '') missingFields.push('Urgency Level');
      
      if (missingFields.length > 0) {
        console.error('TCC_DEBUG: Missing required fields:', missingFields);
        throw new Error(`Please fill in all trip details: ${missingFields.join(', ')}`);
      }

      // Validate scheduled time is not in the past
      if (new Date(formData.scheduledTime) < new Date()) {
        throw new Error('Scheduled time cannot be in the past');
      }

      // Validate transport level
      if (!['BLS', 'ALS', 'CCT', 'Other'].includes(formData.transportLevel)) {
        throw new Error('Invalid transport level');
      }

      // Validate urgency level (backend only accepts Routine/Urgent/Emergent)
      if (!['Routine', 'Urgent', 'Emergent'].includes(formData.urgencyLevel)) {
        throw new Error('Invalid urgency level. Must be Routine, Urgent, or Emergent');
      }

      // Create the trip in the database
      console.log('TCC_DEBUG: Creating trip with data:', formData);
      
      // Find the selected facility for fromLocation
      // For multi-location users, search in healthcareLocations; otherwise use facilities
      let selectedFacility;
      if (user.manageMultipleLocations) {
        selectedFacility = formOptions.healthcareLocations.find(f => f.locationName === formData.fromLocation);
      } else {
        selectedFacility = formOptions.facilities.find(f => f.name === formData.fromLocation);
      }
      
      if (!selectedFacility) {
        console.error('TCC_DEBUG: Selected facility not found. fromLocation:', formData.fromLocation);
        console.error('TCC_DEBUG: Available healthcareLocations:', formOptions.healthcareLocations.map(l => l.locationName));
        console.error('TCC_DEBUG: Available facilities:', formOptions.facilities.map(f => f.name));
        throw new Error('Selected facility not found');
      }

      // Find the destination facility
      const destinationFacility = formOptions.facilities.find(f => f.name === formData.toLocation);
      if (!destinationFacility) {
        throw new Error('Destination facility not found');
      }

      // Prepare trip data for API
      const tripData = {
        patientId: formData.patientId,
        patientWeight: parseFloat(formData.patientWeight),
        originFacilityId: selectedFacility.id,
        destinationFacilityId: destinationFacility.id,
        transportLevel: formData.transportLevel,
        urgencyLevel: formData.urgencyLevel,
        priority: formData.urgencyLevel === 'Emergent' ? 'HIGH' :
                 formData.urgencyLevel === 'Urgent' ? 'MEDIUM' : 'LOW',
        specialRequirements: formData.specialNeeds || '',
        readyStart: new Date(formData.scheduledTime).toISOString(),
        readyEnd: new Date(new Date(formData.scheduledTime).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour window
        isolation: false,
        bariatric: parseFloat(formData.patientWeight) > 300, // Consider bariatric if weight > 300 lbs
        pickupLocationId: formData.pickupLocationId,
        notes: formData.notes || '',
        // ✅ Multi-location support for healthcare users
        fromLocationId: user.manageMultipleLocations ? formData.fromLocationId : 
                       (user.userType === 'ADMIN' || user.userType === 'USER') ? selectedTCCFacilityId : undefined,
        healthcareUserId: user.manageMultipleLocations ? user.id : undefined,
        // ✅ TCC Command: Audit trail for trips created by admin/user
        createdByTCCUserId: (user.userType === 'ADMIN' || user.userType === 'USER') ? user.id : undefined,
        createdByTCCUserEmail: (user.userType === 'ADMIN' || user.userType === 'USER') ? user.email : undefined,
        createdVia: (user.userType === 'ADMIN' || user.userType === 'USER') ? 'TCC_ADMIN_PORTAL' : 'HEALTHCARE_PORTAL',
        assignedUnitId: formData.assignedUnitId // Optional unit assignment
      };

      console.log('TCC_DEBUG: Submitting trip data:', tripData);

      // Submit trip to API (healthcare users use enhanced endpoint so trip shows in list)
      const ageCategory = formData.isNewborn ? 'NEWBORN' : formData.isInfant ? 'INFANT' : formData.isToddler ? 'TODDLER' : 'ADULT';
      const ageYears = ageCategory === 'ADULT' && formData.ageYears ? parseInt(formData.ageYears, 10) : undefined;

      const enhancedPayload = {
            patientId: tripData.patientId,
            patientWeight: formData.patientWeight,
            specialNeeds: formData.specialNeeds,
            insuranceCompany: formData.insuranceCompany,
            patientAgeCategory: ageCategory as any,
            patientAgeYears: ageYears,
            fromLocation: formData.fromLocation,
            fromLocationId: formData.fromLocationId || undefined,
            pickupLocationId: formData.pickupLocationId || undefined,
            toLocation: formData.toLocation,
            scheduledTime: new Date(formData.scheduledTime).toISOString(),
            transportLevel: formData.transportLevel as any,
            urgencyLevel: formData.urgencyLevel as any,
            diagnosis: formData.diagnosis || undefined,
            mobilityLevel: formData.mobilityLevel as any,
            generateQRCode: false,
            selectedAgencies: [], // Phase 3: Agencies not selected at creation
            notificationRadius: formData.notificationRadius ? Number(formData.notificationRadius) : 100, // SMS notification radius in miles
            notes: formData.secondaryInsurance 
              ? `${formData.notes || ''}${formData.notes ? '\n' : ''}Secondary Insurance: ${formData.secondaryInsurance}`.trim()
              : formData.notes,
            priority: (tripData as any).priority,
            status: 'PENDING_DISPATCH', // Phase 3: Set status to PENDING_DISPATCH for dispatch workflow
            // assignedUnitId removed (not applicable)
            createdVia: 'HEALTHCARE_PORTAL'
          };
      
      console.log('TCC_DEBUG: Enhanced payload being sent:', enhancedPayload);
      console.log('TCC_DEBUG: Age fields in payload:', { patientAgeCategory: enhancedPayload.patientAgeCategory, patientAgeYears: enhancedPayload.patientAgeYears });

      const response = user.userType === 'HEALTHCARE'
        ? await tripsAPI.createEnhanced(enhancedPayload)
        : await tripsAPI.create({ ...tripData, assignedUnitId: undefined });
      
      if (response.data.success) {
        console.log('TCC_DEBUG: Trip created successfully:', response.data.data);
        const createdTripId = response.data.data?.id;
        setSuccess(true);
        setTimeout(() => {
          onTripCreated(createdTripId); // Phase 3: Pass tripId for dispatch screen
        }, 1500); // Reduced time - user will go to dispatch screen
      } else {
        console.error('TCC_DEBUG: Backend responded with error payload:', response.data);
        throw new Error(response.data.error || 'Failed to create transport request');
      }

    } catch (error: any) {
      console.error('TCC_DEBUG: Error creating trip:', error);
      console.error('TCC_DEBUG: Error response data:', error.response?.data);
      console.error('TCC_DEBUG: Error response status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create transport request';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter patient ID"
                  />
                  <button
                    type="button"
                    onClick={generatePatientId}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Generate ID
                  </button>
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kgs)
                </label>
                <input
                  type="text"
                  name="patientWeight"
                  value={formData.patientWeight}
                  onChange={handleChange}
                  inputMode="decimal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter weight in kilograms"
                />
              </div>
            </div>

            {/* Pediatric quick flags and Age (years) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6 flex items-center space-x-6">
                <label className="inline-flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="isNewborn"
                    checked={!!formData.isNewborn}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  Newborn
                </label>
                <label className="inline-flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="isInfant"
                    checked={!!formData.isInfant}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  Infant
                </label>
                <label className="inline-flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="isToddler"
                    checked={!!formData.isToddler}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  Toddler
                </label>
              </div>
              <div className="md:col-span-3 md:col-start-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (years)
                </label>
                <input
                  type="text"
                  name="ageYears"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.ageYears || ''}
                  onChange={handleChange}
                  disabled={!!formData.isNewborn || !!formData.isInfant || !!formData.isToddler}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-24 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="1 - 110"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Company
                </label>
                <select
                  name="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select insurance company</option>
                  {formOptions.insurance.map((insurance) => (
                    <option key={insurance} value={insurance}>{insurance}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Insurance
                </label>
                <select
                  name="secondaryInsurance"
                  value={formData.secondaryInsurance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select secondary insurance</option>
                  {(formOptions.secondaryInsurance || []).map((insurance) => (
                    <option key={insurance} value={insurance}>{insurance}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* QR Code generation temporarily disabled for first version */}
            {/* <div className="flex items-center">
              <input
                type="checkbox"
                name="generateQRCode"
                checked={formData.generateQRCode}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Generate QR Code for patient tracking
              </label>
            </div> */}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-sm font-medium text-green-800">Trip Details</h3>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Specify origin, destination, and transport requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Location *
                </label>
                {!user.manageMultipleLocations ? (
                  /* Single-location users: Show facility name as disabled input */
                  <div className="relative">
                    <input
                      type="text"
                      value={user.facilityName || 'Your Facility'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-gray-700 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  /* Multi-location users: Show dropdown to select location */
                  <select
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select origin facility</option>
                    {console.log('MULTI_LOC: Rendering healthcare locations dropdown with', formOptions.healthcareLocations.length, 'locations:', formOptions.healthcareLocations)}
                    {formOptions.healthcareLocations.map((location) => (
                      <option key={location.id} value={location.locationName}>
                        {location.locationName} - {location.city}, {location.state}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                {(() => {
                  try {
                    return (
                      <select
                        name="pickupLocationId"
                        value={formData.pickupLocationId}
                        onChange={handleChange}
                        required
                        disabled={loadingPickupLocations}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {loadingPickupLocations ? 'Loading pickup locations...' : 'Select pickup location'}
                        </option>
                        {formOptions.pickupLocations && formOptions.pickupLocations.length > 0 ? (
                          formOptions.pickupLocations.map((location) => {
                            try {
                              console.log('TCC_DEBUG: Rendering pickup location option:', location);
                              
                              // Ensure location has required properties
                              if (!location || !location.id || !location.name) {
                                console.warn('TCC_DEBUG: Invalid pickup location data:', location);
                                return null;
                              }
                              
                              return (
                                <option key={location.id} value={location.id}>
                                  {location.name} {location.floor && `(${location.floor})`}
                                </option>
                              );
                            } catch (error) {
                              console.error('TCC_DEBUG: Error rendering pickup location option:', error, location);
                              return null;
                            }
                          }).filter(Boolean) // Remove null entries
                        ) : (
                          !loadingPickupLocations && formData.fromLocation && (
                            <option value="" disabled>
                              No pickup locations available for this facility
                            </option>
                          )
                        )}
                      </select>
                    );
                  } catch (error) {
                    console.error('TCC_DEBUG: Error rendering pickup location select:', error);
                    return (
                      <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700">
                        Error loading pickup locations. Please refresh the page.
                      </div>
                    );
                  }
                })()}
                {formData.pickupLocationId && formOptions.pickupLocations && (
                  <div className="mt-2 text-sm text-gray-600">
                    {(() => {
                      const selectedLocation = formOptions.pickupLocations.find(loc => loc.id === formData.pickupLocationId);
                      return selectedLocation ? (
                        <div>
                          {selectedLocation.contactPhone && (
                            <p><strong>Contact:</strong> {selectedLocation.contactPhone}</p>
                          )}
                          {selectedLocation.contactEmail && (
                            <p><strong>Email:</strong> {selectedLocation.contactEmail}</p>
                          )}
                          {selectedLocation.room && (
                            <p><strong>Room:</strong> {selectedLocation.room}</p>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Location *
                </label>
                
                {/* Destination Mode Toggle */}
                <div className="flex space-x-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="destinationMode"
                      value="select"
                      checked={destinationMode === 'select'}
                      onChange={(e) => handleDestinationModeChange(e.target.value as 'select' | 'manual')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Select from list</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="destinationMode"
                      value="manual"
                      checked={destinationMode === 'manual'}
                      onChange={(e) => handleDestinationModeChange(e.target.value as 'select' | 'manual')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enter manually</span>
                  </label>
                </div>

                {/* Destination Input */}
                {destinationMode === 'select' ? (
                  <select
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select destination</option>
                    {formOptions.facilities.map((facility) => (
                      <option key={facility.id} value={facility.name}>
                        {facility.name} - {facility.type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    required
                    placeholder="Enter destination facility name and location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                )}
                
                {destinationMode === 'select' && formOptions.facilities.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Loading facilities...</p>
                )}
                
                {/* Phase A: Geographic filtering toggle for multi-location users */}
                {user.manageMultipleLocations && destinationMode === 'select' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <label className="flex items-center text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showAllStates}
                        onChange={(e) => {
                          setShowAllStates(e.target.checked);
                          // Reload facilities when toggle changes
                          setTimeout(() => reloadFacilities(), 100);
                        }}
                        className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      Show facilities from all states
                    </label>
                    {!showAllStates && (
                      <span className="text-xs text-gray-500">
                        (Currently showing PA facilities within 100 miles)
                      </span>
                    )}
                    {showAllStates && (
                      <span className="text-xs text-gray-500">
                        (Currently showing all facilities within 100 miles)
                      </span>
                    )}
                  </div>
                )}
                
                {destinationMode === 'manual' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the full facility name and location (e.g., "Johns Hopkins Hospital, Baltimore, MD")
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Time *
              </label>
              <input
                type="datetime-local"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Level *
                </label>
                <select
                  name="transportLevel"
                  value={formData.transportLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  {formOptions.transportLevel.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  name="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  {formOptions.urgency.map((urgency) => (
                    <option key={urgency} value={urgency}>{urgency}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SMS Notification Radius - Separate section for clarity */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📱 SMS Notification Radius (miles) *
                </label>
                <input
                  type="number"
                  name="notificationRadius"
                  value={formData.notificationRadius}
                  onChange={handleChange}
                  min="10"
                  max="200"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-2 text-xs text-gray-600">
                  <strong>Purpose:</strong> EMS agencies within this radius will receive SMS notifications when this trip is created. 
                  <br />
                  <strong>Note:</strong> This is separate from the "Dispatch Radius" used later when selecting agencies for dispatch. 
                  Agencies can see trips in their area without receiving SMS if they have SMS notifications disabled in their settings.
                  <br />
                  <strong>Default:</strong> 100 miles
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <Stethoscope className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-sm font-medium text-purple-800">Clinical Details</h3>
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Provide clinical information for appropriate transport planning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Diagnosis
                </label>
                <select
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select diagnosis</option>
                  {formOptions.diagnosis.map((diagnosis) => (
                    <option key={diagnosis} value={diagnosis}>{diagnosis}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobility Level
                </label>
                <select
                  name="mobilityLevel"
                  value={formData.mobilityLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  {formOptions.mobility.map((mobility) => (
                    <option key={mobility} value={mobility}>{mobility}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Needs (Select all that apply)
              </label>
              <div className="space-y-2">
                {formOptions.specialNeeds.length > 0 ? (
                  formOptions.specialNeeds.map((need) => (
                    <div key={need} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`special-need-${need}`}
                        checked={formData.specialNeeds.split(',').map(n => n.trim()).includes(need)}
                        onChange={(e) => handleSpecialNeedsChange(need, e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label 
                        htmlFor={`special-need-${need}`}
                        className="ml-2 block text-sm text-gray-900 cursor-pointer"
                      >
                        {need}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No special needs options available. Please configure in Hospital Settings.
                  </p>
                )}
              </div>
              {formData.specialNeeds && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.specialNeeds}
                </p>
              )}
            </div>
          </div>
        );

      // case 4: (Commented out - Agency selection happens in dispatch screen)
        // This step is disabled - agencies are selected during dispatch, not trip creation
        return null;

      // case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-800">Review & Submit</h3>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                Review all information before submitting the transport request.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                  <p className="text-sm text-gray-600">ID: {formData.patientId}</p>
                  {formData.isNewborn ? (
                    <p className="text-sm text-gray-600">Age: Newborn</p>
                  ) : (formData.isInfant || formData.isToddler) ? (
                    <p className="text-sm text-gray-600">Age: {formData.isInfant ? 'Infant' : 'Toddler'}</p>
                  ) : (formData.ageYears && (
                    <p className="text-sm text-gray-600">Age: {parseInt(formData.ageYears, 10)} years</p>
                  ))}
                  {formData.patientWeight && <p className="text-sm text-gray-600">Weight: {formData.patientWeight} kgs</p>}
                  {formData.insuranceCompany && <p className="text-sm text-gray-600">Insurance: {formData.insuranceCompany}</p>}
                  {formData.specialNeeds && <p className="text-sm text-gray-600">Special Needs: {formData.specialNeeds}</p>}
                  {/* {formData.generateQRCode && <p className="text-sm text-blue-600">QR Code: Generated</p>} */}
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Trip Details</h4>
                  <p className="text-sm text-gray-600">From: {formData.fromLocation}</p>
                  {formData.pickupLocationId && formOptions.pickupLocations && (() => {
                    const selectedLocation = formOptions.pickupLocations.find(loc => loc.id === formData.pickupLocationId);
                    return selectedLocation ? (
                      <p className="text-sm text-gray-600">Pickup: {selectedLocation.name} {selectedLocation.floor && `(${selectedLocation.floor})`}</p>
                    ) : null;
                  })()}
                  <p className="text-sm text-gray-600">To: {formData.toLocation}</p>
                  <p className="text-sm text-gray-600">Level: {formData.transportLevel}</p>
                  <p className="text-sm text-gray-600">Urgency: {formData.urgencyLevel}</p>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Clinical Details</h4>
                  {formData.diagnosis && <p className="text-sm text-gray-600">Diagnosis: {formData.diagnosis}</p>}
                  <p className="text-sm text-gray-600">Mobility: {formData.mobilityLevel}</p>
                  {formData.specialNeeds && <p className="text-sm text-red-600">Special Needs: {formData.specialNeeds}</p>}
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Agency Selection</h4>
                  <p className="text-sm text-gray-600">Selected: {formData.selectedAgencies.length} agencies</p>
                  <p className="text-sm text-gray-600">Radius: {formData.notificationRadius} miles</p>
                  {/* Unit assignment summary removed */}
                </div>
              </div>

              {formData.notes && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-sm text-gray-600">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* TCC Command: Facility Context Selector */}
      {(user.userType === 'ADMIN' || user.userType === 'USER') && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-5 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                TCC Command Center - Create Trip
              </h3>
              <p className="text-sm text-gray-600">
                Select the healthcare facility you're creating this trip for
              </p>
            </div>
          </div>
          
          {loadingTCCFacilities ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Loading facilities...</span>
            </div>
          ) : (
            <div>
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Search Facilities
                  </label>
                  <input
                    type="text"
                    value={tccFacilitySearch}
                    onChange={(e) => setTccFacilitySearch(e.target.value)}
                    placeholder="Search by name or city..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Filter by State
                  </label>
                  <select
                    value={tccStateFilter}
                    onChange={(e) => setTccStateFilter(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All States</option>
                    {Array.from(new Set(tccHealthcareFacilities.map(f => f.state))).sort().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Facility Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Healthcare Facility *
                </label>
                <select
                  value={selectedTCCFacilityId}
                  onChange={(e) => handleTCCFacilitySelection(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  required
                >
                  <option value="">-- Select Healthcare Facility --</option>
                  {tccHealthcareFacilities
                    .filter(facility => {
                      // Filter by search term
                      const searchLower = tccFacilitySearch.toLowerCase();
                      const matchesSearch = !tccFacilitySearch || 
                        facility.locationName.toLowerCase().includes(searchLower) ||
                        facility.city.toLowerCase().includes(searchLower) ||
                        facility.zipCode.includes(tccFacilitySearch);
                      
                      // Filter by state
                      const matchesState = !tccStateFilter || facility.state === tccStateFilter;
                      
                      return matchesSearch && matchesState;
                    })
                    .map(facility => (
                      <option key={facility.id} value={facility.id}>
                        {facility.locationName} - {facility.city}, {facility.state} {facility.zipCode}
                      </option>
                    ))}
                </select>
                
                <p className="mt-1 text-xs text-gray-500">
                  Showing {tccHealthcareFacilities.filter(f => {
                    const searchLower = tccFacilitySearch.toLowerCase();
                    const matchesSearch = !tccFacilitySearch || 
                      f.locationName.toLowerCase().includes(searchLower) ||
                      f.city.toLowerCase().includes(searchLower) ||
                      f.zipCode.includes(tccFacilitySearch);
                    const matchesState = !tccStateFilter || f.state === tccStateFilter;
                    return matchesSearch && matchesState;
                  }).length} of {tccHealthcareFacilities.length} facilities
                </p>
              </div>
              
              {selectedTCCFacilityId && (
                <div className="mt-3 flex items-start bg-green-50 border border-green-200 rounded-md p-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Facility Selected
                    </p>
                    <p className="text-sm text-green-700">
                      Creating trip on behalf of{' '}
                      <span className="font-semibold">
                        {tccHealthcareFacilities.find(f => f.id === selectedTCCFacilityId)?.locationName}
                      </span>
                    </p>
                  </div>
                </div>
              )}
              
              {!selectedTCCFacilityId && tccHealthcareFacilities.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  As TCC command staff, you have visibility into all {tccHealthcareFacilities.length} facilities in the system.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : isCompleted 
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Enhanced Transport Request</h3>
          <p className="text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Transport request completed successfully!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Patient: {formData.patientId} | From: {formData.fromLocation} | To: {formData.toLocation}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Redirecting to dashboard in 3 seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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

          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
              </div>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Request'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTripForm;
