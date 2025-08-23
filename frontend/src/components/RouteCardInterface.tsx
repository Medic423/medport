import React, { useState } from 'react';
import { RouteOptimizationResult, ChainedTripOpportunity } from '../pages/RouteOptimization';

interface RouteCardInterfaceProps {
  optimizationResult: RouteOptimizationResult | null;
  selectedOpportunity: ChainedTripOpportunity | null;
  onSelectOpportunity: (opportunity: ChainedTripOpportunity | null) => void;
  onAcceptOpportunity: (opportunity: ChainedTripOpportunity) => void;
  onRejectOpportunity: (opportunity: ChainedTripOpportunity, reason: string) => void;
  onBack: () => void;
}

const RouteCardInterface: React.FC<RouteCardInterfaceProps> = ({
  optimizationResult,
  selectedOpportunity,
  onSelectOpportunity,
  onAcceptOpportunity,
  onRejectOpportunity,
  onBack
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [opportunityToReject, setOpportunityToReject] = useState<ChainedTripOpportunity | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');

  if (!optimizationResult) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Optimization Results</h3>
        <p className="text-gray-600 mb-4">Run an optimization to see chaining opportunities</p>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleReject = (opportunity: ChainedTripOpportunity) => {
    setOpportunityToReject(opportunity);
    setShowRejectionModal(true);
  };

  const confirmRejection = () => {
    if (opportunityToReject && rejectionReason.trim()) {
      onRejectOpportunity(opportunityToReject, rejectionReason);
      setShowRejectionModal(false);
      setRejectionReason('');
      setOpportunityToReject(null);
    }
  };

  const getFilteredAndSortedOpportunities = () => {
    let filtered = optimizationResult.opportunities;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(opp => opp.routeType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.optimizationScore - a.optimizationScore;
        case 'revenue':
          return b.revenueIncrease - a.revenueIncrease;
        case 'miles':
          return b.milesSaved - a.milesSaved;
        case 'time':
          return a.totalTime - b.totalTime;
        case 'distance':
          return a.totalDistance - b.totalDistance;
        default:
          return b.optimizationScore - a.optimizationScore;
      }
    });

    return filtered;
  };

  const getOptimizationTypeColor = (type: string) => {
    switch (type) {
      case 'TEMPORAL': return 'bg-blue-100 text-blue-800';
      case 'GEOGRAPHIC': return 'bg-green-100 text-green-800';
      case 'RETURN_TRIP': return 'bg-purple-100 text-purple-800';
      case 'MULTI_STOP': return 'bg-orange-100 text-orange-800';
      case 'CHAINED_TRIPS': return 'bg-indigo-100 text-indigo-800';
      case 'REVENUE_MAX': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredOpportunities = getFilteredAndSortedOpportunities();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Route Optimization Results</h2>
          <p className="text-gray-600">
            {filteredOpportunities.length} chaining opportunities found
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{optimizationResult.summary.totalOpportunities}</div>
          <div className="text-sm text-gray-600">Total Opportunities</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{optimizationResult.summary.totalMilesSaved.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Miles Saved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">${optimizationResult.summary.totalRevenueIncrease.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Revenue Increase</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{optimizationResult.summary.averageOptimizationScore.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="TEMPORAL">Temporal</option>
              <option value="GEOGRAPHIC">Geographic</option>
              <option value="RETURN_TRIP">Return Trip</option>
              <option value="MULTI_STOP">Multi-Stop</option>
              <option value="CHAINED_TRIPS">Chained Trips</option>
              <option value="REVENUE_MAX">Revenue Max</option>
            </select>
          </div>
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="score">Optimization Score</option>
              <option value="revenue">Revenue Increase</option>
              <option value="miles">Miles Saved</option>
              <option value="time">Total Time</option>
              <option value="distance">Total Distance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className={`bg-white rounded-lg shadow-lg border-2 transition-all cursor-pointer ${
              selectedOpportunity?.id === opportunity.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectOpportunity(opportunity)}
          >
            {/* Card Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOptimizationTypeColor(opportunity.routeType)}`}>
                    {opportunity.routeType.replace('_', ' ')}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">
                    Chaining Opportunity
                  </h3>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(opportunity.optimizationScore)}`}>
                    {opportunity.optimizationScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {opportunity.chainingDetails.description}
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {opportunity.milesSaved.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Miles Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">
                    ${opportunity.revenueIncrease.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">Revenue Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {opportunity.totalDistance.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Total Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {formatTime(opportunity.totalTime)}
                  </div>
                  <div className="text-xs text-gray-500">Total Time</div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Benefits */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Benefits</h4>
                <ul className="space-y-1">
                  {opportunity.chainingDetails.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Efficiency Scores */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Geographic</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {opportunity.geographicEfficiency.toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Temporal</div>
                  <div className="text-lg font-semibold text-green-600">
                    {opportunity.temporalEfficiency.toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Flexibility</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {opportunity.timeWindowFlexibility.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcceptOpportunity(opportunity);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Accept
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(opportunity);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Opportunities Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or running a new optimization
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Chaining Opportunity
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this opportunity. This helps improve our optimization algorithms.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteCardInterface;
