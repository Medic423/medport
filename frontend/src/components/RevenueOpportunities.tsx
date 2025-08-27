import React, { useState, useEffect } from 'react';

interface RevenueOpportunity {
  id: string;
  type: 'ROUTE_OPTIMIZATION' | 'CHAINED_TRIPS' | 'CAPACITY_UTILIZATION' | 'EMPTY_MILES_REDUCTION';
  title: string;
  description: string;
  currentRevenue: number;
  potentialRevenue: number;
  revenueIncrease: number;
  costSavings: number;
  roi: number;
  implementationDifficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedTimeToImplement: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'REJECTED';
  createdAt: string;
  details: {
    routes?: string[];
    facilities?: string[];
    estimatedMilesSaved?: number;
    estimatedTimeSaved?: number;
  };
}

const RevenueOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'ALL',
    status: 'ALL',
    minROI: '',
    maxDifficulty: 'ALL'
  });

  useEffect(() => {
    loadRevenueOpportunities();
  }, [filters]);

  const loadRevenueOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/agency/revenue-opportunities?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      } else {
        throw new Error('Failed to load revenue opportunities');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load revenue opportunities';
      console.error('[MedPort:RevenueOpportunities] Error loading opportunities:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImplementOpportunity = async (opportunityId: string) => {
    try {
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      const response = await fetch(`/api/agency/revenue-opportunities/${opportunityId}/implement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Opportunity implementation started successfully!');
        loadRevenueOpportunities(); // Refresh the list
      } else {
        throw new Error('Failed to implement opportunity');
      }
    } catch (error) {
      console.error('[MedPort:RevenueOpportunities] Error implementing opportunity:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to implement opportunity'}`);
    }
  };

  const handleRejectOpportunity = async (opportunityId: string, reason: string) => {
    try {
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      const response = await fetch(`/api/agency/revenue-opportunities/${opportunityId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('Opportunity rejected successfully!');
        loadRevenueOpportunities(); // Refresh the list
      } else {
        throw new Error('Failed to reject opportunity');
      }
    } catch (error) {
      console.error('[MedPort:RevenueOpportunities] Error rejecting opportunity:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to reject opportunity'}`);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ROUTE_OPTIMIZATION': return 'bg-blue-100 text-blue-800';
      case 'CHAINED_TRIPS': return 'bg-green-100 text-green-800';
      case 'CAPACITY_UTILIZATION': return 'bg-purple-100 text-purple-800';
      case 'EMPTY_MILES_REDUCTION': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'IMPLEMENTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ROUTE_OPTIMIZATION': return '🗺️';
      case 'CHAINED_TRIPS': return '🔗';
      case 'CAPACITY_UTILIZATION': return '📊';
      case 'EMPTY_MILES_REDUCTION': return '⛽';
      default: return '💰';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading revenue opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Revenue Opportunities</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={loadRevenueOpportunities}
                  className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Revenue Opportunities</h1>
          <p className="mt-2 text-gray-600">
            Discover and implement revenue optimization opportunities for your agency
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Potential</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${opportunities.reduce((sum, opp) => sum + opp.revenueIncrease, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg ROI</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.length > 0 
                    ? Math.round(opportunities.reduce((sum, opp) => sum + opp.roi, 0) / opportunities.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.filter(opp => opp.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.filter(opp => opp.status === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="ROUTE_OPTIMIZATION">Route Optimization</option>
                <option value="CHAINED_TRIPS">Chained Trips</option>
                <option value="CAPACITY_UTILIZATION">Capacity Utilization</option>
                <option value="EMPTY_MILES_REDUCTION">Empty Miles Reduction</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IMPLEMENTED">Implemented</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min ROI (%)</label>
              <input
                type="number"
                value={filters.minROI}
                onChange={(e) => setFilters(prev => ({ ...prev, minROI: e.target.value }))}
                placeholder="No minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Difficulty</label>
              <select
                value={filters.maxDifficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDifficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Difficulties</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Opportunities */}
        <div className="space-y-6">
          {opportunities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No revenue opportunities match your current filters</p>
            </div>
          ) : (
            opportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-2xl">{getTypeIcon(opportunity.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
                        {opportunity.type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                        {opportunity.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{opportunity.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Current Revenue</p>
                        <p className="text-lg font-semibold text-gray-900">${opportunity.currentRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Potential Revenue</p>
                        <p className="text-lg font-semibold text-green-600">${opportunity.potentialRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Revenue Increase</p>
                        <p className="text-lg font-semibold text-blue-600">${opportunity.revenueIncrease.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">ROI</p>
                        <p className="text-lg font-semibold text-purple-600">{opportunity.roi.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Cost Savings</p>
                        <p className="text-lg font-semibold text-green-600">${opportunity.costSavings.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Implementation</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(opportunity.implementationDifficulty)}`}>
                          {opportunity.implementationDifficulty}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Time to Implement</p>
                        <p className="text-lg font-semibold text-gray-900">{opportunity.estimatedTimeToImplement}</p>
                      </div>
                    </div>
                    
                    {opportunity.details.routes && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Affected Routes</h4>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.details.routes.map((route, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {route}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {opportunity.details.facilities && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.details.facilities.map((facility, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Created: {new Date(opportunity.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {opportunity.status === 'PENDING' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleImplementOpportunity(opportunity.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Implement Opportunity
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          handleRejectOpportunity(opportunity.id, reason);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Reject Opportunity
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueOpportunities;
