import React from 'react';
import { TransportRequestWithDetails, RequestStatus, Priority, TransportLevel } from '../types/transport';

interface StatusStatsProps {
  transportRequests: TransportRequestWithDetails[];
}

const StatusStats: React.FC<StatusStatsProps> = ({ transportRequests }) => {
  // Calculate statistics
  const totalRequests = transportRequests.length;
  const pendingRequests = transportRequests.filter(req => req.status === 'PENDING').length;
  const scheduledRequests = transportRequests.filter(req => req.status === 'SCHEDULED').length;
  const inTransitRequests = transportRequests.filter(req => req.status === 'IN_TRANSIT').length;
  const completedRequests = transportRequests.filter(req => req.status === 'COMPLETED').length;
  const cancelledRequests = transportRequests.filter(req => req.status === 'CANCELLED').length;

  const urgentRequests = transportRequests.filter(req => req.priority === 'URGENT').length;
  const highPriorityRequests = transportRequests.filter(req => req.priority === 'HIGH').length;
  const mediumPriorityRequests = transportRequests.filter(req => req.priority === 'MEDIUM').length;
  const lowPriorityRequests = transportRequests.filter(req => req.priority === 'LOW').length;

  const blsRequests = transportRequests.filter(req => req.transportLevel === 'BLS').length;
  const alsRequests = transportRequests.filter(req => req.transportLevel === 'ALS').length;
  const cctRequests = transportRequests.filter(req => req.transportLevel === 'CCT').length;

  // Calculate completion rate
  const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;
  
  // Calculate average response time (for completed requests)
  const completedWithTimestamps = transportRequests.filter(req => 
    req.status === 'COMPLETED' && req.pickupTimestamp && req.completionTimestamp
  );
  
  const averageResponseTime = completedWithTimestamps.length > 0 
    ? Math.round(
        completedWithTimestamps.reduce((total, req) => {
          const pickup = new Date(req.pickupTimestamp!);
          const completion = new Date(req.completionTimestamp!);
          return total + (completion.getTime() - pickup.getTime());
        }, 0) / completedWithTimestamps.length / (1000 * 60) // Convert to minutes
      )
    : 0;

  // Get status color
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'SCHEDULED': return 'bg-blue-500';
      case 'IN_TRANSIT': return 'bg-purple-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get transport level color
  const getTransportLevelColor = (level: TransportLevel) => {
    switch (level) {
      case 'BLS': return 'bg-blue-500';
      case 'ALS': return 'bg-purple-500';
      case 'CCT': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{totalRequests}</p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>

        {/* Average Response Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Response</p>
              <p className="text-2xl font-semibold text-gray-900">{averageResponseTime}m</p>
            </div>
          </div>
        </div>

        {/* Urgent Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Urgent</p>
              <p className="text-2xl font-semibold text-gray-900">{urgentRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
        <div className="space-y-3">
          {[
            { status: 'PENDING', count: pendingRequests, color: getStatusColor('PENDING') },
            { status: 'SCHEDULED', count: scheduledRequests, color: getStatusColor('SCHEDULED') },
            { status: 'IN_TRANSIT', count: inTransitRequests, color: getStatusColor('IN_TRANSIT') },
            { status: 'COMPLETED', count: completedRequests, color: getStatusColor('COMPLETED') },
            { status: 'CANCELLED', count: cancelledRequests, color: getStatusColor('CANCELLED') }
          ].map(({ status, count, color }) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${color} mr-3`}></div>
                <span className="text-sm text-gray-600">{status.replace('_', ' ')}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Breakdown</h3>
        <div className="space-y-3">
          {[
            { priority: 'URGENT', count: urgentRequests, color: getPriorityColor('URGENT') },
            { priority: 'HIGH', count: highPriorityRequests, color: getPriorityColor('HIGH') },
            { priority: 'MEDIUM', count: mediumPriorityRequests, color: getPriorityColor('MEDIUM') },
            { priority: 'LOW', count: lowPriorityRequests, color: getPriorityColor('LOW') }
          ].map(({ priority, count, color }) => (
            <div key={priority} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${color} mr-3`}></div>
                <span className="text-sm text-gray-600">{priority}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transport Level Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Level</h3>
        <div className="space-y-3">
          {[
            { level: 'BLS', count: blsRequests, color: getTransportLevelColor('BLS') },
            { level: 'ALS', count: alsRequests, color: getTransportLevelColor('ALS') },
            { level: 'CCT', count: cctRequests, color: getTransportLevelColor('CCT') }
          ].map(({ level, count, color }) => (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${color} mr-3`}></div>
                <span className="text-sm text-gray-600">{level}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default StatusStats;
