import React, { useState, useEffect } from 'react';
import { RouteOptimizationRequest, RouteOptimizationResult } from '../pages/RouteOptimization';

interface RouteOptimizationDashboardProps {
  optimizationRequest: RouteOptimizationRequest;
  optimizationResult: RouteOptimizationResult | null;
  isOptimizing: boolean;
  onQuickOptimize: (transportRequestIds: string[]) => void;
  onStartOptimization: () => void;
}

const RouteOptimizationDashboard: React.FC<RouteOptimizationDashboardProps> = ({
  optimizationRequest,
  optimizationResult,
  isOptimizing,
  onQuickOptimize,
  onStartOptimization
}) => {
  const [recentTransportRequests, setRecentTransportRequests] = useState<any[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  useEffect(() => {
    // Fetch recent transport requests for quick optimization
    fetchRecentTransportRequests();
  }, []);

  const fetchRecentTransportRequests = async () => {
    try {
      const response = await fetch('/api/transport-requests?status=PENDING&limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRecentTransportRequests(result.data?.requests || []);
      }
    } catch (error) {
      console.error('Error fetching recent transport requests:', error);
    }
  };

  const handleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleQuickOptimize = () => {
    if (selectedRequests.length === 0) {
      alert('Please select at least one transport request for quick optimization.');
      return;
    }
    onQuickOptimize(selectedRequests);
  };

  const formatTimeWindow = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString() + ' ' + start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endStr = end.toLocaleDateString() + ' ' + end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  const getOptimizationTypeCount = (type: string) => {
    if (!optimizationResult) return 0;
    return optimizationResult.summary.optimizationTypes[type] || 0;
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Opportunities</p>
              <p className="text-2xl font-semibold text-gray-900">
                {optimizationResult?.summary.totalOpportunities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Miles Saved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {optimizationResult?.summary.totalMilesSaved.toFixed(1) || '0.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue Increase</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${optimizationResult?.summary.totalRevenueIncrease.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {optimizationResult?.summary.averageOptimizationScore.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <p className="mt-1 text-sm text-gray-600">
            Start optimization or perform quick analysis on selected transport requests
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onStartOptimization}
              disabled={isOptimizing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Full Optimization
            </button>

            <button
              onClick={handleQuickOptimize}
              disabled={isOptimizing || selectedRequests.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Optimize ({selectedRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Current Optimization Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Optimization Settings</h3>
          <p className="mt-1 text-sm text-gray-600">
            Review and modify optimization parameters
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Time Window</h4>
              <p className="text-sm text-gray-900">
                {formatTimeWindow(optimizationRequest.timeWindowStart, optimizationRequest.timeWindowEnd)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Transport Levels</h4>
              <p className="text-sm text-gray-900">
                {optimizationRequest.transportLevels?.join(', ') || 'All'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Priorities</h4>
              <p className="text-sm text-gray-900">
                {optimizationRequest.priorities?.join(', ') || 'All'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Constraints</h4>
              <p className="text-sm text-gray-900">
                Max Duration: {optimizationRequest.constraints?.maxDuration || 'Unlimited'} min
                <br />
                Max Stops: {optimizationRequest.constraints?.maxStops || 'Unlimited'}
                <br />
                Min Revenue: ${optimizationRequest.constraints?.minRevenue || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transport Requests for Quick Optimization */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transport Requests</h3>
          <p className="mt-1 text-sm text-gray-600">
            Select requests for quick optimization analysis
          </p>
        </div>
        <div className="p-6">
          {recentTransportRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent transport requests found</p>
          ) : (
            <div className="space-y-3">
              {recentTransportRequests.map((request) => (
                <div
                  key={request.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRequests.includes(request.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRequestSelection(request.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleRequestSelection(request.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Patient {request.patientId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.originFacility?.name} → {request.destinationFacility?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      request.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      request.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.transportLevel === 'CCT' ? 'bg-purple-100 text-purple-800' :
                      request.transportLevel === 'ALS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.transportLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Optimization Results Summary */}
      {optimizationResult && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Latest Optimization Results</h3>
            <p className="mt-1 text-sm text-gray-600">
              Summary of the most recent optimization run
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Optimization Types</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Temporal</span>
                    <span className="text-sm font-medium text-gray-900">{getOptimizationTypeCount('TEMPORAL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Geographic</span>
                    <span className="text-sm font-medium text-gray-900">{getOptimizationTypeCount('GEOGRAPHIC')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Return Trips</span>
                    <span className="text-sm font-medium text-gray-900">{getOptimizationTypeCount('RETURN_TRIP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Multi-Stop</span>
                    <span className="text-sm font-medium text-gray-900">{getOptimizationTypeCount('MULTI_STOP')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Calculation Time</span>
                    <span className="text-sm font-medium text-gray-900">{optimizationResult.performance.calculationTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Requests Analyzed</span>
                    <span className="text-sm font-medium text-gray-900">{optimizationResult.performance.requestsAnalyzed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Routes Generated</span>
                    <span className="text-sm font-medium text-gray-900">{optimizationResult.performance.routesGenerated}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Recommendations</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">High Value</span>
                    <span className="text-sm font-medium text-gray-900">{optimizationResult.recommendations.highValue.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quick Wins</span>
                    <span className="text-sm font-medium text-gray-900">{optimizationResult.recommendations.quickWins.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Long Term</span>
                    <span className="text-sm font-medium text-gray-900">{optimizationResult.recommendations.longTerm.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteOptimizationDashboard;
