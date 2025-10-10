import React, { useEffect, useState } from 'react';
import { Unit, UNIT_CAPABILITY_LABELS, UNIT_STATUS_COLORS, UNIT_TYPE_LABELS } from '../types/units';
import { unitsAPI, tripsAPI } from '../services/api';

interface UnitSelectionModalProps {
  isOpen: boolean;
  tripId: string | null;
  onClose: () => void;
  onAssigned: () => void;
}

const UnitSelectionModal: React.FC<UnitSelectionModalProps> = ({ isOpen, tripId, onClose, onAssigned }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUnits = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await unitsAPI.getOnDuty();
        const data = res.data;
        if (data.success && Array.isArray(data.data)) {
          setUnits(data.data);
        } else {
          setError('Failed to load on-duty units');
        }
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load on-duty units');
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, [isOpen]);

  const handleAssign = async () => {
    if (!tripId || !selectedUnitId) return;
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    if (selectedUnit && selectedUnit.currentStatus !== 'AVAILABLE') {
      setError('Selected unit is not AVAILABLE. Please choose an available unit.');
      return;
    }
    setAssigning(true);
    setError(null);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      await tripsAPI.updateStatus(tripId, {
        status: 'ACCEPTED',
        assignedUnitId: selectedUnitId,
        assignedAgencyId: storedUser.agencyId || storedUser.id,
        acceptedTimestamp: new Date().toISOString(),
      });
      onAssigned();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to assign unit');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Select Unit</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">Close</button>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="text-sm text-gray-500">Loading on-duty units...</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-auto">
              {units.map((unit) => (
                <label key={unit.id} className={`flex items-start gap-3 p-3 border rounded hover:bg-gray-50 ${unit.currentStatus !== 'AVAILABLE' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}` }>
                  <input
                    type="radio"
                    name="unit"
                    className="mt-1"
                    checked={selectedUnitId === unit.id}
                    disabled={unit.currentStatus !== 'AVAILABLE'}
                    onChange={() => setSelectedUnitId(unit.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Unit {unit.unitNumber}</span>
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded ${UNIT_STATUS_COLORS[unit.currentStatus]}`}>{unit.currentStatus}</span>
                      <span className="text-xs text-gray-500">{UNIT_TYPE_LABELS[unit.type]}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Capabilities: {unit.capabilities.map((c) => UNIT_CAPABILITY_LABELS[c] || c).join(', ')}
                    </div>
                    {unit.currentTripDetails && (
                      <div className="mt-1 text-xs text-blue-600">On trip: {unit.currentTripDetails.tripId}</div>
                    )}
                  </div>
                </label>
              ))}
              {units.length === 0 && (
                <div className="text-sm text-gray-500">No on-duty units available.</div>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleAssign}
            disabled={!selectedUnitId || assigning}
            className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {assigning ? 'Assigning...' : 'Assign Unit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitSelectionModal;


