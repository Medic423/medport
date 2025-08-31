import React, { useState, useEffect } from 'react';
import { Star, Delete, Edit, ArrowUpward, ArrowDownward, Add, Search } from '@mui/icons-material';
import EMSAgencyBrowser from './EMSAgencyBrowser';

interface PreferredAgency {
  id: string;
  agencyId: string;
  isActive: boolean;
  preferenceOrder: number;
  notes?: string;
  createdAt: string;
  agency: {
    id: string;
    name: string;
    contactName?: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    units: Array<{
      id: string;
      type: string;
      unitAvailability: Array<{
        status: string;
      }>;
    }>;
    serviceAreas: Array<{
      name: string;
      description?: string;
    }>;
    agencyProfiles?: Array<{
      description?: string;
    }>;
  };
}

interface PreferredAgencyManagementProps {
  onClose?: () => void;
}

const PreferredAgencyManagement: React.FC<PreferredAgencyManagementProps> = ({ onClose }) => {
  const [preferredAgencies, setPreferredAgencies] = useState<PreferredAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    loadPreferredAgencies();
  }, []);

  const loadPreferredAgencies = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/hospital-agencies/preferred', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load preferred agencies');
      }

      const data = await response.json();
      setPreferredAgencies(data.data || []);
    } catch (err) {
      console.error('Error loading preferred agencies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferred agencies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPreferred = async (agency: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/hospital-agencies/preferred', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agencyId: agency.id,
          preferenceOrder: preferredAgencies.length
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add agency to preferred list');
      }

      // Reload the list
      await loadPreferredAgencies();
      setShowBrowser(false);
    } catch (err) {
      console.error('Error adding preferred agency:', err);
      setError(err instanceof Error ? err.message : 'Failed to add agency to preferred list');
    }
  };

  const handleRemovePreferred = async (agencyId: string) => {
    if (!confirm('Are you sure you want to remove this agency from your preferred list?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/hospital-agencies/preferred/${agencyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove agency from preferred list');
      }

      // Reload the list
      await loadPreferredAgencies();
    } catch (err) {
      console.error('Error removing preferred agency:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove agency from preferred list');
    }
  };

  const handleUpdatePreferenceOrder = async (agencyId: string, newOrder: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/hospital-agencies/preferred/${agencyId}/order`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferenceOrder: newOrder
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update preference order');
      }

      // Reload the list
      await loadPreferredAgencies();
    } catch (err) {
      console.error('Error updating preference order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preference order');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const agency = preferredAgencies[index];
      const newOrder = preferredAgencies[index - 1].preferenceOrder;
      handleUpdatePreferenceOrder(agency.agencyId, newOrder);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < preferredAgencies.length - 1) {
      const agency = preferredAgencies[index];
      const newOrder = preferredAgencies[index + 1].preferenceOrder;
      handleUpdatePreferenceOrder(agency.agencyId, newOrder);
    }
  };

  const handleEditNotes = (agency: PreferredAgency) => {
    setEditingNotes(agency.agencyId);
    setNotesValue(agency.notes || '');
  };

  const handleSaveNotes = async (agencyId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // For now, we'll just update the local state
      // In a real implementation, you'd make an API call to update the notes
      setPreferredAgencies(prev => 
        prev.map(pa => 
          pa.agencyId === agencyId 
            ? { ...pa, notes: notesValue }
            : pa
        )
      );
      
      setEditingNotes(null);
    } catch (err) {
      console.error('Error saving notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    }
  };

  const getTransportLevelIcon = (level: string) => {
    switch (level) {
      case 'BLS': return '🟢';
      case 'ALS': return '🟡';
      case 'CCT': return '🔴';
      case 'OTHER': return '⚪';
      default: return '⚪';
    }
  };

  if (showBrowser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Preferred Agencies</h2>
          <button
            onClick={() => setShowBrowser(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to Preferred List
          </button>
        </div>
        
        <EMSAgencyBrowser
          onAddToPreferred={handleAddToPreferred}
          preferredAgencyIds={preferredAgencies.map(pa => pa.agencyId)}
          showAddButton={true}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading preferred agencies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">⚠️</div>
          <div className="ml-2">
            <h3 className="text-red-800 font-medium">Error Loading Preferred Agencies</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={loadPreferredAgencies}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Preferred EMS Agencies</h2>
          <p className="text-gray-600 mt-1">
            Manage your preferred EMS agencies for trip notifications
          </p>
        </div>
        <button
          onClick={() => setShowBrowser(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Add className="h-4 w-4 mr-2" />
          Add Agency
        </button>
      </div>

      {/* Preferred Agencies List */}
      {preferredAgencies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Preferred Agencies</h3>
          <p className="text-gray-500 mb-4">
            Add EMS agencies to your preferred list to streamline trip notifications
          </p>
          <button
            onClick={() => setShowBrowser(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Add className="h-4 w-4 mr-2" />
            Browse Agencies
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {preferredAgencies
            .sort((a, b) => a.preferenceOrder - b.preferenceOrder)
            .map((preferredAgency, index) => (
            <div key={preferredAgency.id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Agency Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          {index + 1}
                        </span>
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {preferredAgency.agency.name}
                      </h3>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          📍 {preferredAgency.agency.address}, {preferredAgency.agency.city}, {preferredAgency.agency.state}
                        </div>
                        <div className="text-sm text-gray-600">
                          📞 {preferredAgency.agency.phone}
                        </div>
                        <div className="text-sm text-gray-600">
                          ✉️ {preferredAgency.agency.email}
                        </div>
                      </div>

                      {/* Transport Levels */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Transport Levels:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(preferredAgency.agency.units.map(unit => unit.type))).map(level => (
                            <span
                              key={level}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {getTransportLevelIcon(level)} {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes:</h4>
                      {editingNotes === preferredAgency.agencyId ? (
                        <div className="space-y-2">
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            placeholder="Add notes about this agency..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveNotes(preferredAgency.agencyId)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingNotes(null);
                                setNotesValue('');
                              }}
                              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-gray-600 flex-1">
                            {preferredAgency.notes || 'No notes added'}
                          </p>
                          <button
                            onClick={() => handleEditNotes(preferredAgency)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUpward className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === preferredAgencies.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDownward className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemovePreferred(preferredAgency.agencyId)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remove from preferred"
                    >
                      <Delete className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-blue-600">ℹ️</div>
          <div className="ml-2">
            <h3 className="text-blue-800 font-medium">About Preferred Agencies</h3>
            <p className="text-blue-700 text-sm mt-1">
              Preferred agencies will be notified first when you create new transport requests. 
              You can reorder them by priority using the up/down arrows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferredAgencyManagement;
