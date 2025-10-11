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
import { tripsAPI } from '../services/api';
import { dropdownOptionsAPI } from '../services/api';

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
  onTripCreated: () => void;
  onCancel?: () => void;
}

interface FormData {
  // Patient Information
  patientId: string;
  patientWeight: string;
  specialNeeds: string;
  insuranceCompany: string;
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
  oxygenRequired: boolean;
  monitoringRequired: boolean;
  
  // Agency Selection
  selectedAgencies: string[];
  notificationRadius: number;
  
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
  specialNeeds: string[];
  facilities: any[];
  agencies: any[];
  pickupLocations: PickupLocation[];
  healthcareLocations: HealthcareLocation[]; // ✅ NEW: Healthcare locations for multi-location users
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
    specialNeeds: [],
    facilities: [],
    agencies: [],
    pickupLocations: [],
    healthcareLocations: [] // ✅ NEW: Healthcare locations for multi-location users
  });

  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    patientWeight: '',
    specialNeeds: '',
    insuranceCompany: '',
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
    oxygenRequired: false,
    monitoringRequired: false,
    selectedAgencies: [],
    notificationRadius: 100,
    notes: ''
  });

  const [destinationMode, setDestinationMode] = useState<'select' | 'manual'>('select');
  const [loadingPickupLocations, setLoadingPickupLocations] = useState(false);
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
      const healthcareLocationsResponse = await api.get('/api/healthcare/locations/active');
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
    
    loadFormOptions();
    // Note: loadHealthcareLocations is now handled within loadFormOptions
    
    // TCC Command: Load all healthcare facilities for admin/user
    if (user.userType === 'ADMIN' || user.userType === 'USER') {
      loadTCCHealthcareFacilities();
    }
  }, []);
  
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
    // For regular users, use facility ID
    else if (!user.manageMultipleLocations && formData.fromLocation && formOptions.facilities.length > 0) {
      const selectedFacility = formOptions.facilities.find(f => f.name === formData.fromLocation);
      if (selectedFacility) {
        loadPickupLocationsForHospital(selectedFacility.id);
      }
    }
  }, [formData.fromLocation, formData.fromLocationId, formOptions.facilities, user.manageMultipleLocations]);

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
    try {
      console.log('TCC_DEBUG: Loading real form options from API...');
      
      // Phase A: Smart defaults for geographic filtering
      let facilities = [];
      let healthcareLocations: HealthcareLocation[] = [];
      
      if (user.manageMultipleLocations) {
        // For Penn Highlands users, load healthcare locations AND facilities with geographic filtering
        console.log('PHASE_A: Loading healthcare locations and facilities for Penn Highlands user');
        
        // Get the user's healthcare locations for the "From Location" dropdown
        const healthcareLocationsResponse = await api.get('/api/healthcare/locations/active');
        if (healthcareLocationsResponse.data?.success && Array.isArray(healthcareLocationsResponse.data.data)) {
          healthcareLocations = healthcareLocationsResponse.data.data;
          console.log('MULTI_LOC: Loaded', healthcareLocations.length, 'healthcare locations for form options:', healthcareLocations);
          
          const primaryLocation = healthcareLocations.find(loc => loc.isPrimary) || healthcareLocations[0];
          
          if (primaryLocation && primaryLocation.latitude && primaryLocation.longitude) {
            console.log('PHASE_A: Using primary location as origin:', primaryLocation.locationName);
            
            // Load facilities within 100 miles of the primary location, limited to PA
            const facilitiesResponse = await api.get('/api/tcc/facilities', {
              params: {
                state: 'PA', // Filter to Pennsylvania only
                originLat: primaryLocation.latitude,
                originLng: primaryLocation.longitude,
                radius: 100, // 100 miles radius
                isActive: true
              }
            });
            
            if (facilitiesResponse.data?.success && Array.isArray(facilitiesResponse.data.data)) {
              facilities = facilitiesResponse.data.data;
              console.log('PHASE_A: Loaded', facilities.length, 'PA facilities within 100 miles of', primaryLocation.locationName);
            }
          } else {
            console.warn('PHASE_A: Primary location missing coordinates, falling back to PA facilities only');
            // Fallback to PA facilities only without geographic filtering
            const facilitiesResponse = await api.get('/api/tcc/facilities', {
              params: { state: 'PA', isActive: true }
            });
            if (facilitiesResponse.data?.success && Array.isArray(facilitiesResponse.data.data)) {
              facilities = facilitiesResponse.data.data;
            }
          }
        }
      } else {
        // For single-location users, load all facilities (existing behavior)
        console.log('PHASE_A: Loading all facilities for single-location user');
        const facilitiesResponse = await api.get('/api/tcc/facilities');
        
        if (facilitiesResponse.data?.success && Array.isArray(facilitiesResponse.data.data)) {
          facilities = facilitiesResponse.data.data;
          console.log('TCC_DEBUG: Loaded', facilities.length, 'real facilities');
        }
        // Ensure healthcareLocations is empty for single-location users
        healthcareLocations = [];
      }
      
      if (facilities.length === 0) {
        console.warn('TCC_DEBUG: Failed to load facilities, using fallback');
        facilities = [];
      }
      
      // Load dropdown options from backend Hospital Settings
      const [diagRes, mobRes, tlRes, urgRes, insRes, snRes] = await Promise.all([
        dropdownOptionsAPI.getByCategory('diagnosis').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('mobility').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('transport-level').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('urgency').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('insurance').catch(() => ({ data: { success: false, data: [] }})),
        dropdownOptionsAPI.getByCategory('special-needs').catch(() => ({ data: { success: false, data: [] }})),
      ]);

      const toValues = (resp: any, fallback: string[]) => (resp?.data?.success && Array.isArray(resp.data.data) ? resp.data.data.map((o: any) => o.value) : fallback);

      // Ensure urgency always has baseline defaults merged with hospital settings
      const urgencyDefaults = ['Routine', 'Urgent', 'Emergent'];
      const urgencyFromAPI = toValues(urgRes, []);
      const urgencyOptions = [...urgencyDefaults, ...urgencyFromAPI.filter(val => !urgencyDefaults.includes(val))];

      const options: FormOptions = {
        diagnosis: toValues(diagRes, ['Cardiac', 'Respiratory', 'Neurological', 'Trauma']),
        mobility: toValues(mobRes, ['Ambulatory', 'Wheelchair', 'Stretcher', 'Bed-bound']),
        transportLevel: toValues(tlRes, ['BLS', 'ALS', 'CCT', 'Other']),
        urgency: urgencyOptions,
        insurance: toValues(insRes, ['Medicare', 'Medicaid', 'Private', 'Self-pay']),
        specialNeeds: toValues(snRes, ['Bariatric Stretcher']),
        facilities: facilities,
        agencies: [],
        pickupLocations: [],
        healthcareLocations: healthcareLocations // ✅ Use the loaded healthcare locations
      };
 
      console.log('TCC_DEBUG: Setting real form options:', options);
      console.log('MULTI_LOC: Healthcare locations being set in formOptions:', healthcareLocations.length, 'locations');
      setFormOptions(options);
      
      // Set default fromLocation and fromLocationId for multi-location users
      if (user.manageMultipleLocations && healthcareLocations.length > 0) {
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
        setFormData(prev => ({
          ...prev,
          transportLevel: tl.data?.data?.option?.value || prev.transportLevel,
          urgencyLevel: urg.data?.data?.option?.value || prev.urgencyLevel,
          diagnosis: dx.data?.data?.option?.value ? dx.data.data.option.value : '',
          mobilityLevel: mob.data?.data?.option?.value || prev.mobilityLevel,
          insuranceCompany: ins.data?.data?.option?.value || prev.insuranceCompany,
          specialNeeds: sn.data?.data?.option?.value || prev.specialNeeds
        }));
      } catch (e) {
        console.warn('TCC_DEBUG: Defaults not available yet');
      }
    } catch (error) {
      console.error('Error loading form options:', error);
      // Fallback to basic options if API fails
      const fallbackOptions: FormOptions = {
        diagnosis: ['Cardiac', 'Respiratory', 'Neurological', 'Trauma'],
        mobility: ['Ambulatory', 'Wheelchair', 'Stretcher', 'Bed-bound'],
        transportLevel: ['BLS', 'ALS', 'CCT', 'Other'],
        urgency: ['Routine', 'Urgent', 'Emergent', 'Critical'],
        insurance: ['Medicare', 'Medicaid', 'Private', 'Self-pay'],
        specialNeeds: ['Bariatric Stretcher'],
        facilities: [],
        agencies: [],
        pickupLocations: [],
        healthcareLocations: [] // ✅ Initialize empty array for healthcare locations
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
    if (name === 'fromLocation' && user.manageMultipleLocations) {
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
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
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
        : [...prev.selectedAgencies, agencyId]
    }));
  };

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

      // Validate patient weight is a number
      const weight = parseFloat(formData.patientWeight);
      if (isNaN(weight) || weight <= 0) {
        throw new Error('Please enter a valid patient weight');
      }

      // Validate step 2 required fields (Trip Details)
      if (!formData.fromLocation || !formData.pickupLocationId || !formData.toLocation || !formData.scheduledTime || !formData.transportLevel || !formData.urgencyLevel) {
        throw new Error('Please fill in all trip details: From Location, Pickup Location, To Location, Scheduled Time, Transport Level, and Urgency Level');
      }

      // Validate scheduled time is not in the past
      if (new Date(formData.scheduledTime) < new Date()) {
        throw new Error('Scheduled time cannot be in the past');
      }

      // Validate transport level
      if (!['BLS', 'ALS', 'CCT', 'Other'].includes(formData.transportLevel)) {
        throw new Error('Invalid transport level');
      }

      // Validate urgency level
      if (!['Routine', 'Urgent', 'Emergent', 'Critical'].includes(formData.urgencyLevel)) {
        throw new Error('Invalid urgency level');
      }

      // Create the trip in the database
      console.log('TCC_DEBUG: Creating trip with data:', formData);
      
      // Find the selected facility for fromLocation
      const selectedFacility = formOptions.facilities.find(f => f.name === formData.fromLocation);
      if (!selectedFacility) {
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
        priority: formData.urgencyLevel === 'Critical' ? 'HIGH' : 
                 formData.urgencyLevel === 'Emergent' ? 'HIGH' :
                 formData.urgencyLevel === 'Urgent' ? 'MEDIUM' : 'LOW',
        specialRequirements: formData.specialNeeds || '',
        readyStart: formData.scheduledTime,
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
        createdVia: (user.userType === 'ADMIN' || user.userType === 'USER') ? 'TCC_ADMIN_PORTAL' : 'HEALTHCARE_PORTAL'
      };

      console.log('TCC_DEBUG: Submitting trip data:', tripData);

      // Submit trip to API
      const response = await tripsAPI.create(tripData);
      
      if (response.data.success) {
        console.log('TCC_DEBUG: Trip created successfully:', response.data.data);
        setSuccess(true);
        setTimeout(() => {
          onTripCreated();
        }, 3000); // Show success message for 3 seconds
      } else {
        throw new Error(response.data.error || 'Failed to create transport request');
      }

    } catch (error: any) {
      console.error('TCC_DEBUG: Error creating trip:', error);
      setError(error.message || 'Failed to create transport request');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-blue-800">Patient Information</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Enter patient details. No names or ages for HIPAA compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kgs)
                </label>
                <input
                  type="number"
                  name="patientWeight"
                  value={formData.patientWeight}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter weight in kilograms"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Special Needs
                </label>
                <select
                  name="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select special needs</option>
                  {formOptions.specialNeeds.map((sn) => (
                    <option key={sn} value={sn}>{sn}</option>
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
                <select
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select origin facility</option>
                  {/* Show healthcare locations for multi-location users */}
                  {user.manageMultipleLocations ? (
                    <>
                      {console.log('MULTI_LOC: Rendering healthcare locations dropdown with', formOptions.healthcareLocations.length, 'locations:', formOptions.healthcareLocations)}
                      {formOptions.healthcareLocations.map((location) => (
                        <option key={location.id} value={location.locationName}>
                          {location.locationName} - {location.city}, {location.state}
                        </option>
                      ))}
                    </>
                  ) : (
                    /* Show regular facilities for single-location users */
                    <>
                      {console.log('MULTI_LOC: Rendering facilities dropdown with', formOptions.facilities.length, 'facilities:', formOptions.facilities)}
                      {formOptions.facilities.map((facility) => (
                        <option key={facility.id} value={facility.name}>
                          {facility.name} - {facility.type}
                        </option>
                      ))}
                    </>
                  )}
                </select>
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

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="oxygenRequired"
                  checked={formData.oxygenRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Oxygen Required
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="monitoringRequired"
                  checked={formData.monitoringRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Continuous Monitoring Required
                </label>
              </div>
            </div>
          </div>
        );

      // case 4:
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="text-sm font-medium text-orange-800">EMS Agency Selection</h3>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Select agencies to notify within {formData.notificationRadius} miles.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Radius (miles)
              </label>
              <input
                type="number"
                name="notificationRadius"
                value={formData.notificationRadius}
                onChange={handleChange}
                min="10"
                max="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Agencies
              </label>
              
              {!formData.fromLocation ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>No Origin Hospital Selected:</strong> Please select an origin hospital in step 2 to load available agencies.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {formOptions.agencies.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">
                            <strong>Loading agencies...</strong> Please wait while we find available EMS agencies in your area.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    formOptions.agencies.map((agency) => (
                      <div
                        key={agency.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.selectedAgencies.includes(agency.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                        onClick={() => handleAgencyToggle(agency.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{agency.name}</h4>
                            <p className="text-sm text-gray-500">{agency.serviceType}</p>
                            <p className="text-xs text-gray-400">
                              {agency.availableUnits || 0}/{agency.totalUnits || 0} units available
                            </p>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.selectedAgencies.includes(agency.id)}
                              onChange={() => {}}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        );

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
                  {formData.oxygenRequired && <p className="text-sm text-red-600">Oxygen Required</p>}
                  {formData.monitoringRequired && <p className="text-sm text-red-600">Monitoring Required</p>}
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Agency Selection</h4>
                  <p className="text-sm text-gray-600">Selected: {formData.selectedAgencies.length} agencies</p>
                  <p className="text-sm text-gray-600">Radius: {formData.notificationRadius} miles</p>
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
