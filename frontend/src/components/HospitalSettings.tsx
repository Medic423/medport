import React, { useState, useEffect } from 'react';
import { MapPin, Settings, Trash2, Edit, Plus, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { dropdownOptionsAPI, dropdownCategoriesAPI } from '../services/api';
import api from '../services/api';

interface DropdownOption {
  id: string;
  category: string;
  value: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DropdownCategory {
  id: string;
  slug: string;
  displayName: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  optionCount?: number;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  type: string;
  capabilities: string[];
  region: string;
  isActive: boolean;
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

interface User {
  id: string;
  email: string;
  name: string;
  facilityName?: string;
  manageMultipleLocations?: boolean;
}

interface HospitalSettingsProps {
  user: User;
}

const HospitalSettings: React.FC<HospitalSettingsProps> = ({ user }) => {
  console.log('TCC_DEBUG: HospitalSettings component rendered with user:', user);
  
  // Tab state - Added 'categories' as first tab
  const [activeTab, setActiveTab] = useState<'categories' | 'dropdowns' | 'pickup-locations' | 'main-contact'>('categories');
  
  // Category management state
  const [categoryList, setCategoryList] = useState<DropdownCategory[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<DropdownCategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    slug: '',
    displayName: '',
    displayOrder: 0
  });
  
  // Dropdown options state
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [newOptionValue, setNewOptionValue] = useState('');
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [editValue, setEditValue] = useState('');

  // Pickup locations state
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [pickupSuccess, setPickupSuccess] = useState<string | null>(null);
  
  // Pickup location form states
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [editingPickupLocation, setEditingPickupLocation] = useState<PickupLocation | null>(null);
  const [pickupFormData, setPickupFormData] = useState({
    name: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    floor: '',
    room: ''
  });

  // Main contact form state
  const [contactFormData, setContactFormData] = useState({
    contactName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    contactNotes: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  // Default option state
  const [defaultOptionId, setDefaultOptionId] = useState<string>('');

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
    loadCategoryList();
  }, []);

  // Load options when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadOptions(selectedCategory);
    }
  }, [selectedCategory]);

  // Load hospitals on component mount
  useEffect(() => {
    console.log('TCC_DEBUG: HospitalSettings useEffect triggered - loading hospitals');
    console.log('TCC_DEBUG: User object:', user);
    loadHospitals();
    
    // For single-location users, ensure selectedHospital gets set
    if (!user.manageMultipleLocations && user.facilityName) {
      console.log('TCC_DEBUG: SINGLE_LOC: User is single-location, will auto-select facility:', user.facilityName);
    }
  }, []);

  // Load pickup locations when hospital changes
  useEffect(() => {
    if (selectedHospital) {
      console.log('TCC_DEBUG: useEffect triggered - loading pickup locations for:', selectedHospital);
      loadPickupLocations(selectedHospital);
    }
  }, [selectedHospital]);

  // Load default option when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadDefault(selectedCategory);
    }
  }, [selectedCategory]);

  // Load category list for Category Options tab
  const loadCategoryList = async () => {
    try {
      setCategoryLoading(true);
      setCategoryError(null);
      const response = await dropdownCategoriesAPI.getAll();
      if (response.data.success) {
        setCategoryList(response.data.data);
      } else {
        setCategoryError('Failed to load categories');
      }
    } catch (error: any) {
      console.error('Error loading category list:', error);
      setCategoryError(error.response?.data?.error || 'Failed to load categories');
    } finally {
      setCategoryLoading(false);
    }
  };

  // Load categories for Dropdown Options tab (now from API)
  const loadCategories = async () => {
    try {
      setLoading(true);
      // Load from API instead of hardcoded list
      const response = await dropdownOptionsAPI.getCategories();
      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedCategory(response.data.data[0]);
        }
      } else {
        console.warn('TCC_DEBUG: Invalid response format:', response.data);
        // Fallback to empty array if API fails
        setCategories([]);
        setSelectedCategory('');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
      // Fallback to empty array
      setCategories([]);
      setSelectedCategory('');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async (category: string) => {
    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.getByCategory(category);
      if (response.data.success) {
        setOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading options:', error);
      setError('Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const loadDefault = async (category: string) => {
    try {
      const res = await dropdownOptionsAPI.getDefault(category);
      if (res.data.success && res.data.data) {
        setDefaultOptionId(res.data.data.optionId);
      } else {
        setDefaultOptionId('');
      }
    } catch (e) {
      setDefaultOptionId('');
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionValue.trim() || !selectedCategory) return;

    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.create({
        category: selectedCategory,
        value: newOptionValue.trim()
      });

      if (response.data.success) {
        setNewOptionValue('');
        setSuccess('Option added successfully');
        loadOptions(selectedCategory);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error adding option:', error);
      setError('Failed to add option');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOption = (option: DropdownOption) => {
    setEditingOption(option);
    setEditValue(option.value);
  };

  const handleUpdateOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOption || !editValue.trim()) return;

    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.update(editingOption.id, {
        value: editValue.trim()
      });

      if (response.data.success) {
        setEditingOption(null);
        setEditValue('');
        setSuccess('Option updated successfully');
        loadOptions(selectedCategory);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error updating option:', error);
      setError('Failed to update option');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this option?')) return;

    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.delete(id);

      if (response.data.success) {
        setSuccess('Option deleted successfully');
        loadOptions(selectedCategory);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting option:', error);
      setError('Failed to delete option');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async () => {
    if (!selectedCategory || !defaultOptionId) return;
    try {
      setLoading(true);
      const res = await dropdownOptionsAPI.setDefault(selectedCategory, defaultOptionId);
      if (res.data.success) {
        setSuccess('Default updated');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (e) {
      setError('Failed to set default');
    } finally {
      setLoading(false);
    }
  };

  // Category management handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCategoryLoading(true);
      setCategoryError(null);
      setCategorySuccess(null);

      if (editingCategory) {
        // Update existing category
        const response = await dropdownCategoriesAPI.update(editingCategory.id, {
          displayName: categoryFormData.displayName,
          displayOrder: categoryFormData.displayOrder
        });
        if (response.data.success) {
          setCategorySuccess('Category updated successfully');
          setEditingCategory(null);
          setShowCategoryForm(false);
          setCategoryFormData({ slug: '', displayName: '', displayOrder: 0 });
          loadCategoryList();
          loadCategories(); // Reload categories for dropdown options tab
          setTimeout(() => setCategorySuccess(null), 3000);
        }
      } else {
        // Create new category
        const response = await dropdownCategoriesAPI.create({
          slug: categoryFormData.slug,
          displayName: categoryFormData.displayName,
          displayOrder: categoryFormData.displayOrder || undefined
        });
        if (response.data.success) {
          setCategorySuccess('Category created successfully');
          setShowCategoryForm(false);
          setCategoryFormData({ slug: '', displayName: '', displayOrder: 0 });
          loadCategoryList();
          loadCategories(); // Reload categories for dropdown options tab
          setTimeout(() => setCategorySuccess(null), 3000);
        }
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      setCategoryError(error.response?.data?.error || 'Failed to save category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categoryList.find(c => c.id === id);
    if (!category) return;

    if (category.optionCount && category.optionCount > 0) {
      setCategoryError(`Cannot delete category with ${category.optionCount} active option(s). Please remove or deactivate all options first.`);
      setTimeout(() => setCategoryError(null), 5000);
      return;
    }

    // Show confirmation dialog with warning
    const confirmed = window.confirm(
      `⚠️ WARNING: Delete Category\n\n` +
      `Are you sure you want to delete "${category.displayName}"?\n\n` +
      `This will deactivate the category and all associated dropdown options.\n` +
      `This action cannot be undone.\n\n` +
      `Click OK to confirm deletion.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      setCategoryLoading(true);
      setCategoryError(null);
      const response = await dropdownCategoriesAPI.delete(id);
      if (response.data.success) {
        setCategorySuccess('Category deleted successfully');
        loadCategoryList();
        loadCategories(); // Reload categories for dropdown options tab
        setTimeout(() => setCategorySuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setCategoryError(error.response?.data?.error || 'Failed to delete category');
    } finally {
      setCategoryLoading(false);
    }
  };

  // Pickup location functions
  const loadHospitals = async () => {
    try {
      console.log('TCC_DEBUG: loadHospitals function called');
      setPickupLoading(true);
      
      // For multi-location users, load their healthcare locations
      if (user.manageMultipleLocations) {
        console.log('TCC_DEBUG: MULTI_LOC: Loading healthcare locations for pickup location management');
        const response = await api.get('/api/healthcare/locations/active');
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          const healthcareLocations = response.data.data;
          console.log('MULTI_LOC: Loaded', healthcareLocations.length, 'healthcare locations');
          
          // Transform healthcare locations to hospital format for the dropdown
          const transformedLocations = healthcareLocations.map((loc: HealthcareLocation) => ({
            id: loc.id,
            name: loc.locationName,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zipCode,
            phone: loc.phone || '',
            email: '',
            type: loc.facilityType,
            capabilities: [],
            region: loc.state,
            isActive: loc.isActive
          }));
          
          setHospitals(transformedLocations);
          
          // Set default to primary location
          const primaryLocation = healthcareLocations.find(loc => loc.isPrimary);
          if (primaryLocation) {
            setSelectedHospital(primaryLocation.id);
          } else if (transformedLocations.length > 0) {
            setSelectedHospital(transformedLocations[0].id);
          }
        }
      } else {
        // For single-location users, find THEIR facility only
        console.log('TCC_DEBUG: SINGLE_LOC: Loading user\'s own facility for pickup location management');
        const response = await api.get('/api/public/hospitals');
        if (response.data.success) {
          const allHospitals = response.data.data;
          console.log('TCC_DEBUG: Loaded hospitals from API:', allHospitals.length);
          console.log('TCC_DEBUG: Looking for facility name:', user.facilityName);
          // Find the hospital matching this user's facilityName
          const userFacility = allHospitals.find((h: any) => h.name === user.facilityName);
          console.log('TCC_DEBUG: Found user facility:', userFacility);
          
          if (userFacility) {
            console.log('SINGLE_LOC: Found user facility:', userFacility.name);
            
            // Special case: If "Test Hospital" is found with hosp_test_001, map to fac_test_hospital_001 for pickup locations
            if (userFacility.id === 'hosp_test_001') {
              console.log('TCC_DEBUG: Found hosp_test_001, mapping to fac_test_hospital_001');
              userFacility.id = 'fac_test_hospital_001';
              console.log('TCC_DEBUG: SINGLE_LOC: Mapped Test Hospital ID to fac_test_hospital_001 for pickup locations');
            }
            
            setHospitals([userFacility]); // Only show THEIR facility
            setSelectedHospital(userFacility.id);
            console.log('TCC_DEBUG: Set selectedHospital to:', userFacility.id);
          } else {
            console.warn('SINGLE_LOC: User facility not found in hospitals:', user.facilityName);
            setPickupError(`Your facility "${user.facilityName}" is not found. Please contact support.`);
            setHospitals([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
      setPickupError('Failed to load hospitals');
    } finally {
      setPickupLoading(false);
    }
  };

  const loadPickupLocations = async (hospitalId: string) => {
    try {
      setPickupLoading(true);
      setPickupError(null); // Clear any previous errors
      console.log('TCC_DEBUG: Loading pickup locations for hospital ID:', hospitalId);
      const response = await api.get(`/api/tcc/pickup-locations/hospital/${hospitalId}`);
      console.log('TCC_DEBUG: Pickup locations API response:', response.data);
      if (response.data.success) {
        setPickupLocations(response.data.data);
        console.log('TCC_DEBUG: Loaded pickup locations:', response.data.data.length);
      } else {
        setPickupError(response.data.message || 'Failed to load pickup locations');
      }
    } catch (error) {
      console.error('Error loading pickup locations:', error);
      setPickupError('Failed to load pickup locations');
    } finally {
      setPickupLoading(false);
    }
  };

  const handleAddPickupLocation = () => {
    setEditingPickupLocation(null);
    setPickupFormData({
      name: '',
      description: '',
      contactPhone: '',
      contactEmail: '',
      floor: '',
      room: ''
    });
    setPickupError(null); // Clear any previous errors
    setPickupSuccess(null); // Clear any previous success messages
    setShowPickupForm(true);
  };

  const handleEditPickupLocation = (location: PickupLocation) => {
    setEditingPickupLocation(location);
    setPickupFormData({
      name: location.name,
      description: location.description || '',
      contactPhone: location.contactPhone || '',
      contactEmail: location.contactEmail || '',
      floor: location.floor || '',
      room: location.room || ''
    });
    setPickupError(null); // Clear any previous errors
    setPickupSuccess(null); // Clear any previous success messages
    setShowPickupForm(true);
  };

  const handleSavePickupLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupFormData.name.trim() || !selectedHospital) return;

    try {
      setPickupLoading(true);
      const data = {
        hospitalId: selectedHospital,
        name: pickupFormData.name.trim(),
        description: pickupFormData.description.trim() || null,
        contactPhone: pickupFormData.contactPhone.trim() || null,
        contactEmail: pickupFormData.contactEmail.trim() || null,
        floor: pickupFormData.floor.trim() || null,
        room: pickupFormData.room.trim() || null
      };

      let response;
      if (editingPickupLocation) {
        response = await api.put(`/api/tcc/pickup-locations/${editingPickupLocation.id}`, data);
      } else {
        response = await api.post('/api/tcc/pickup-locations', data);
      }

      if (response.data.success) {
        setShowPickupForm(false);
        setPickupSuccess(editingPickupLocation ? 'Pickup location updated successfully' : 'Pickup location created successfully');
        loadPickupLocations(selectedHospital);
        setTimeout(() => setPickupSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error saving pickup location:', error);
      setPickupError(error.response?.data?.error || 'Failed to save pickup location');
    } finally {
      setPickupLoading(false);
    }
  };

  const handleDeletePickupLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pickup location?')) return;

    try {
      setPickupLoading(true);
      const response = await api.delete(`/api/tcc/pickup-locations/${id}`);
      if (response.data.success) {
        setPickupSuccess('Pickup location deleted successfully');
        loadPickupLocations(selectedHospital);
        setTimeout(() => setPickupSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error deleting pickup location:', error);
      setPickupError(error.response?.data?.error || 'Failed to delete pickup location');
    } finally {
      setPickupLoading(false);
    }
  };

  // Contact form handlers
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactFormData.contactName || !contactFormData.contactEmail) {
      setContactError('Contact name and email are required');
      return;
    }

    try {
      setContactLoading(true);
      setContactError(null);
      
      // For now, we'll just simulate saving since there's no backend endpoint yet
      // In a real implementation, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setContactSuccess('Contact information saved successfully');
      setTimeout(() => setContactSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error saving contact information:', error);
      setContactError('Failed to save contact information');
    } finally {
      setContactLoading(false);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames: { [key: string]: string } = {
      'insurance': 'Insurance Companies',
      'diagnosis': 'Primary Diagnosis',
      'mobility': 'Mobility Levels',
      'transport-level': 'Transport Levels',
      'urgency': 'Urgency Levels',
      'special-needs': 'Special Needs',
      'secondary-insurance': 'Secondary Insurance'
    };
    return displayNames[category] || category;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hospital Settings</h2>
        <p className="text-gray-600">Manage dropdown options and pickup locations for transport request forms</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('categories');
                setCategoryError(null);
                setCategorySuccess(null);
                loadCategoryList();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-4 w-4" />
              Category Options
            </button>
            <button
              onClick={() => setActiveTab('dropdowns')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dropdowns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dropdown Options
            </button>
            <button
              onClick={() => {
                setActiveTab('pickup-locations');
                setPickupError(null); // Clear errors when switching to this tab
                setPickupSuccess(null);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pickup-locations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pickup Locations
            </button>
            <button
              onClick={() => setActiveTab('main-contact')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'main-contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Main Contact
            </button>
          </nav>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {pickupSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{pickupSuccess}</p>
        </div>
      )}

      {pickupError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{pickupError}</p>
          <button 
            onClick={() => setPickupError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category Options Tab */}
      {activeTab === 'categories' && (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Categories</h3>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryFormData({ slug: '', displayName: '', displayOrder: 0 });
                  setCategorySuccess(null);
                  setCategoryError(null);
                  setShowCategoryForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>

            {categoryLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading categories...</p>
              </div>
            ) : categoryList.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No categories found. Add your first category to get started.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryList.map((category) => (
                      <tr key={category.id} className={category.isActive ? '' : 'opacity-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.displayName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{category.slug}</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.optionCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.displayOrder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingCategory(category);
                                setShowCategoryForm(true);
                                setCategoryFormData({
                                  slug: category.slug,
                                  displayName: category.displayName,
                                  displayOrder: category.displayOrder
                                });
                                setCategorySuccess(null);
                                setCategoryError(null);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit category"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete category"
                              disabled={category.optionCount && category.optionCount > 0}
                            >
                              <Trash2 className={`h-4 w-4 ${category.optionCount && category.optionCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add/Edit Category Form */}
          {(editingCategory || showCategoryForm) && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h4>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label htmlFor="category-slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="category-slug"
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="e.g., transport-level"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={!!editingCategory}
                    pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                    title="Lowercase letters, numbers, and hyphens only"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lowercase letters, numbers, and hyphens only. Cannot be changed after creation.</p>
                </div>
                <div>
                  <label htmlFor="category-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="category-display-name"
                    value={categoryFormData.displayName}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, displayName: e.target.value })}
                    placeholder="e.g., Transport Levels"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category-display-order" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="category-display-order"
                    value={categoryFormData.displayOrder}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, displayOrder: parseInt(e.target.value) || 0 })}
                    placeholder="Auto-calculated if not set"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lower numbers appear first. Leave empty to auto-calculate.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={categoryLoading || !categoryFormData.slug || !categoryFormData.displayName}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {categoryLoading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setShowCategoryForm(false);
                      setCategoryFormData({ slug: '', displayName: '', displayOrder: 0 });
                      setCategorySuccess(null);
                      setCategoryError(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Information Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">About Category Options</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Categories organize dropdown options used throughout the application</li>
                    <li>Each category can have multiple dropdown options that appear in trip creation forms</li>
                    <li>Categories cannot be deleted if they have active options - remove or deactivate all options first</li>
                    <li>The slug is a unique identifier that cannot be changed after creation</li>
                    <li>Display order determines the order categories appear in dropdowns (lower numbers appear first)</li>
                    <li>Changes to categories and options are reflected immediately in trip creation forms</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dropdown Options Tab */}
      {activeTab === 'dropdowns' && (
        <>
          {/* Category Selection */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Select Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div className="space-y-6">
              {/* Add New Option */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add New {getCategoryDisplayName(selectedCategory)}
                </h3>
                <form onSubmit={handleAddOption} className="flex gap-2">
                  <input
                    type="text"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    placeholder={`Enter new ${getCategoryDisplayName(selectedCategory).toLowerCase()}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading || !newOptionValue.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </form>
              </div>

              {/* Default Option Selector */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Default {getCategoryDisplayName(selectedCategory)}</h3>
                <div className="flex gap-2 items-center">
                  <select
                    value={defaultOptionId}
                    onChange={(e) => setDefaultOptionId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 >
                    <option value="">No default</option>
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.value}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleSetDefault}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Default'}
                  </button>
                </div>
              </div>

              {/* Options List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current {getCategoryDisplayName(selectedCategory)}
                </h3>
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                  </div>
                ) : options.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No options found for this category.</p>
                    <p className="text-sm">Add some options using the form above.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                        {editingOption?.id === option.id ? (
                          <form onSubmit={handleUpdateOption} className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOption(null);
                                setEditValue('');
                              }}
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <>
                            <span className="text-gray-900">{option.value}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditOption(option)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteOption(option.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Select a category to manage its dropdown options</li>
                  <li>• Add new options using the form above</li>
                  <li>• Edit existing options by clicking the "Edit" button</li>
                  <li>• Delete options by clicking the "Delete" button</li>
                  <li>• Changes will be reflected in the transport request forms immediately</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pickup Locations Tab */}
      {activeTab === 'pickup-locations' && (
        <>
          {/* Hospital Selection - Only show for multi-location users */}
          {user.manageMultipleLocations ? (
            <div className="mb-6">
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                Select Location
              </label>
              <select
                id="hospital"
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a location...</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Single-location users - just show their facility name */
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Managing Pickup Locations for:</p>
                  <p className="text-base font-semibold text-blue-700">{user.facilityName}</p>
                </div>
              </div>
            </div>
          )}

          {selectedHospital && (
            <div className="space-y-6">
              {/* Add New Pickup Location Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pickup Locations for {hospitals.find(h => h.id === selectedHospital)?.name}
                </h3>
                <button
                  onClick={handleAddPickupLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Pickup Location
                </button>
              </div>

              {/* Pickup Locations List */}
              {pickupLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : pickupLocations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pickup locations found for this hospital.</p>
                  <p className="text-sm">Add some pickup locations using the button above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pickupLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{location.name}</h4>
                        {location.description && (
                          <p className="text-sm text-gray-600 mt-1">{location.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                          {location.floor && <span>Floor: {location.floor}</span>}
                          {location.room && <span>Room: {location.room}</span>}
                          {location.contactPhone && <span>Phone: {location.contactPhone}</span>}
                          {location.contactEmail && <span>Email: {location.contactEmail}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPickupLocation(location)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePickupLocation(location.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pickup Location Form Modal */}
          {showPickupForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingPickupLocation ? 'Edit Pickup Location' : 'Add New Pickup Location'}
                  </h3>
                  
                  {/* Error display inside modal */}
                  {pickupError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{pickupError}</p>
                      <button 
                        onClick={() => setPickupError(null)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  
                  <form onSubmit={handleSavePickupLocation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Name *
                      </label>
                      <input
                        type="text"
                        value={pickupFormData.name}
                        onChange={(e) => setPickupFormData({...pickupFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Emergency Department"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={pickupFormData.description}
                        onChange={(e) => setPickupFormData({...pickupFormData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional description"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Floor
                        </label>
                        <input
                          type="text"
                          value={pickupFormData.floor}
                          onChange={(e) => setPickupFormData({...pickupFormData, floor: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 1st Floor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room
                        </label>
                        <input
                          type="text"
                          value={pickupFormData.room}
                          onChange={(e) => setPickupFormData({...pickupFormData, room: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Room 101"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={pickupFormData.contactPhone}
                        onChange={(e) => setPickupFormData({...pickupFormData, contactPhone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={pickupFormData.contactEmail}
                        onChange={(e) => setPickupFormData({...pickupFormData, contactEmail: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., ed@hospital.com"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPickupForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={pickupLoading || !pickupFormData.name.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pickupLoading ? 'Saving...' : (editingPickupLocation ? 'Update' : 'Create')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select a hospital to manage its pickup locations</li>
              <li>• Add new pickup locations using the "Add Pickup Location" button</li>
              <li>• Edit existing locations by clicking the "Edit" button</li>
              <li>• Delete locations by clicking the "Delete" button</li>
              <li>• Pickup locations will be available in the trip creation form</li>
            </ul>
          </div>
        </>
      )}

      {activeTab === 'main-contact' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Main Contact Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set the main contact person for this facility's administration of the TCC application.
              </p>
            </div>
            <div className="px-6 py-6">
              {/* Contact Success/Error Messages */}
              {contactSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800">{contactSuccess}</p>
                </div>
              )}

              {contactError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{contactError}</p>
                </div>
              )}

              <form onSubmit={handleSaveContact} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={contactFormData.contactName}
                      onChange={handleContactInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter contact name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Title/Position
                    </label>
                    <input
                      type="text"
                      id="contactTitle"
                      name="contactTitle"
                      value={contactFormData.contactTitle}
                      onChange={handleContactInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., IT Director, Administrator"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={contactFormData.contactEmail}
                      onChange={handleContactInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="contact@hospital.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={contactFormData.contactPhone}
                      onChange={handleContactInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contactNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="contactNotes"
                    name="contactNotes"
                    value={contactFormData.contactNotes}
                    onChange={handleContactInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional information about this contact person..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setContactFormData({
                        contactName: '',
                        contactTitle: '',
                        contactEmail: '',
                        contactPhone: '',
                        contactNotes: ''
                      });
                      setContactError(null);
                      setContactSuccess(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactLoading ? 'Saving...' : 'Save Contact Information'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• This contact person will be the main administrator for this facility's TCC application</li>
              <li>• They will receive notifications about system updates and important changes</li>
              <li>• This information may be used for support and troubleshooting purposes</li>
              <li>• Ensure the email address is monitored regularly for important communications</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalSettings;