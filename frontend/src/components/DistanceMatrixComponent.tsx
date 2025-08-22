import React, { useState, useEffect } from 'react';
import { DistanceMatrix, Facility, RouteType } from '../types/transport';

interface DistanceMatrixComponentProps {
  facilities: Facility[];
  onDistanceUpdate?: (fromFacilityId: string, toFacilityId: string, distance: number, time: number) => void;
}

const DistanceMatrixComponent: React.FC<DistanceMatrixComponentProps> = ({
  facilities,
  onDistanceUpdate
}) => {
  const [distances, setDistances] = useState<DistanceMatrix[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFromFacility, setSelectedFromFacility] = useState<string>('');
  const [selectedToFacility, setSelectedToFacility] = useState<string>('');
  const [editingDistance, setEditingDistance] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    distanceMiles: 0,
    estimatedTimeMinutes: 0,
    trafficFactor: 1.0,
    tolls: 0.0,
    routeType: 'FASTEST' as RouteType
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDistance, setNewDistance] = useState({
    fromFacilityId: '',
    toFacilityId: '',
    routeType: 'FASTEST' as RouteType
  });

  useEffect(() => {
    if (facilities.length > 0) {
      loadDistanceMatrix();
    }
  }, [facilities]);

  const loadDistanceMatrix = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/distance/matrix/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDistances(data.data || []);
      } else {
        console.error('Failed to load distance matrix');
      }
    } catch (error) {
      console.error('Error loading distance matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDistance = async () => {
    if (!selectedFromFacility || !selectedToFacility) {
      alert('Please select both origin and destination facilities');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/distance/calculate?fromFacilityId=${selectedFromFacility}&toFacilityId=${selectedToFacility}&routeType=FASTEST`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Distance: ${data.data.distanceMiles.toFixed(2)} miles\nTime: ${data.data.estimatedTimeMinutes} minutes`);
        loadDistanceMatrix(); // Refresh the matrix
      } else {
        alert('Failed to calculate distance');
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      alert('Error calculating distance');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDistance = (distance: DistanceMatrix) => {
    setEditingDistance(distance.id);
    setEditForm({
      distanceMiles: distance.distanceMiles,
      estimatedTimeMinutes: distance.estimatedTimeMinutes,
      trafficFactor: distance.trafficFactor,
      tolls: distance.tolls,
      routeType: distance.routeType
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDistance) return;

    try {
      const distance = distances.find(d => d.id === editingDistance);
      if (!distance) return;

      const response = await fetch('/api/distance/matrix', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fromFacilityId: distance.fromFacilityId,
          toFacilityId: distance.toFacilityId,
          ...editForm
        })
      });

      if (response.ok) {
        setEditingDistance(null);
        loadDistanceMatrix();
        if (onDistanceUpdate) {
          onDistanceUpdate(distance.fromFacilityId, distance.toFacilityId, editForm.distanceMiles, editForm.estimatedTimeMinutes);
        }
      } else {
        alert('Failed to update distance');
      }
    } catch (error) {
      console.error('Error updating distance:', error);
      alert('Error updating distance');
    }
  };

  const handleAddDistance = async () => {
    if (!newDistance.fromFacilityId || !newDistance.toFacilityId) {
      alert('Please select both facilities');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/distance/matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newDistance)
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewDistance({ fromFacilityId: '', toFacilityId: '', routeType: 'FASTEST' });
        loadDistanceMatrix();
      } else {
        alert('Failed to create distance matrix entry');
      }
    } catch (error) {
      console.error('Error creating distance matrix entry:', error);
      alert('Error creating distance matrix entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDistance = async (distance: DistanceMatrix) => {
    if (!confirm('Are you sure you want to delete this distance entry?')) return;

    try {
      const response = await fetch(`/api/distance/matrix?fromFacilityId=${distance.fromFacilityId}&toFacilityId=${distance.toFacilityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadDistanceMatrix();
      } else {
        alert('Failed to delete distance entry');
      }
    } catch (error) {
      console.error('Error deleting distance entry:', error);
      alert('Error deleting distance entry');
    }
  };

  const getFacilityName = (facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility ? facility.name : 'Unknown Facility';
  };

  const getFacilityLocation = (facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility ? `${facility.city}, ${facility.state}` : '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Distance Matrix</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Distance'}
        </button>
      </div>

      {/* Distance Calculator */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Calculate Distance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedFromFacility}
            onChange={(e) => setSelectedFromFacility(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Origin Facility</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>
                {facility.name} - {facility.city}, {facility.state}
              </option>
            ))}
          </select>
          
          <select
            value={selectedToFacility}
            onChange={(e) => setSelectedToFacility(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Destination Facility</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>
                {facility.name} - {facility.city}, {facility.state}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleCalculateDistance}
            disabled={!selectedFromFacility || !selectedToFacility}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Calculate Distance
          </button>
        </div>
      </div>

      {/* Add New Distance Form */}
      {showAddForm && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Add New Distance Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={newDistance.fromFacilityId}
              onChange={(e) => setNewDistance({ ...newDistance, fromFacilityId: e.target.value })}
              className="border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Origin Facility</option>
              {facilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name} - {facility.city}, {facility.state}
                </option>
              ))}
            </select>
            
            <select
              value={newDistance.toFacilityId}
              onChange={(e) => setNewDistance({ ...newDistance, toFacilityId: e.target.value })}
              className="border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Destination Facility</option>
              {facilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name} - {facility.city}, {facility.state}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleAddDistance}
              disabled={!newDistance.fromFacilityId || !newDistance.toFacilityId}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Distance
            </button>
          </div>
        </div>
      )}

      {/* Distance Matrix Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Origin Facility
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Destination Facility
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Distance (Miles)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Time (Minutes)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Route Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Last Updated
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {distances.map((distance) => (
              <tr key={distance.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getFacilityName(distance.fromFacilityId)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getFacilityLocation(distance.fromFacilityId)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getFacilityName(distance.toFacilityId)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getFacilityLocation(distance.toFacilityId)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {editingDistance === distance.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.distanceMiles}
                      onChange={(e) => setEditForm({ ...editForm, distanceMiles: parseFloat(e.target.value) })}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-900 font-medium">
                      {distance.distanceMiles.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {editingDistance === distance.id ? (
                    <input
                      type="number"
                      value={editForm.estimatedTimeMinutes}
                      onChange={(e) => setEditForm({ ...editForm, estimatedTimeMinutes: parseInt(e.target.value) })}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {distance.estimatedTimeMinutes}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {editingDistance === distance.id ? (
                    <select
                      value={editForm.routeType}
                      onChange={(e) => setEditForm({ ...editForm, routeType: e.target.value as RouteType })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="FASTEST">Fastest</option>
                      <option value="SHORTEST">Shortest</option>
                      <option value="MOST_EFFICIENT">Most Efficient</option>
                      <option value="LOWEST_COST">Lowest Cost</option>
                    </select>
                  ) : (
                    <span className="text-sm text-gray-900">
                      {distance.routeType.replace('_', ' ')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(distance.lastUpdated).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  {editingDistance === distance.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingDistance(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditDistance(distance)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDistance(distance)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {distances.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No distance matrix entries found. Add some distances to get started.
        </div>
      )}
    </div>
  );
};

export default DistanceMatrixComponent;
