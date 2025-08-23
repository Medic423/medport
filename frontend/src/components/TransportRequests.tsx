import React, { useState, useEffect } from 'react';

interface TransportRequest {
  id: string;
  patientId: string;
  originFacility: {
    id: string;
    name: string;
    city: string;
    state: string;
    address: string;
  };
  destinationFacility: {
    id: string;
    name: string;
    city: string;
    state: string;
    address: string;
  };
  transportLevel: 'BLS' | 'ALS' | 'CCT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  requestTimestamp: string;
  specialRequirements?: string;
  estimatedDistance?: number;
  estimatedDuration?: number;
}

interface BidSubmissionData {
  transportRequestId: string;
  bidAmount?: number;
  estimatedArrival?: string;
  unitType: 'BLS' | 'ALS' | 'CCT';
  specialCapabilities?: any;
  notes?: string;
}

const TransportRequests: React.FC = () => {
  const [transports, setTransports] = useState<TransportRequest[]>([]);
  const [filteredTransports, setFilteredTransports] = useState<TransportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransport, setSelectedTransport] = useState<TransportRequest | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidForm, setBidForm] = useState<BidSubmissionData>({
    transportRequestId: '',
    bidAmount: undefined,
    estimatedArrival: '',
    unitType: 'BLS',
    specialCapabilities: null,
    notes: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    transportLevel: 'ALL',
    priority: 'ALL',
    maxDistance: '',
    originCity: '',
    destinationCity: '',
    searchTerm: ''
  });

  const agency = JSON.parse(localStorage.getItem('agency') || '{}');
  const agencyToken = localStorage.getItem('agency_token');
  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
    } else {
      loadTransports();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transports, filters]);

  const loadDemoData = () => {
    // Demo data for testing
    const demoTransports: TransportRequest[] = [
      {
        id: '1',
        patientId: 'P-001',
        originFacility: {
          id: '1',
          name: 'UPMC Altoona',
          city: 'Altoona',
          state: 'PA',
          address: '620 Howard Ave, Altoona, PA 16601'
        },
        destinationFacility: {
          id: '2',
          name: 'Penn State Health',
          city: 'Hershey',
          state: 'PA',
          address: '500 University Dr, Hershey, PA 17033'
        },
        transportLevel: 'CCT',
        priority: 'HIGH',
        status: 'PENDING',
        requestTimestamp: '2025-08-23T10:30:00Z',
        specialRequirements: 'Critical care transport, ventilator support required',
        estimatedDistance: 85,
        estimatedDuration: 90
      },
      {
        id: '2',
        patientId: 'P-002',
        originFacility: {
          id: '3',
          name: 'Mount Nittany Medical Center',
          city: 'State College',
          state: 'PA',
          address: '1800 E Park Ave, State College, PA 16803'
        },
        destinationFacility: {
          id: '1',
          name: 'UPMC Altoona',
          city: 'Altoona',
          state: 'PA',
          address: '620 Howard Ave, Altoona, PA 16601'
        },
        transportLevel: 'ALS',
        priority: 'MEDIUM',
        status: 'PENDING',
        requestTimestamp: '2025-08-23T09:15:00Z',
        specialRequirements: 'Cardiac monitoring, IV therapy',
        estimatedDistance: 45,
        estimatedDuration: 55
      },
      {
        id: '3',
        patientId: 'P-003',
        originFacility: {
          id: '4',
          name: 'Conemaugh Memorial Medical Center',
          city: 'Johnstown',
          state: 'PA',
          address: '1086 Franklin St, Johnstown, PA 15905'
        },
        destinationFacility: {
          id: '5',
          name: 'UPMC Presbyterian',
          city: 'Pittsburgh',
          state: 'PA',
          address: '200 Lothrop St, Pittsburgh, PA 15213'
        },
        transportLevel: 'CCT',
        priority: 'URGENT',
        status: 'PENDING',
        requestTimestamp: '2025-08-23T11:00:00Z',
        specialRequirements: 'Critical care transport, ECMO support',
        estimatedDistance: 120,
        estimatedDuration: 140
      },
      {
        id: '4',
        patientId: 'P-004',
        originFacility: {
          id: '6',
          name: 'Geisinger Medical Center',
          city: 'Danville',
          state: 'PA',
          address: '100 N Academy Ave, Danville, PA 17822'
        },
        destinationFacility: {
          id: '7',
          name: 'Temple University Hospital',
          city: 'Philadelphia',
          state: 'PA',
          address: '3401 N Broad St, Philadelphia, PA 19140'
        },
        transportLevel: 'BLS',
        priority: 'LOW',
        status: 'PENDING',
        requestTimestamp: '2025-08-23T08:45:00Z',
        specialRequirements: 'Basic transport, no special requirements',
        estimatedDistance: 180,
        estimatedDuration: 200
      },
      {
        id: '5',
        patientId: 'P-005',
        originFacility: {
          id: '8',
          name: 'Reading Hospital',
          city: 'Reading',
          state: 'PA',
          address: '420 S 5th Ave, Reading, PA 19611'
        },
        destinationFacility: {
          id: '9',
          name: 'Lehigh Valley Hospital',
          city: 'Allentown',
          state: 'PA',
          address: '1200 S Cedar Crest Blvd, Allentown, PA 18103'
        },
        transportLevel: 'ALS',
        priority: 'MEDIUM',
        status: 'PENDING',
        requestTimestamp: '2025-08-23T10:00:00Z',
        specialRequirements: 'Cardiac monitoring, medication administration',
        estimatedDistance: 35,
        estimatedDuration: 45
      }
    ];

    setTransports(demoTransports);
    setIsLoading(false);
  };

  const loadTransports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agency/transports/available', {
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load transport requests');
      }

      const data = await response.json();
      setTransports(data.transports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transport requests');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transports];

    // Transport Level Filter
    if (filters.transportLevel !== 'ALL') {
      filtered = filtered.filter(t => t.transportLevel === filters.transportLevel);
    }

    // Priority Filter
    if (filters.priority !== 'ALL') {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }

    // Max Distance Filter
    if (filters.maxDistance) {
      const maxDist = parseFloat(filters.maxDistance);
      filtered = filtered.filter(t => (t.estimatedDistance || 0) <= maxDist);
    }

    // Origin City Filter
    if (filters.originCity) {
      filtered = filtered.filter(t => 
        t.originFacility.city.toLowerCase().includes(filters.originCity.toLowerCase())
      );
    }

    // Destination City Filter
    if (filters.destinationCity) {
      filtered = filtered.filter(t => 
        t.destinationFacility.city.toLowerCase().includes(filters.destinationCity.toLowerCase())
      );
    }

    // Search Term Filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.patientId.toLowerCase().includes(searchLower) ||
        t.originFacility.name.toLowerCase().includes(searchLower) ||
        t.destinationFacility.name.toLowerCase().includes(searchLower) ||
        (t.specialRequirements && t.specialRequirements.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTransports(filtered);
  };

  const handleBidSubmit = async () => {
    try {
      if (!selectedTransport) return;

      if (isDemoMode) {
        // Demo mode - just close modal
        setShowBidModal(false);
        setSelectedTransport(null);
        // In a real app, you might want to show a success message
        return;
      }

      const response = await fetch(`/api/agency/transports/${selectedTransport.id}/bid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bidForm,
          transportRequestId: selectedTransport.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit bid');
      }

      setShowBidModal(false);
      setSelectedTransport(null);
      // Reload transports to reflect the bid
      await loadTransports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bid');
    }
  };

  const handleTransportSelect = (transport: TransportRequest) => {
    setSelectedTransport(transport);
    setBidForm({
      transportRequestId: transport.id,
      bidAmount: undefined,
      estimatedArrival: '',
      unitType: transport.transportLevel,
      specialCapabilities: null,
      notes: ''
    });
    setShowBidModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
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
          <h2 className="text-2xl font-bold text-gray-900">Available Transport Requests</h2>
          <p className="text-gray-600">Browse and bid on transport opportunities that match your capabilities</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredTransports.length} of {transports.length} requests available
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              placeholder="Patient ID, facility, requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Transport Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transport Level</label>
            <select
              value={filters.transportLevel}
              onChange={(e) => setFilters({...filters, transportLevel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Levels</option>
              <option value="BLS">BLS</option>
              <option value="ALS">ALS</option>
              <option value="CCT">CCT</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Max Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance (miles)</label>
            <input
              type="number"
              value={filters.maxDistance}
              onChange={(e) => setFilters({...filters, maxDistance: e.target.value})}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Origin City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin City</label>
            <input
              type="text"
              value={filters.originCity}
              onChange={(e) => setFilters({...filters, originCity: e.target.value})}
              placeholder="Filter by origin city..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Destination City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
            <input
              type="text"
              value={filters.destinationCity}
              onChange={(e) => setFilters({...filters, destinationCity: e.target.value})}
              placeholder="Filter by destination city..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Transport Requests List */}
      <div className="space-y-4">
        {filteredTransports.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-lg font-medium text-gray-900">No transport requests found</p>
            <p className="text-gray-600">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          filteredTransports.map(transport => (
            <div key={transport.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(transport.transportLevel)}`}>
                      {transport.transportLevel}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(transport.priority)}`}>
                      {transport.priority} Priority
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(transport.requestTimestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {transport.originFacility.name} → {transport.destinationFacility.name}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">From:</span> {transport.originFacility.address}</p>
                      <p><span className="font-medium">To:</span> {transport.destinationFacility.address}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Patient ID:</span>
                      <p className="text-gray-600">{transport.patientId}</p>
                    </div>
                    {transport.estimatedDistance && (
                      <div>
                        <span className="font-medium text-gray-700">Distance:</span>
                        <p className="text-gray-600">{transport.estimatedDistance} miles</p>
                      </div>
                    )}
                    {transport.estimatedDuration && (
                      <div>
                        <span className="font-medium text-gray-700">Est. Duration:</span>
                        <p className="text-gray-600">{transport.estimatedDuration} minutes</p>
                      </div>
                    )}
                  </div>

                  {/* Special Requirements */}
                  {transport.specialRequirements && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium text-yellow-800">Special Requirements:</span>
                        <span className="text-yellow-700 ml-2">{transport.specialRequirements}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="ml-6">
                  <button
                    onClick={() => handleTransportSelect(transport)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Submit Bid
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedTransport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Bid</h3>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Route:</span> {selectedTransport.originFacility.name} → {selectedTransport.destinationFacility.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Level:</span> {selectedTransport.transportLevel} • {selectedTransport.priority} Priority
                </p>
              </div>
              
              <form className="space-y-4">
                {/* Unit Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                  <select
                    value={bidForm.unitType}
                    onChange={(e) => setBidForm({...bidForm, unitType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BLS">BLS</option>
                    <option value="ALS">ALS</option>
                    <option value="CCT">CCT</option>
                  </select>
                </div>

                {/* Bid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount ($)</label>
                  <input
                    type="number"
                    value={bidForm.bidAmount || ''}
                    onChange={(e) => setBidForm({...bidForm, bidAmount: e.target.value ? parseFloat(e.target.value) : undefined})}
                    placeholder="Optional - leave blank for no bid amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Estimated Arrival */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Arrival</label>
                  <input
                    type="datetime-local"
                    value={bidForm.estimatedArrival}
                    onChange={(e) => setBidForm({...bidForm, estimatedArrival: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={bidForm.notes}
                    onChange={(e) => setBidForm({...bidForm, notes: e.target.value})}
                    placeholder="Any additional information about your bid..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBidSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Bid
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBidModal(false)}
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

export default TransportRequests;
