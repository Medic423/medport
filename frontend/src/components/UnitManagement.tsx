import React, { useState, useEffect } from 'react';

interface Unit {
  id: string;
  unitNumber: string;
  type: 'BLS' | 'ALS' | 'CCT';
  currentStatus: 'AVAILABLE' | 'IN_USE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
  unitAvailability?: {
    id: string;
    status: string;
    location?: any;
    shiftStart?: string;
    shiftEnd?: string;
    crewMembers?: any;
    currentAssignment?: string;
    notes?: string;
  };
}

interface UnitAvailabilityData {
  unitId: string;
  status: 'AVAILABLE' | 'IN_USE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
  location?: any;
  shiftStart?: string;
  shiftEnd?: string;
  crewMembers?: any;
  currentAssignment?: string;
  notes?: string;
}

const UnitManagement: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UnitAvailabilityData>({
    unitId: '',
    status: 'AVAILABLE',
    location: null,
    shiftStart: '',
    shiftEnd: '',
    crewMembers: null,
    currentAssignment: '',
    notes: ''
  });

  const agency = JSON.parse(localStorage.getItem('agency') || '{}');
  const agencyToken = localStorage.getItem('agencyToken');
  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
    } else {
      loadUnits();
    }
  }, []);

  const loadDemoData = () => {
    // Demo data for testing
    setUnits([
      {
        id: '1',
        unitNumber: 'A-101',
        type: 'BLS',
        currentStatus: 'AVAILABLE',
        unitAvailability: {
          id: '1',
          status: 'AVAILABLE',
          location: { lat: 40.5187, lng: -78.3945, address: 'Altoona, PA' },
          shiftStart: '2025-08-23T06:00:00Z',
          shiftEnd: '2025-08-23T18:00:00Z',
          crewMembers: [
            { name: 'John Smith', role: 'EMT', phone: '555-0101' },
            { name: 'Sarah Johnson', role: 'Driver', phone: '555-0102' }
          ],
          currentAssignment: null,
          notes: 'Unit ready for service'
        }
      },
      {
        id: '2',
        unitNumber: 'A-102',
        type: 'ALS',
        currentStatus: 'IN_USE',
        unitAvailability: {
          id: '2',
          status: 'IN_USE',
          location: { lat: 40.5187, lng: -78.3945, address: 'UPMC Altoona' },
          shiftStart: '2025-08-23T06:00:00Z',
          shiftEnd: '2025-08-23T18:00:00Z',
          crewMembers: [
            { name: 'Mike Wilson', role: 'Paramedic', phone: '555-0103' },
            { name: 'Lisa Brown', role: 'EMT', phone: '555-0104' }
          ],
          currentAssignment: 'Transport from UPMC Altoona to Penn State Health',
          notes: 'Currently on transport assignment'
        }
      },
      {
        id: '3',
        unitNumber: 'A-103',
        type: 'CCT',
        currentStatus: 'AVAILABLE',
        unitAvailability: {
          id: '3',
          status: 'AVAILABLE',
          location: { lat: 40.5187, lng: -78.3945, address: 'Altoona, PA' },
          shiftStart: '2025-08-23T06:00:00Z',
          shiftEnd: '2025-08-23T18:00:00Z',
          crewMembers: [
            { name: 'Dr. Robert Chen', role: 'Critical Care Nurse', phone: '555-0105' },
            { name: 'Tom Davis', role: 'Paramedic', phone: '555-0106' }
          ],
          currentAssignment: null,
          notes: 'CCT unit available for critical care transports'
        }
      },
      {
        id: '4',
        unitNumber: 'A-104',
        type: 'BLS',
        currentStatus: 'AVAILABLE',
        unitAvailability: {
          id: '4',
          status: 'AVAILABLE',
          location: { lat: 40.5187, lng: -78.3945, address: 'Altoona, PA' },
          shiftStart: '2025-08-23T06:00:00Z',
          shiftEnd: '2025-08-23T18:00:00Z',
          crewMembers: [
            { name: 'Amy Wilson', role: 'EMT', phone: '555-0107' },
            { name: 'Chris Lee', role: 'Driver', phone: '555-0108' }
          ],
          currentAssignment: null,
          notes: 'Unit ready for service'
        }
      },
      {
        id: '5',
        unitNumber: 'A-105',
        type: 'ALS',
        currentStatus: 'MAINTENANCE',
        unitAvailability: {
          id: '5',
          status: 'MAINTENANCE',
          location: { lat: 40.5187, lng: -78.3945, address: 'Maintenance Garage' },
          shiftStart: null,
          shiftEnd: null,
          crewMembers: null,
          currentAssignment: 'Scheduled maintenance - brake system',
          notes: 'Expected completion: 2025-08-24'
        }
      }
    ]);
    setIsLoading(false);
  };

  const loadUnits = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agency/units', {
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load units');
      }

      const data = await response.json();
      setUnits(data.units || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load units');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit.id);
    setEditForm({
      unitId: unit.id,
      status: unit.currentStatus,
      location: unit.unitAvailability?.location || null,
      shiftStart: unit.unitAvailability?.shiftStart ? new Date(unit.unitAvailability.shiftStart).toISOString().slice(0, 16) : '',
      shiftEnd: unit.unitAvailability?.shiftEnd ? new Date(unit.unitAvailability.shiftEnd).toISOString().slice(0, 16) : '',
      crewMembers: unit.unitAvailability?.crewMembers || null,
      currentAssignment: unit.unitAvailability?.currentAssignment || '',
      notes: unit.unitAvailability?.notes || ''
    });
  };

  const handleSaveUnit = async () => {
    try {
      if (isDemoMode) {
        // Update demo data
        setUnits(prevUnits => prevUnits.map(unit => 
          unit.id === editingUnit 
            ? {
                ...unit,
                currentStatus: editForm.status,
                unitAvailability: {
                  ...unit.unitAvailability,
                  status: editForm.status,
                  location: editForm.location,
                  shiftStart: editForm.shiftStart,
                  shiftEnd: editForm.shiftEnd,
                  crewMembers: editForm.crewMembers,
                  currentAssignment: editForm.currentAssignment,
                  notes: editForm.notes
                }
              }
            : unit
        ));
        setEditingUnit(null);
        return;
      }

      const response = await fetch(`/api/agency/units/${editingUnit}/availability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update unit');
      }

      await loadUnits();
      setEditingUnit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update unit');
    }
  };

  const handleCancelEdit = () => {
    setEditingUnit(null);
    setEditForm({
      unitId: '',
      status: 'AVAILABLE',
      location: null,
      shiftStart: '',
      shiftEnd: '',
      crewMembers: null,
      currentAssignment: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'IN_USE': return 'bg-blue-100 text-blue-800';
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BLS': return 'bg-blue-100 text-blue-800';
      case 'ALS': return 'bg-purple-100 text-purple-800';
      case 'CCT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Unit Management</h2>
          <p className="text-gray-600">Manage your transport units, crew assignments, and availability</p>
        </div>
        <div className="text-sm text-gray-500">
          {units.filter(u => u.currentStatus === 'AVAILABLE').length} of {units.length} units available
        </div>
      </div>

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

      {/* Units Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {units.map(unit => (
          <div key={unit.id} className="bg-white rounded-lg shadow border border-gray-200">
            {/* Unit Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{unit.unitNumber}</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(unit.type)}`}>
                    {unit.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(unit.currentStatus)}`}>
                    {unit.currentStatus}
                  </span>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditUnit(unit)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                {unit.currentStatus === 'AVAILABLE' && (
                  <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                    Assign
                  </button>
                )}
              </div>
            </div>

            {/* Unit Details */}
            <div className="p-4 space-y-3">
              {/* Status Info */}
              <div className="text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span> {unit.unitAvailability?.status || 'Unknown'}
                </p>
                {unit.unitAvailability?.currentAssignment && (
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Assignment:</span> {unit.unitAvailability.currentAssignment}
                  </p>
                )}
              </div>

              {/* Shift Information */}
              {unit.unitAvailability?.shiftStart && (
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Shift:</span></p>
                  <p>Start: {new Date(unit.unitAvailability.shiftStart).toLocaleTimeString()}</p>
                  {unit.unitAvailability.shiftEnd && (
                    <p>End: {new Date(unit.unitAvailability.shiftEnd).toLocaleTimeString()}</p>
                  )}
                </div>
              )}

              {/* Crew Members */}
              {unit.unitAvailability?.crewMembers && (
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-2">Crew:</p>
                  <div className="space-y-1">
                    {unit.unitAvailability.crewMembers.map((member: any, index: number) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span>{member.name} ({member.role})</span>
                        <span>{member.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {unit.unitAvailability?.notes && (
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Notes:</p>
                  <p className="text-gray-600 italic">{unit.unitAvailability.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Unit Availability</h3>
              
              <form className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                {/* Shift Start */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift Start</label>
                  <input
                    type="datetime-local"
                    value={editForm.shiftStart}
                    onChange={(e) => setEditForm({...editForm, shiftStart: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Shift End */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift End</label>
                  <input
                    type="datetime-local"
                    value={editForm.shiftEnd}
                    onChange={(e) => setEditForm({...editForm, shiftEnd: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Current Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Assignment</label>
                  <input
                    type="text"
                    value={editForm.currentAssignment}
                    onChange={(e) => setEditForm({...editForm, currentAssignment: e.target.value})}
                    placeholder="Describe current assignment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSaveUnit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitManagement;
