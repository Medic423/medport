import React, { useState, useEffect } from 'react';
import { 
  EmergencyDepartment, 
  EDMetrics, 
  TransportQueue, 
  CapacityAlert,
  BedUpdateType 
} from '../types/emergencyDepartment';

interface EmergencyDepartmentDashboardProps {
  emergencyDepartmentId?: string;
}

const EmergencyDepartmentDashboard: React.FC<EmergencyDepartmentDashboardProps> = ({ 
  emergencyDepartmentId 
}) => {
  const [ed, setEd] = useState<EmergencyDepartment | null>(null);
  const [metrics, setMetrics] = useState<EDMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'alerts' | 'bed-status'>('overview');

  // Demo data for testing
  const demoED: EmergencyDepartment = {
    id: 'demo-ed-1',
    facilityId: 'demo-facility-1',
    name: 'UPMC Altoona Emergency Department',
    totalBeds: 45,
    availableBeds: 12,
    occupiedBeds: 28,
    hallwayBeds: 5,
    criticalBeds: 8,
    capacityThreshold: 85,
    currentCensus: 33,
    transportQueueLength: 7,
    averageWaitTime: 45,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    facility: {
      id: 'demo-facility-1',
      name: 'UPMC Altoona',
      type: 'HOSPITAL',
      address: '620 Howard Avenue',
      city: 'Altoona',
      state: 'PA',
      zipCode: '16601'
    },
    bedStatusUpdates: [],
    transportQueues: [
      {
        id: 'queue-1',
        emergencyDepartmentId: 'demo-ed-1',
        transportRequestId: 'req-1',
        queuePosition: 1,
        priority: 'URGENT',
        waitTime: 15,
        estimatedWaitTime: 30,
        status: 'WAITING',
        queueTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transportRequest: {
          id: 'req-1',
          patientId: 'P001',
          originFacilityId: 'demo-facility-1',
          destinationFacilityId: 'demo-facility-2',
          transportLevel: 'CCT',
          priority: 'URGENT',
          status: 'PENDING',
          requestTimestamp: new Date().toISOString(),
          createdById: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          originFacility: {
            id: 'demo-facility-1',
            name: 'UPMC Altoona',
            type: 'HOSPITAL',
            address: '620 Howard Avenue',
            city: 'Altoona',
            state: 'PA',
            zipCode: '16601'
          },
          destinationFacility: {
            id: 'demo-facility-2',
            name: 'UPMC Presbyterian',
            type: 'HOSPITAL',
            address: '200 Lothrop Street',
            city: 'Pittsburgh',
            state: 'PA',
            zipCode: '15213'
          }
        },
        emergencyDepartment: {} as EmergencyDepartment
      }
    ],
    capacityAlerts: [
      {
        id: 'alert-1',
        emergencyDepartmentId: 'demo-ed-1',
        alertType: 'BED_CAPACITY',
        severity: 'HIGH',
        message: 'ED capacity at 87.8% (33/45 beds)',
        threshold: 85,
        currentValue: 88,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emergencyDepartment: {} as EmergencyDepartment
      }
    ]
  };

  const demoMetrics: EDMetrics = {
    capacityUtilization: 73.3,
    availableCapacity: 12,
    queueWaitTime: 45,
    criticalBedUtilization: 350,
    hallwayBedPercentage: 11.1,
    transportQueueLength: 7,
    isAtCapacity: false,
    isOverCapacity: false
  };

  useEffect(() => {
    // For demo purposes, use demo data
    if (!emergencyDepartmentId) {
      setEd(demoED);
      setMetrics(demoMetrics);
      setLoading(false);
      return;
    }

    // TODO: Implement actual API calls when backend is ready
    const fetchEDData = async () => {
      try {
        setLoading(true);
        // const response = await fetch(`/api/emergency-department/departments/${emergencyDepartmentId}`);
        // const edData = await response.json();
        // setEd(edData);
        
        // const metricsResponse = await fetch(`/api/emergency-department/departments/${emergencyDepartmentId}/metrics`);
        // const metricsData = await metricsResponse.json();
        // setMetrics(metricsData);
        
        setEd(demoED);
        setMetrics(demoMetrics);
      } catch (err) {
        setError('Failed to fetch emergency department data');
        console.error('Error fetching ED data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEDData();
  }, [emergencyDepartmentId]);

  const getCapacityColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 80) return 'text-orange-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!ed) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No emergency department data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">{ed.name}</h1>
        <p className="text-blue-100">Emergency Department Dashboard</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', count: null },
            { id: 'queue', name: 'Transport Queue', count: ed.transportQueueLength },
            { id: 'alerts', name: 'Capacity Alerts', count: ed.capacityAlerts.filter(a => a.isActive).length },
            { id: 'bed-status', name: 'Bed Status', count: null }
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

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Capacity</p>
                    <p className={`text-2xl font-bold ${getCapacityColor(ed.currentCensus / ed.totalBeds * 100)}`}>
                      {ed.currentCensus}/{ed.totalBeds}
                    </p>
                    <p className="text-sm text-blue-500">
                      {((ed.currentCensus / ed.totalBeds) * 100).toFixed(1)}% utilized
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Available</p>
                    <p className="text-2xl font-bold text-green-600">{ed.availableBeds}</p>
                    <p className="text-sm text-green-500">beds available</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Queue</p>
                    <p className="text-2xl font-bold text-orange-600">{ed.transportQueueLength}</p>
                    <p className="text-sm text-orange-500">pending transports</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Wait Time</p>
                    <p className="text-2xl font-bold text-purple-600">{ed.averageWaitTime}m</p>
                    <p className="text-sm text-purple-500">average wait</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bed Status Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bed Status Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{ed.occupiedBeds}</div>
                  <div className="text-sm text-gray-600">Occupied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{ed.availableBeds}</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{ed.hallwayBeds}</div>
                  <div className="text-sm text-gray-600">Hallway</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{ed.criticalBeds}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Transport request added to queue - Patient P001</span>
                  <span className="ml-auto text-gray-400">2 min ago</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Bed status updated - 2 beds vacated</span>
                  <span className="ml-auto text-gray-400">5 min ago</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span>Capacity alert triggered - 87.8% utilization</span>
                  <span className="ml-auto text-gray-400">10 min ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Transport Queue</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Add to Queue
              </button>
            </div>
            
            {ed.transportQueues.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transport requests in queue</p>
            ) : (
              <div className="space-y-3">
                {ed.transportQueues.map((queue) => (
                  <div key={queue.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(queue.priority)}`}>
                          {queue.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(queue.status)}`}>
                          {queue.status}
                        </span>
                        <span className="text-sm text-gray-600">#{queue.queuePosition}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Wait: {queue.waitTime}m
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-900">
                        Patient {queue.transportRequest.patientId}
                      </div>
                      <div className="text-sm text-gray-600">
                        {queue.transportRequest.originFacility.name} → {queue.transportRequest.destinationFacility.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {queue.transportRequest.transportLevel} • {queue.transportRequest.priority} Priority
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Assign Provider
                      </button>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Capacity Alerts</h3>
            
            {ed.capacityAlerts.filter(a => a.isActive).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active capacity alerts</p>
            ) : (
              <div className="space-y-3">
                {ed.capacityAlerts.filter(a => a.isActive).map((alert) => (
                  <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${
                    alert.severity === 'CRITICAL' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'HIGH' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          alert.severity === 'CRITICAL' ? 'bg-red-500' :
                          alert.severity === 'HIGH' ? 'bg-orange-500' :
                          alert.severity === 'MEDIUM' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {alert.alertType.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-gray-600">{alert.message}</div>
                        </div>
                      </div>
                      <button className="bg-white text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50 border border-gray-300">
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bed-status' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Bed Status Management</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Update Bed Status
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Beds:</span>
                    <span className="font-medium">{ed.totalBeds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium text-green-600">{ed.availableBeds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-medium text-blue-600">{ed.occupiedBeds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hallway:</span>
                    <span className="font-medium text-orange-600">{ed.hallwayBeds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Critical:</span>
                    <span className="font-medium text-red-600">{ed.criticalBeds}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full bg-green-100 text-green-800 px-3 py-2 rounded text-sm hover:bg-green-200">
                    Add Bed
                  </button>
                  <button className="w-full bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm hover:bg-blue-200">
                    Occupy Bed
                  </button>
                  <button className="w-full bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm hover:bg-yellow-200">
                    Add Hallway Bed
                  </button>
                  <button className="w-full bg-red-100 text-red-800 px-3 py-2 rounded text-sm hover:bg-red-200">
                    Update Critical Beds
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyDepartmentDashboard;
