import React, { useState, useEffect } from 'react';
import { DistanceMatrix, Facility, RouteType } from '../types/transport';

interface DistanceMatrixComponentProps {
  facilities: Facility[];
  onDistanceUpdate?: (fromFacilityId: string, toFacilityId: string, distance: number, time: number) => void;
}

interface BulkImportResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; data: any; errors: string[] }>;
}

interface DistanceStats {
  totalEntries: number;
  averageDistance: number;
  averageTime: number;
  distanceRange: { min: number; max: number };
  timeRange: { min: number; max: number };
  facilityCount: number;
  lastUpdated: string | null;
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
    routeType: RouteType.FASTEST
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDistance, setNewDistance] = useState({
    fromFacilityId: '',
    toFacilityId: '',
    routeType: RouteType.FASTEST
  });
  
  // New state for enhanced features
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [bulkImportData, setBulkImportData] = useState<string>('');
  const [bulkImportResult, setBulkImportResult] = useState<BulkImportResult | null>(null);
  const [distanceStats, setDistanceStats] = useState<DistanceStats | null>(null);
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [searchFilters, setSearchFilters] = useState({
    fromFacilityId: '',
    toFacilityId: '',
    minDistance: '',
    maxDistance: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Store all demo distances (including newly added ones) separately from filtered distances
  const [allDemoDistances, setAllDemoDistances] = useState<DistanceMatrix[]>([]);

  useEffect(() => {
    if (facilities.length > 0) {
      // Initialize demo distances if this is the first load
      if (facilities.some(f => f.id.startsWith('demo-')) && allDemoDistances.length === 0) {
        const initialDemoDistances: DistanceMatrix[] = [
          {
            id: 'demo-1',
            fromFacilityId: 'demo-1',
            toFacilityId: 'demo-2',
            distanceMiles: 45.2,
            estimatedTimeMinutes: 52,
            trafficFactor: 1.1,
            tolls: 0.0,
            routeType: RouteType.FASTEST,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'demo-2',
            fromFacilityId: 'demo-1',
            toFacilityId: 'demo-3',
            distanceMiles: 38.7,
            estimatedTimeMinutes: 44,
            trafficFactor: 1.0,
            tolls: 0.0,
            routeType: RouteType.FASTEST,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'demo-3',
            fromFacilityId: 'demo-2',
            toFacilityId: 'demo-4',
            distanceMiles: 67.3,
            estimatedTimeMinutes: 78,
            trafficFactor: 1.2,
            tolls: 0.0,
            routeType: RouteType.FASTEST,
            lastUpdated: new Date().toISOString()
          }
        ];
        setAllDemoDistances(initialDemoDistances);
      }
      loadDistanceMatrix();
      loadDistanceStats();
    }
  }, [facilities, currentPage, searchFilters, allDemoDistances]);

  const loadDistanceMatrix = async () => {
    try {
      setLoading(true);
      
      // For demo mode, show sample distance data with filtering
      if (facilities.some(f => f.id.startsWith('demo-'))) {
        // Use allDemoDistances instead of hardcoded demo distances
        let filteredDistances = allDemoDistances;
        
        if (searchFilters.fromFacilityId) {
          filteredDistances = filteredDistances.filter(d => d.fromFacilityId === searchFilters.fromFacilityId);
        }
        
        if (searchFilters.toFacilityId) {
          filteredDistances = filteredDistances.filter(d => d.toFacilityId === searchFilters.toFacilityId);
        }
        
        if (searchFilters.minDistance) {
          const minDistance = parseFloat(searchFilters.minDistance);
          filteredDistances = filteredDistances.filter(d => d.distanceMiles >= minDistance);
        }
        
        if (searchFilters.maxDistance) {
          const maxDistance = parseFloat(searchFilters.maxDistance);
          filteredDistances = filteredDistances.filter(d => d.distanceMiles <= maxDistance);
        }

        setDistances(filteredDistances);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      // Build query parameters for API calls
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (searchFilters.fromFacilityId) params.append('fromFacilityId', searchFilters.fromFacilityId);
      if (searchFilters.toFacilityId) params.append('toFacilityId', searchFilters.toFacilityId);

      const response = await fetch(`/api/distance/matrix/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDistances(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Failed to load distance matrix');
      }
    } catch (error) {
      console.error('Error loading distance matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistanceStats = async () => {
    try {
      if (facilities.some(f => f.id.startsWith('demo-'))) {
        // Calculate demo stats dynamically from current filtered distances
        if (distances.length > 0) {
          const totalEntries = distances.length;
          const totalDistance = distances.reduce((sum, d) => sum + d.distanceMiles, 0);
          const totalTime = distances.reduce((sum, d) => sum + d.estimatedTimeMinutes, 0);
          const averageDistance = totalDistance / totalEntries;
          const averageTime = totalTime / totalEntries;
          
          const distanceValues = distances.map(d => d.distanceMiles);
          const timeValues = distances.map(d => d.estimatedTimeMinutes);
          
          const distanceRange = {
            min: Math.min(...distanceValues),
            max: Math.max(...distanceValues)
          };
          
          const timeRange = {
            min: Math.min(...timeValues),
            max: Math.max(...timeValues)
          };
          
          setDistanceStats({
            totalEntries,
            averageDistance,
            averageTime,
            distanceRange,
            timeRange,
            facilityCount: facilities.length,
            lastUpdated: new Date().toISOString()
          });
        } else {
          // Fallback to default demo stats if no distances match filters
          setDistanceStats({
            totalEntries: 0,
            averageDistance: 0,
            averageTime: 0,
            distanceRange: { min: 0, max: 0 },
            timeRange: { min: 0, max: 0 },
            facilityCount: facilities.length,
            lastUpdated: new Date().toISOString()
          });
        }
        return;
      }

      const response = await fetch('/api/distance/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDistanceStats(data.data);
      }
    } catch (error) {
      console.error('Error loading distance stats:', error);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportData.trim()) {
      alert('Please enter data to import');
      return;
    }

    try {
      setLoading(true);
      let importData;
      
      try {
        importData = JSON.parse(bulkImportData);
      } catch (error) {
        alert('Invalid JSON format. Please check your data.');
        return;
      }

      if (!Array.isArray(importData)) {
        alert('Import data must be an array of distance entries');
        return;
      }

      const response = await fetch('/api/distance/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: importData })
      });

      if (response.ok) {
        const result = await response.json();
        setBulkImportResult(result.data);
        setBulkImportData('');
        setShowBulkImport(false);
        loadDistanceMatrix();
        loadDistanceStats();
        
        if (result.data.failed > 0) {
          alert(`Import completed with ${result.data.success} successful and ${result.data.failed} failed entries. Check the results for details.`);
        } else {
          alert(`Successfully imported ${result.data.success} distance entries!`);
        }
      } else {
        const errorData = await response.json();
        alert(`Import failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during bulk import:', error);
      alert('Error during bulk import');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({ format });
      if (searchFilters.fromFacilityId) params.append('fromFacilityId', searchFilters.fromFacilityId);
      if (searchFilters.toFacilityId) params.append('toFacilityId', searchFilters.toFacilityId);
      if (searchFilters.minDistance) params.append('minDistance', searchFilters.minDistance);
      if (searchFilters.maxDistance) params.append('maxDistance', searchFilters.maxDistance);

      const response = await fetch(`/api/distance/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `distance-matrix.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowExportOptions(false);
      } else {
        alert('Export failed');
      }
    } catch (error) {
      console.error('Error during export:', error);
      alert('Error during export');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!confirm('This will analyze and optimize the distance matrix. Continue?')) {
      return;
    }

    try {
      setOptimizationRunning(true);
      const response = await fetch('/api/distance/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOptimizationResult(result.data);
        loadDistanceMatrix();
        loadDistanceStats();
        alert(`Optimization completed! Removed: ${result.data.entriesRemoved}, Updated: ${result.data.entriesUpdated}`);
      } else {
        alert('Optimization failed');
      }
    } catch (error) {
      console.error('Error during optimization:', error);
      alert('Error during optimization');
    } finally {
      setOptimizationRunning(false);
    }
  };

  const handleCalculateDistance = async () => {
    if (!selectedFromFacility || !selectedToFacility) {
      alert('Please select both origin and destination facilities');
      return;
    }

    // For demo mode, create a new distance entry
    if (facilities.some(f => f.id.startsWith('demo-'))) {
      const fromFacility = facilities.find(f => f.id === selectedFromFacility);
      const toFacility = facilities.find(f => f.id === selectedToFacility);
      
      if (fromFacility && toFacility) {
        // Simple demo distance calculation based on facility IDs
        const distance = Math.random() * 50 + 20; // Random distance between 20-70 miles
        const time = Math.ceil(distance * 1.2); // Rough time estimate
        
        // Create a new distance entry for demo mode
        const newDistanceEntry: DistanceMatrix = {
          id: `demo-${Date.now()}`, // Generate unique ID
          fromFacilityId: selectedFromFacility,
          toFacilityId: selectedToFacility,
          distanceMiles: distance,
          estimatedTimeMinutes: time,
          trafficFactor: 1.0,
          tolls: 0.0,
          routeType: RouteType.FASTEST,
          lastUpdated: new Date().toISOString()
        };
        
        // Add to the allDemoDistances state
        setAllDemoDistances(prev => [...prev, newDistanceEntry]);
        
        // Apply current filters to the allDemoDistances to get the final filtered list
        let filteredDemoDistances = [...allDemoDistances, newDistanceEntry];
        if (searchFilters.fromFacilityId) {
          filteredDemoDistances = filteredDemoDistances.filter(d => d.fromFacilityId === searchFilters.fromFacilityId);
        }
        if (searchFilters.toFacilityId) {
          filteredDemoDistances = filteredDemoDistances.filter(d => d.toFacilityId === searchFilters.toFacilityId);
        }
        if (searchFilters.minDistance) {
          const minDistance = parseFloat(searchFilters.minDistance);
          filteredDemoDistances = filteredDemoDistances.filter(d => d.distanceMiles >= minDistance);
        }
        if (searchFilters.maxDistance) {
          const maxDistance = parseFloat(searchFilters.maxDistance);
          filteredDemoDistances = filteredDemoDistances.filter(d => d.distanceMiles <= maxDistance);
        }

        // Update the main distances state with the filtered demo distances
        setDistances(filteredDemoDistances);
        
        // Show success message
        alert(`✅ New Distance Entry Created!\n\nFrom: ${fromFacility.name}\nTo: ${toFacility.name}\nDistance: ${distance.toFixed(1)} miles\nTime: ${time} minutes\n\nNote: This is demo data. Real calculations will use Google Maps API.`);
        
        // Clear the selection
        setSelectedFromFacility('');
        setSelectedToFacility('');
        
        // Refresh stats
        loadDistanceStats();
      }
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
        
        // Create or update the distance matrix entry
        const distanceData = {
          fromFacilityId: selectedFromFacility,
          toFacilityId: selectedToFacility,
          distanceMiles: data.data.distanceMiles,
          estimatedTimeMinutes: data.data.estimatedTimeMinutes,
          trafficFactor: data.data.trafficFactor || 1.0,
          tolls: data.data.tolls || 0.0,
          routeType: data.data.routeType || RouteType.FASTEST
        };

        // Use the existing API to create/update the entry
        const createResponse = await fetch('/api/distance/matrix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(distanceData)
        });

        if (createResponse.ok) {
          const createdEntry = await createResponse.json();
          alert(`✅ Distance Entry Created/Updated!\n\nDistance: ${data.data.distanceMiles.toFixed(2)} miles\nTime: ${data.data.estimatedTimeMinutes} minutes\n\nEntry has been added to the distance matrix.`);
          
          // Clear the selection
          setSelectedFromFacility('');
          setSelectedToFacility('');
          
          // Refresh the matrix and stats
          loadDistanceMatrix();
          loadDistanceStats();
        } else {
          alert(`Distance calculated but failed to save: ${data.data.distanceMiles.toFixed(2)} miles, ${data.data.estimatedTimeMinutes} minutes`);
        }
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
        setNewDistance({ fromFacilityId: '', toFacilityId: '', routeType: RouteType.FASTEST });
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchFilters({
      fromFacilityId: '',
      toFacilityId: '',
      minDistance: '',
      maxDistance: ''
    });
    setCurrentPage(1);
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
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Distance Matrix</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showBulkImport ? 'Cancel' : 'Bulk Import'}
          </button>
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showExportOptions ? 'Cancel' : 'Export'}
          </button>
          <button
            onClick={handleOptimize}
            disabled={optimizationRunning}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {optimizationRunning ? 'Optimizing...' : 'Optimize Matrix'}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Distance'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {distanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600">Total Entries</div>
            <div className="text-2xl font-bold text-blue-900">{distanceStats.totalEntries}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600">Avg Distance</div>
            <div className="text-2xl font-bold text-green-900">{distanceStats.averageDistance.toFixed(1)} mi</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-600">Avg Time</div>
            <div className="text-2xl font-bold text-purple-900">{distanceStats.averageTime.toFixed(0)} min</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-600">Facilities</div>
            <div className="text-2xl font-bold text-orange-900">{distanceStats.facilityCount}</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Search & Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={searchFilters.fromFacilityId}
            onChange={(e) => setSearchFilters({ ...searchFilters, fromFacilityId: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Origin Facilities</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
          
          <select
            value={searchFilters.toFacilityId}
            onChange={(e) => setSearchFilters({ ...searchFilters, toFacilityId: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Destination Facilities</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Min Distance (mi)"
            value={searchFilters.minDistance}
            onChange={(e) => setSearchFilters({ ...searchFilters, minDistance: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="number"
            placeholder="Max Distance (mi)"
            value={searchFilters.maxDistance}
            onChange={(e) => setSearchFilters({ ...searchFilters, maxDistance: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Import Form */}
      {showBulkImport && (
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">Bulk Import Distance Data</h3>
          <div className="mb-4">
            <textarea
              value={bulkImportData}
              onChange={(e) => setBulkImportData(e.target.value)}
              placeholder="Paste JSON array of distance entries here..."
              className="w-full h-32 border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkImport}
              disabled={!bulkImportData.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Import Data
            </button>
            <button
              onClick={() => setBulkImportData('')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
          {bulkImportResult && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-purple-800 mb-2">Import Results:</h4>
              <div className="text-sm">
                <p>✅ Successful: {bulkImportResult.success}</p>
                <p>❌ Failed: {bulkImportResult.failed}</p>
                {bulkImportResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-600">Errors:</p>
                    {bulkImportResult.errors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-red-600 text-xs">
                        Row {error.index + 1}: {error.errors.join(', ')}
                      </p>
                    ))}
                    {bulkImportResult.errors.length > 5 && (
                      <p className="text-red-600 text-xs">... and {bulkImportResult.errors.length - 5} more errors</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Options */}
      {showExportOptions && (
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Export Distance Matrix</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('json')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Export as JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Export as CSV
            </button>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Export will include current filters: {searchFilters.fromFacilityId ? `From: ${getFacilityName(searchFilters.fromFacilityId)}` : ''} {searchFilters.toFacilityId ? `To: ${getFacilityName(searchFilters.toFacilityId)}` : ''}
          </p>
        </div>
      )}

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">Optimization Results</h3>
          <div className="text-sm text-orange-700">
            <p>✅ Entries removed: {optimizationResult.entriesRemoved}</p>
            <p>🔄 Entries updated: {optimizationResult.entriesUpdated}</p>
            {optimizationResult.inconsistencies.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">⚠️ Inconsistencies found:</p>
                {optimizationResult.inconsistencies.slice(0, 3).map((inconsistency, index) => (
                  <p key={index} className="text-orange-600 text-xs">{inconsistency}</p>
                ))}
                {optimizationResult.inconsistencies.length > 3 && (
                  <p className="text-orange-600 text-xs">... and {optimizationResult.inconsistencies.length - 3} more</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-lg ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {distances.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No distance matrix entries found. Add some distances to get started.
        </div>
      )}
    </div>
  );
};

export default DistanceMatrixComponent;
