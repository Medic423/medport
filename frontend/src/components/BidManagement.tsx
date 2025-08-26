import React, { useState, useEffect } from 'react';

interface TransportBid {
  id: string;
  transportRequest: {
    id: string;
    patientId: string;
    originFacility: {
      name: string;
      city: string;
      state: string;
    };
    destinationFacility: {
      name: string;
      city: string;
      state: string;
    };
    transportLevel: 'BLS' | 'ALS' | 'CCT';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: string;
    requestTimestamp: string;
    estimatedDistance?: number;
  };
  bidAmount?: number;
  estimatedArrival?: string;
  unitType: 'BLS' | 'ALS' | 'CCT';
  specialCapabilities?: any;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN';
  submittedAt: string;
  responseTime?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface BidStats {
  totalBids: number;
  acceptedBids: number;
  rejectedBids: number;
  pendingBids: number;
  acceptanceRate: number;
  averageResponseTime: number;
  totalRevenue: number;
  averageBidAmount: number;
}

const BidManagement: React.FC = () => {
  const [bids, setBids] = useState<TransportBid[]>([]);
  const [filteredBids, setFilteredBids] = useState<TransportBid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<BidStats | null>(null);
  const [selectedBid, setSelectedBid] = useState<TransportBid | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    status: 'ALL',
    transportLevel: 'ALL',
    dateRange: 'ALL',
    searchTerm: ''
  });

  const agency = JSON.parse(localStorage.getItem('agency') || '{}');
  const agencyToken = localStorage.getItem('agencyToken');
  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
    } else {
      loadBids();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bids, filters]);

  const loadDemoData = () => {
    // Demo data for testing
    const demoBids: TransportBid[] = [
      {
        id: '1',
        transportRequest: {
          id: '1',
          patientId: 'P-001',
          originFacility: {
            name: 'UPMC Altoona',
            city: 'Altoona',
            state: 'PA'
          },
          destinationFacility: {
            name: 'Penn State Health',
            city: 'Hershey',
            state: 'PA'
          },
          transportLevel: 'CCT',
          priority: 'HIGH',
          status: 'PENDING',
          requestTimestamp: '2025-08-23T10:30:00Z',
          estimatedDistance: 85
        },
        bidAmount: 450,
        estimatedArrival: '2025-08-23T11:30:00Z',
        unitType: 'CCT',
        specialCapabilities: { ventilator: true, cardiacMonitoring: true },
        notes: 'CCT unit available with full critical care support',
        status: 'ACCEPTED',
        submittedAt: '2025-08-23T10:35:00Z',
        responseTime: '15 minutes',
        acceptedAt: '2025-08-23T10:50:00Z'
      },
      {
        id: '2',
        transportRequest: {
          id: '2',
          patientId: 'P-002',
          originFacility: {
            name: 'Mount Nittany Medical Center',
            city: 'State College',
            state: 'PA'
          },
          destinationFacility: {
            name: 'UPMC Altoona',
            city: 'Altoona',
            state: 'PA'
          },
          transportLevel: 'ALS',
          priority: 'MEDIUM',
          status: 'PENDING',
          requestTimestamp: '2025-08-23T09:15:00Z',
          estimatedDistance: 45
        },
        bidAmount: 275,
        estimatedArrival: '2025-08-23T10:00:00Z',
        unitType: 'ALS',
        specialCapabilities: { cardiacMonitoring: true, ivTherapy: true },
        notes: 'ALS unit with cardiac monitoring capabilities',
        status: 'PENDING',
        submittedAt: '2025-08-23T09:20:00Z'
      },
      {
        id: '3',
        transportRequest: {
          id: '3',
          patientId: 'P-003',
          originFacility: {
            name: 'Conemaugh Memorial Medical Center',
            city: 'Johnstown',
            state: 'PA'
          },
          destinationFacility: {
            name: 'UPMC Presbyterian',
            city: 'Pittsburgh',
            state: 'PA'
          },
          transportLevel: 'CCT',
          priority: 'URGENT',
          status: 'PENDING',
          requestTimestamp: '2025-08-23T11:00:00Z',
          estimatedDistance: 120
        },
        bidAmount: 600,
        estimatedArrival: '2025-08-23T12:30:00Z',
        unitType: 'CCT',
        specialCapabilities: { ecmo: true, ventilator: true },
        notes: 'CCT unit with ECMO support available',
        status: 'REJECTED',
        submittedAt: '2025-08-23T11:05:00Z',
        responseTime: '20 minutes',
        rejectedAt: '2025-08-23T11:25:00Z',
        rejectionReason: 'Another agency accepted with faster response time'
      },
      {
        id: '4',
        transportRequest: {
          id: '4',
          patientId: 'P-004',
          originFacility: {
            name: 'Geisinger Medical Center',
            city: 'Danville',
            state: 'PA'
          },
          destinationFacility: {
            name: 'Temple University Hospital',
            city: 'Philadelphia',
            state: 'PA'
          },
          transportLevel: 'BLS',
          priority: 'LOW',
          status: 'PENDING',
          requestTimestamp: '2025-08-23T08:45:00Z',
          estimatedDistance: 180
        },
        bidAmount: 200,
        estimatedArrival: '2025-08-23T10:30:00Z',
        unitType: 'BLS',
        specialCapabilities: {},
        notes: 'Basic transport service',
        status: 'EXPIRED',
        submittedAt: '2025-08-23T08:50:00Z'
      },
      {
        id: '5',
        transportRequest: {
          id: '5',
          patientId: 'P-005',
          originFacility: {
            name: 'Reading Hospital',
            city: 'Reading',
            state: 'PA'
          },
          destinationFacility: {
            name: 'Lehigh Valley Hospital',
            city: 'Allentown',
            state: 'PA'
          },
          transportLevel: 'ALS',
          priority: 'MEDIUM',
          status: 'PENDING',
          requestTimestamp: '2025-08-23T10:00:00Z',
          estimatedDistance: 35
        },
        bidAmount: 300,
        estimatedArrival: '2025-08-23T10:45:00Z',
        unitType: 'ALS',
        specialCapabilities: { cardiacMonitoring: true },
        notes: 'ALS unit with cardiac monitoring',
        status: 'WITHDRAWN',
        submittedAt: '2025-08-23T10:05:00Z'
      }
    ];

    setBids(demoBids);
    
    // Calculate demo stats
    const totalBids = demoBids.length;
    const acceptedBids = demoBids.filter(b => b.status === 'ACCEPTED').length;
    const rejectedBids = demoBids.filter(b => b.status === 'REJECTED').length;
    const pendingBids = demoBids.filter(b => b.status === 'PENDING').length;
    const totalRevenue = demoBids
      .filter(b => b.status === 'ACCEPTED' && b.bidAmount)
      .reduce((sum, b) => sum + (b.bidAmount || 0), 0);
    const averageBidAmount = demoBids
      .filter(b => b.bidAmount)
      .reduce((sum, b) => sum + (b.bidAmount || 0), 0) / demoBids.filter(b => b.bidAmount).length;

    setStats({
      totalBids,
      acceptedBids,
      rejectedBids,
      pendingBids,
      acceptanceRate: (acceptedBids / totalBids) * 100,
      averageResponseTime: 17.5, // Demo average
      totalRevenue,
      averageBidAmount
    });
    
    setIsLoading(false);
  };

  const loadBids = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agency/bids', {
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load bids');
      }

      const data = await response.json();
      setBids(data.bids || []);
      
      // Load stats
      const statsResponse = await fetch('/api/agency/stats', {
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bids');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bids];

    // Status Filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    // Transport Level Filter
    if (filters.transportLevel !== 'ALL') {
      filtered = filtered.filter(b => b.transportRequest.transportLevel === filters.transportLevel);
    }

    // Date Range Filter
    if (filters.dateRange !== 'ALL') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'TODAY':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'WEEK':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'MONTH':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(b => new Date(b.submittedAt) >= cutoffDate);
    }

    // Search Term Filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.transportRequest.patientId.toLowerCase().includes(searchLower) ||
        b.transportRequest.originFacility.name.toLowerCase().includes(searchLower) ||
        b.transportRequest.destinationFacility.name.toLowerCase().includes(searchLower) ||
        (b.notes && b.notes.toLowerCase().includes(searchLower))
      );
    }

    setFilteredBids(filtered);
  };

  const handleWithdrawBid = async () => {
    try {
      if (!selectedBid) return;

      if (isDemoMode) {
        // Update demo data
        setBids(prevBids => prevBids.map(bid => 
          bid.id === selectedBid.id 
            ? { ...bid, status: 'WITHDRAWN' as const }
            : bid
        ));
        setShowWithdrawModal(false);
        setSelectedBid(null);
        setWithdrawReason('');
        // Reload demo stats
        loadDemoData();
        return;
      }

      const response = await fetch(`/api/agency/bids/${selectedBid.id}/withdraw`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${agencyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: withdrawReason })
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw bid');
      }

      await loadBids();
      setShowWithdrawModal(false);
      setSelectedBid(null);
      setWithdrawReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw bid');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      case 'WITHDRAWN': return 'bg-orange-100 text-orange-800';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
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
          <h2 className="text-2xl font-bold text-gray-900">Bid Management</h2>
          <p className="text-gray-600">Track your bid history, performance, and manage active bids</p>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bids</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBids}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Acceptance Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.acceptanceRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageResponseTime.toFixed(1)}m</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>

          {/* Transport Level Filter */}
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

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>

          {/* Search Term Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              placeholder="Patient ID, facility, notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-lg font-medium text-gray-900">No bids found</p>
            <p className="text-gray-600">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          filteredBids.map(bid => (
            <div key={bid.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(bid.transportRequest.transportLevel)}`}>
                      {bid.transportRequest.transportLevel}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(bid.transportRequest.priority)}`}>
                      {bid.transportRequest.priority} Priority
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bid.status)}`}>
                      {bid.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Submitted: {new Date(bid.submittedAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {bid.transportRequest.originFacility.name} → {bid.transportRequest.destinationFacility.name}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p>Patient ID: {bid.transportRequest.patientId}</p>
                      {bid.transportRequest.estimatedDistance && (
                        <p>Distance: {bid.transportRequest.estimatedDistance} miles</p>
                      )}
                    </div>
                  </div>

                  {/* Bid Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Bid Amount:</span>
                      <p className="text-gray-600">{bid.bidAmount ? `$${bid.bidAmount}` : 'No bid amount'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Unit Type:</span>
                      <p className="text-gray-600">{bid.unitType}</p>
                    </div>
                    {bid.estimatedArrival && (
                      <div>
                        <span className="font-medium text-gray-700">Est. Arrival:</span>
                        <p className="text-gray-600">{new Date(bid.estimatedArrival).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {bid.notes && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium text-blue-800">Notes:</span>
                        <span className="text-blue-700 ml-2">{bid.notes}</span>
                      </p>
                    </div>
                  )}

                  {/* Response Information */}
                  {bid.status === 'ACCEPTED' && bid.acceptedAt && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Accepted at:</span> {new Date(bid.acceptedAt).toLocaleString()}
                        {bid.responseTime && (
                          <span className="ml-4">
                            <span className="font-medium">Response time:</span> {bid.responseTime}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {bid.status === 'REJECTED' && bid.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Rejection reason:</span> {bid.rejectionReason}
                        {bid.rejectedAt && (
                          <span className="ml-4">
                            <span className="font-medium">Rejected at:</span> {new Date(bid.rejectedAt).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="ml-6 flex flex-col space-y-2">
                  {bid.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setSelectedBid(bid);
                        setShowWithdrawModal(true);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Withdraw Bid
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedBid && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Withdraw Bid</h3>
              
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Route:</span> {selectedBid.transportRequest.originFacility.name} → {selectedBid.transportRequest.destinationFacility.name}
                </p>
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Bid Amount:</span> {selectedBid.bidAmount ? `$${selectedBid.bidAmount}` : 'No bid amount'}
                </p>
              </div>
              
              <form className="space-y-4">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Withdrawal</label>
                  <textarea
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    placeholder="Please provide a reason for withdrawing this bid..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleWithdrawBid}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Withdraw Bid
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
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

export default BidManagement;
