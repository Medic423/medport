import React, { useState, useEffect } from 'react';
import { 
  ResourceDashboardData, 
  ResourceAvailability, 
  PriorityQueueItem, 
  EscalationRequest,
  ResourceAllocation,
  CallVolumeAnalytics,
  CapacityPlanning,
  UnitStatusUpdate
} from '../types/resource';
import { UnitStatus, Priority, TransportLevel } from '../types/transport';

interface ResourceDashboardProps {
  isDemoMode?: boolean;
}

const ResourceDashboard: React.FC<ResourceDashboardProps> = ({ isDemoMode = false }) => {
  const [dashboardData, setDashboardData] = useState<ResourceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cct-units' | 'escalations' | 'analytics' | 'planning'>('overview');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDemoMode) {
        // Demo mode - use mock data
        const mockData: ResourceDashboardData = {
          availability: {
            cctUnits: {
              total: 8,
              available: 3,
              inUse: 4,
              outOfService: 0,
              maintenance: 1
            },
            crewMembers: {
              total: 16,
              available: 6,
              inUse: 8,
              offDuty: 2
            },
            equipment: {
              total: 16,
              available: 6,
              inUse: 8,
              maintenance: 2
            },
            lastUpdated: new Date().toISOString()
          },
          priorityQueue: [
            {
              id: 'queue-1',
              transportRequestId: 'req-1',
              priority: Priority.URGENT,
              escalationLevel: 'CRITICAL',
              waitTime: 45,
              estimatedResponseTime: 15,
              facilityUrgency: 'CRITICAL',
              patientCondition: 'EMERGENCY',
              queuePosition: 1,
              addedToQueue: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString()
            },
            {
              id: 'queue-2',
              transportRequestId: 'req-2',
              priority: Priority.HIGH,
              escalationLevel: 'LEVEL_2',
              waitTime: 30,
              estimatedResponseTime: 25,
              facilityUrgency: 'HIGH',
              patientCondition: 'CRITICAL',
              queuePosition: 2,
              addedToQueue: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString()
            }
          ],
          recentEscalations: [
            {
              id: 'esc-1',
              transportRequestId: 'req-1',
              escalationLevel: 'CRITICAL',
              reason: 'Patient deteriorating, need immediate CCT transport',
              requestedBy: 'Dr. Smith',
              requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              status: 'PENDING',
              autoEscalation: true,
              escalationChain: ['Dr. Smith', 'ICU Charge Nurse']
            }
          ],
          activeAllocations: [
            {
              id: 'alloc-1',
              transportRequestId: 'req-1',
              cctUnitId: 'unit-1',
              crewMembers: ['crew-1', 'crew-2'],
              equipment: ['equip-1', 'equip-2'],
              allocationTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              estimatedDeparture: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
              estimatedArrival: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
              status: 'CONFIRMED',
              notes: 'CCT unit dispatched for critical patient',
              createdBy: 'EMS Coordinator',
              lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            }
          ],
          callVolume: {
            period: 'DAILY',
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date().toISOString(),
            totalCalls: 47,
            byPriority: {
              [Priority.LOW]: 8,
              [Priority.MEDIUM]: 22,
              [Priority.HIGH]: 12,
              [Priority.URGENT]: 5
            },
            byTransportLevel: {
              [TransportLevel.BLS]: 25,
              [TransportLevel.ALS]: 15,
              [TransportLevel.CCT]: 7
            },
            byFacility: {
              'UPMC Altoona': 18,
              'Penn Highlands': 12,
              'Mount Nittany': 8,
              'Other': 9
            },
            averageResponseTime: 18.5,
            peakHours: [
              { hour: 8, callCount: 6 },
              { hour: 12, callCount: 8 },
              { hour: 16, callCount: 7 },
              { hour: 20, callCount: 5 }
            ],
            capacityUtilization: 78.5,
            escalationRate: 12.8
          },
          capacityPlanning: [
            {
              id: 'cap-1',
              facilityId: 'facility-1',
              facilityName: 'UPMC Altoona',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '08:00-16:00',
              projectedDemand: 12,
              availableResources: 8,
              capacityGap: 4,
              recommendations: [
                'Activate backup CCT unit',
                'Coordinate with neighboring facilities',
                'Consider air medical options'
              ],
              riskLevel: 'HIGH',
              lastUpdated: new Date().toISOString()
            }
          ],
          unitStatusUpdates: [
            {
              id: 'status-1',
              unitId: 'unit-1',
              unitNumber: 'CCT-001',
              previousStatus: UnitStatus.AVAILABLE,
              newStatus: UnitStatus.IN_USE,
              reason: 'Assigned to urgent transport',
              updatedBy: 'EMS Coordinator',
              updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              estimatedReturnTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              notes: 'Critical patient transport to UPMC Altoona'
            }
          ],
          lastRefresh: new Date().toISOString()
        };
        
        setDashboardData(mockData);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/resource-management/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setDashboardData(result.data);
      setLoading(false);
    } catch (err) {
      console.error('[RESOURCE_DASHBOARD] Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isDemoMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-100';
      case 'IN_USE': return 'text-blue-600 bg-blue-100';
      case 'OUT_OF_SERVICE': return 'text-red-600 bg-red-100';
      case 'MAINTENANCE': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT: return 'text-red-600 bg-red-100';
      case Priority.HIGH: return 'text-orange-600 bg-orange-100';
      case Priority.MEDIUM: return 'text-yellow-600 bg-yellow-100';
      case Priority.LOW: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchDashboardData}
                    className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">No Dashboard Data Available</h2>
            <p className="mt-2 text-gray-600">Unable to load resource management dashboard data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resource Management Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time monitoring of CCT units, crew availability, and resource allocation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date(dashboardData.lastRefresh).toLocaleTimeString()}
              </div>
              <button
                onClick={fetchDashboardData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', count: null },
              { id: 'cct-units', name: 'CCT Units', count: dashboardData.availability.cctUnits.total },
              { id: 'escalations', name: 'Escalations', count: dashboardData.recentEscalations.length },
              { id: 'analytics', name: 'Analytics', count: null },
              { id: 'planning', name: 'Capacity Planning', count: dashboardData.capacityPlanning.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Resource Availability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">CCT Units</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboardData.availability.cctUnits.available} / {dashboardData.availability.cctUnits.total} Available
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-gray-500">In Use: {dashboardData.availability.cctUnits.inUse}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-500">Maintenance: {dashboardData.availability.cctUnits.maintenance}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Crew Members</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboardData.availability.crewMembers.available} / {dashboardData.availability.crewMembers.total} Available
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-gray-500">In Use: {dashboardData.availability.crewMembers.inUse}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-500">Off Duty: {dashboardData.availability.crewMembers.offDuty}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Equipment</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboardData.availability.equipment.available} / {dashboardData.availability.equipment.total} Available
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-gray-500">In Use: {dashboardData.availability.equipment.inUse}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-500">Maintenance: {dashboardData.availability.equipment.maintenance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Queue and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Queue */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Priority Queue</h3>
                  <div className="space-y-3">
                    {dashboardData.priorityQueue.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              #{item.queuePosition}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              Wait: {item.waitTime}m
                            </div>
                            <div className="text-sm text-gray-500">
                              ETA: {item.estimatedResponseTime}m
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div>Urgency: {item.facilityUrgency}</div>
                          <div>Condition: {item.patientCondition}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {dashboardData.unitStatusUpdates.map((update) => (
                      <div key={update.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(update.newStatus)}`}>
                              {update.newStatus}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {update.unitNumber}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(update.updatedAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div>{update.reason}</div>
                          {update.notes && <div className="text-gray-500">{update.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CCT Units Tab */}
        {activeTab === 'cct-units' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">CCT Unit Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(dashboardData.availability.cctUnits).map(([status, count]) => (
                  <div key={status} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 capitalize">
                        {status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Escalations Tab */}
        {activeTab === 'escalations' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Active Escalations</h3>
              <div className="space-y-4">
                {dashboardData.recentEscalations.map((escalation) => (
                  <div key={escalation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          escalation.escalationLevel === 'CRITICAL' ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'
                        }`}>
                          {escalation.escalationLevel}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {escalation.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(escalation.requestedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-900">{escalation.reason}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Requested by: {escalation.requestedBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Call Volume Summary */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Call Volume Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData.callVolume.totalCalls}</div>
                    <div className="text-sm text-gray-500">Total Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.callVolume.averageResponseTime}m</div>
                    <div className="text-sm text-gray-500">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{dashboardData.callVolume.capacityUtilization}%</div>
                    <div className="text-sm text-gray-500">Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{dashboardData.callVolume.escalationRate}%</div>
                    <div className="text-sm text-gray-500">Escalation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Peak Hours</h3>
                <div className="space-y-2">
                  {dashboardData.callVolume.peakHours.map((peak) => (
                    <div key={peak.hour} className="flex items-center">
                      <div className="w-16 text-sm text-gray-500">
                        {peak.hour}:00
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full" 
                          style={{ width: `${(peak.callCount / Math.max(...dashboardData.callVolume.peakHours.map(p => p.callCount))) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm text-gray-900 text-right">
                        {peak.callCount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Capacity Planning Tab */}
        {activeTab === 'planning' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Capacity Planning</h3>
              <div className="space-y-4">
                {dashboardData.capacityPlanning.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{plan.facilityName}</h4>
                        <p className="text-sm text-gray-500">{plan.date} - {plan.timeSlot}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(plan.riskLevel)}`}>
                        {plan.riskLevel} RISK
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Projected Demand</div>
                        <div className="text-lg font-medium text-gray-900">{plan.projectedDemand}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Available Resources</div>
                        <div className="text-lg font-medium text-gray-900">{plan.availableResources}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Capacity Gap</div>
                        <div className="text-lg font-medium text-red-600">{plan.capacityGap}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-2">Recommendations:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDashboard;
