import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  TruckIcon,
  UserGroupIcon,
  CogIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Unit {
  id: string;
  unitNumber: string;
  type: 'BLS' | 'ALS' | 'CCT';
  currentStatus: 'AVAILABLE' | 'IN_USE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
  agencyName: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  shiftStart?: string;
  shiftEnd?: string;
  currentAssignment?: string;
  estimatedRevenue?: number;
  lastStatusUpdate?: string;
}

interface UnitAvailabilityMatrix {
  totalUnits: number;
  availableUnits: number;
  inUseUnits: number;
  outOfServiceUnits: number;
  maintenanceUnits: number;
  unitsByStatus: Record<string, number>;
  unitsByType: Record<string, number>;
  unitsByAgency: Record<string, number>;
  lastUpdated: Date;
}

interface RevenueMetrics {
  totalRevenue: number;
  totalMiles: number;
  totalTransports: number;
  averageRevenuePerTransport: number;
  averageRevenuePerMile: number;
  revenueByLevel: Record<string, number>;
  revenueByFacility: Record<string, number>;
}

const UnitAssignmentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'revenue' | 'optimization'>('overview');
  const [units, setUnits] = useState<Unit[]>([]);
  const [availabilityMatrix, setAvailabilityMatrix] = useState<UnitAvailabilityMatrix | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [optimizationResults, setOptimizationResults] = useState<{
    assignmentsCreated: number;
    totalRevenueIncrease: number;
    unitsUtilized: number;
    assignments: any[];
  } | null>(null);
  
  // New Assignment Modal State
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    unitId: '',
    transportRequestId: '',
    assignmentType: 'PRIMARY',
    startTime: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
    } else {
      loadDashboardData();
    }
  }, [selectedTimeRange]);

  const loadDemoData = () => {
    // Demo data for testing
    const demoUnits: Unit[] = [
      {
        id: '1',
        unitNumber: 'A-101',
        type: 'BLS',
        currentStatus: 'AVAILABLE',
        agencyName: 'Altoona EMS',
        currentLocation: { lat: 40.5187, lng: -78.3945, address: 'Altoona, PA' },
        shiftStart: '2025-08-23T06:00:00Z',
        shiftEnd: '2025-08-23T18:00:00Z',
        estimatedRevenue: 0,
        lastStatusUpdate: new Date().toISOString()
      },
      {
        id: '2',
        unitNumber: 'A-102',
        type: 'ALS',
        currentStatus: 'IN_USE',
        agencyName: 'Altoona EMS',
        currentLocation: { lat: 40.5187, lng: -78.3945, address: 'UPMC Altoona' },
        shiftStart: '2025-08-23T06:00:00Z',
        shiftEnd: '2025-08-23T18:00:00Z',
        currentAssignment: 'Transport from UPMC Altoona to Penn State Health',
        estimatedRevenue: 187.50,
        lastStatusUpdate: new Date().toISOString()
      },
      {
        id: '3',
        unitNumber: 'A-103',
        type: 'CCT',
        currentStatus: 'AVAILABLE',
        agencyName: 'Altoona EMS',
        currentLocation: { lat: 40.5187, lng: -78.3945, address: 'Altoona, PA' },
        shiftStart: '2025-08-23T06:00:00Z',
        shiftEnd: '2025-08-23T18:00:00Z',
        estimatedRevenue: 0,
        lastStatusUpdate: new Date().toISOString()
      },
      {
        id: '4',
        unitNumber: 'B-201',
        type: 'BLS',
        currentStatus: 'OUT_OF_SERVICE',
        agencyName: 'Blair County EMS',
        currentLocation: { lat: 40.5187, lng: -78.3945, address: 'Blair County' },
        shiftStart: '2025-08-23T06:00:00Z',
        shiftEnd: '2025-08-23T18:00:00Z',
        estimatedRevenue: 0,
        lastStatusUpdate: new Date().toISOString()
      },
      {
        id: '5',
        unitNumber: 'B-202',
        type: 'ALS',
        currentStatus: 'MAINTENANCE',
        agencyName: 'Blair County EMS',
        currentLocation: { lat: 40.5187, lng: -78.3945, address: 'Blair County' },
        shiftStart: '2025-08-23T06:00:00Z',
        shiftEnd: '2025-08-23T18:00:00Z',
        estimatedRevenue: 0,
        lastStatusUpdate: new Date().toISOString()
      }
    ];

    const demoMatrix: UnitAvailabilityMatrix = {
      totalUnits: 5,
      availableUnits: 2,
      inUseUnits: 1,
      outOfServiceUnits: 1,
      maintenanceUnits: 1,
      unitsByStatus: { 'AVAILABLE': 2, 'IN_USE': 1, 'OUT_OF_SERVICE': 1, 'MAINTENANCE': 1 },
      unitsByType: { 'BLS': 2, 'ALS': 2, 'CCT': 1 },
      unitsByAgency: { 'Altoona EMS': 3, 'Blair County EMS': 2 },
      lastUpdated: new Date()
    };

    const demoRevenue: RevenueMetrics = {
      totalRevenue: 187.50,
      totalMiles: 35.0,
      totalTransports: 1,
      averageRevenuePerTransport: 187.50,
      averageRevenuePerMile: 5.36,
      revenueByLevel: { 'ALS': 187.50 },
      revenueByFacility: { 'UPMC Altoona': 187.50 },
      lastUpdated: new Date()
    };

    setUnits(demoUnits);
    setAvailabilityMatrix(demoMatrix);
    setRevenueMetrics(demoRevenue);
    setIsLoading(false);
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load units from backend
      const unitsResponse = await fetch('/api/unit-assignment/units', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });
      
      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        setUnits(unitsData.data);
      }

      // Load availability matrix
      const matrixResponse = await fetch('/api/unit-assignment/availability-matrix', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });
      
      if (matrixResponse.ok) {
        const matrixData = await matrixResponse.json();
        setAvailabilityMatrix(matrixData.data);
      }

      // Load revenue metrics (demo agency ID)
      const revenueResponse = await fetch('/api/unit-assignment/revenue/demo-agency?entityType=agency&start=2025-08-01&end=2025-08-31', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueMetrics(revenueData.data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  // Load data for new assignment form
  const loadNewAssignmentData = async () => {
    try {
      // Load available units
      const unitsResponse = await fetch('/api/unit-assignment/units?status=AVAILABLE', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });
      
      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        setAvailableUnits(unitsData.data);
      }

      // Load pending transport requests
      const requestsResponse = await fetch('/api/transport-requests?status=PENDING', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setPendingRequests(requestsData.data || []);
      }
    } catch (error) {
      console.error('Error loading new assignment data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BLS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ALS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CCT':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.agencyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || unit.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAssignment = async () => {
    try {
      if (!newAssignment.unitId || !newAssignment.transportRequestId) {
        alert('Please select both a unit and a transport request');
        return;
      }

      const response = await fetch('/api/unit-assignment/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          transportRequestId: newAssignment.transportRequestId,
          transportLevel: 'BLS', // Will be determined from the request
          assignmentTime: new Date().toISOString(),
          assignedBy: 'cmeo6eojr0002ccpwrin40zz7', // Demo agency user ID
          notes: newAssignment.notes
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Assignment created successfully! Unit: ${result.data.unitNumber}`);
        
        // Reset form and close modal
        setNewAssignment({
          unitId: '',
          transportRequestId: '',
          assignmentType: 'PRIMARY',
          startTime: new Date().toISOString().slice(0, 16),
          notes: ''
        });
        setShowNewAssignmentModal(false);
        
        // Refresh dashboard data
        loadDashboardData();
      } else {
        const errorText = await response.text();
        alert(`Failed to create assignment: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const handleOptimizeAssignments = async () => {
    try {
      console.log('[MedPort:UnitAssignment] Sending optimization request...');
      console.log('[MedPort:UnitAssignment] Headers:', {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token'
      });
      
      const response = await fetch('/api/unit-assignment/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          optimizationType: 'REVENUE_MAX',
          constraints: {
            maxUnits: 10,
            maxDistance: 100
          }
        })
      });

      console.log('[MedPort:UnitAssignment] Response status:', response.status);
      console.log('[MedPort:UnitAssignment] Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('[MedPort:UnitAssignment] Optimization result:', result);
        
        // Update the dashboard with the optimization results
        if (result.data.success) {
          setOptimizationResults({
            assignmentsCreated: result.data.assignmentsCreated,
            totalRevenueIncrease: result.data.totalRevenueIncrease,
            unitsUtilized: result.data.unitsUtilized,
            assignments: result.data.assignments
          });
          
          // Show success message with actual results
          alert(`Optimization completed successfully!\n\nAssignments Created: ${result.data.assignmentsCreated}\nRevenue Increase: $${result.data.totalRevenueIncrease.toFixed(2)}\nUnits Utilized: ${result.data.unitsUtilized}`);
        }
        // Refresh data - always load real data after optimization
        loadDashboardData();
      } else {
        const errorText = await response.text();
        console.error('[MedPort:UnitAssignment] Response not OK:', response.status, errorText);
        alert(`Optimization failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('[MedPort:UnitAssignment] Error optimizing assignments:', error);
      alert('Failed to optimize assignments');
    }
  };

  if (isLoading) {
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
          <div className="text-red-400">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unit Assignment Dashboard</h1>
            <p className="text-gray-600">Real-time unit management and revenue optimization</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleOptimizeAssignments}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Optimize Assignments
            </button>
            <button
              onClick={() => {
                // Always load real data from backend for testing
                loadDashboardData();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Load Real Data
            </button>
            <button 
              onClick={() => {
                setShowNewAssignmentModal(true);
                loadNewAssignmentData();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'assignments', name: 'Assignments', icon: TruckIcon },
              { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon },
              { id: 'optimization', name: 'Optimization', icon: CogIcon }
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
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TruckIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Units</p>
                      <p className="text-2xl font-semibold text-gray-900">{availabilityMatrix?.totalUnits || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Available</p>
                      <p className="text-2xl font-semibold text-gray-900">{availabilityMatrix?.availableUnits || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">In Use</p>
                      <p className="text-2xl font-semibold text-gray-900">{availabilityMatrix?.inUseUnits || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                      <p className="text-2xl font-semibold text-gray-900">${revenueMetrics?.totalRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Unit Status Distribution</h3>
                  <div className="space-y-3">
                    {availabilityMatrix && Object.entries(availabilityMatrix.unitsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'AVAILABLE' ? 'bg-green-600' :
                                status === 'IN_USE' ? 'bg-blue-600' :
                                status === 'OUT_OF_SERVICE' ? 'bg-red-600' :
                                'bg-yellow-600'
                              }`}
                              style={{ width: `${(count / availabilityMatrix.totalUnits) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Transport Level</h3>
                  <div className="space-y-3">
                    {revenueMetrics && Object.entries(revenueMetrics.revenueByLevel).map(([level, revenue]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{level}</span>
                        <span className="text-sm font-medium text-gray-900">${revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search units..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_USE">In Use</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              {/* Units Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Unit Status</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUnits.map((unit) => (
                        <tr key={unit.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{unit.unitNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(unit.type)}`}>
                              {unit.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(unit.currentStatus)}`}>
                              {unit.currentStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.agencyName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.currentLocation?.address || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                            {unit.currentAssignment || 'No assignment'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${unit.estimatedRevenue?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              {/* Revenue Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">${revenueMetrics?.totalRevenue?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue per Mile</h3>
                  <p className="text-3xl font-bold text-blue-600">${revenueMetrics?.averageRevenuePerMile?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-500 mt-1">Average</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Total Transports</h3>
                  <p className="text-3xl font-bold text-purple-600">{revenueMetrics?.totalTransports || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Completed</p>
                </div>
              </div>

              {/* Revenue Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Transport Level</h3>
                  <div className="space-y-3">
                    {revenueMetrics && Object.entries(revenueMetrics.revenueByLevel).map(([level, revenue]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{level}</span>
                        <span className="text-sm font-medium text-gray-900">${revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Facility</h3>
                  <div className="space-y-3">
                    {revenueMetrics && Object.entries(revenueMetrics.revenueByFacility).map(([facility, revenue]) => (
                      <div key={facility} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 truncate max-w-xs">{facility}</span>
                        <span className="text-sm font-medium text-gray-900">${revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'optimization' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Optimization</h3>
                <p className="text-gray-600 mb-6">
                  Automatically optimize unit assignments to maximize revenue and minimize empty miles.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Optimization Strategies</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input type="radio" name="strategy" value="revenue" className="text-blue-600" defaultChecked />
                        <label className="text-sm text-gray-700">Revenue Maximization</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="radio" name="strategy" value="efficiency" className="text-blue-600" />
                        <label className="text-sm text-gray-700">Efficiency Optimization</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="radio" name="strategy" value="balanced" className="text-blue-600" />
                        <label className="text-sm text-gray-700">Balanced Approach</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Constraints</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max Distance (miles)</label>
                        <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" defaultValue={100} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max Units</label>
                        <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" defaultValue={10} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleOptimizeAssignments}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <CogIcon className="h-5 w-5 mr-2" />
                    Run Optimization
                  </button>
                </div>

                {/* Optimization Results */}
                {optimizationResults && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-green-900 mb-4">Optimization Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{optimizationResults.assignmentsCreated}</p>
                        <p className="text-sm text-green-700">Assignments Created</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">${optimizationResults.totalRevenueIncrease.toFixed(2)}</p>
                        <p className="text-sm text-green-700">Revenue Increase</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{optimizationResults.unitsUtilized}</p>
                        <p className="text-sm text-green-700">Units Utilized</p>
                      </div>
                    </div>
                    
                    {optimizationResults.assignments.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-green-900 mb-2">Recent Assignments</h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {optimizationResults.assignments.slice(0, 5).map((assignment, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-white rounded px-3 py-2">
                              <span className="text-green-800">Unit {assignment.unitNumber}</span>
                              <span className="text-green-600">Score: {assignment.score}</span>
                              <span className="text-green-700">${assignment.estimatedRevenue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Assignment Modal */}
      {showNewAssignmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Assignment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={newAssignment.unitId}
                    onChange={(e) => setNewAssignment({...newAssignment, unitId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a unit</option>
                    {availableUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitNumber} ({unit.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transport Request</label>
                  {pendingRequests.length > 0 ? (
                    <select
                      value={newAssignment.transportRequestId}
                      onChange={(e) => setNewAssignment({...newAssignment, transportRequestId: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a transport request</option>
                      {pendingRequests.map((request) => (
                        <option key={request.id} value={request.id}>
                          {request.patientId} - {request.transportLevel} ({request.originFacility?.name} → {request.destinationFacility?.name})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md border">
                      No pending transport requests available. 
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/transport-requests', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer demo-token'
                              },
                              body: JSON.stringify({
                                patientId: `DEMO-${Date.now()}`,
                                originFacilityId: 'cmeo6eodq0000ccpwaosx7w0r', // Demo facility ID
                                destinationFacilityId: 'cmeo6eodq0000ccpwaosx7w0r', // Demo facility ID
                                transportLevel: 'BLS',
                                priority: 'MEDIUM',
                                specialRequirements: 'Demo transport request for testing'
                              })
                            });
                            
                            if (response.ok) {
                              alert('Demo transport request created! Refreshing data...');
                              loadNewAssignmentData();
                            } else {
                              alert('Failed to create demo transport request');
                            }
                          } catch (error) {
                            console.error('Error creating demo transport request:', error);
                            alert('Failed to create demo transport request');
                          }
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        Create Demo Request
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Type</label>
                  <select
                    value={newAssignment.assignmentType}
                    onChange={(e) => setNewAssignment({...newAssignment, assignmentType: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PRIMARY">Primary</option>
                    <option value="BACKUP">Backup</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={newAssignment.startTime}
                    onChange={(e) => setNewAssignment({...newAssignment, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newAssignment.notes}
                    onChange={(e) => setNewAssignment({...newAssignment, notes: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes about this assignment..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewAssignmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssignment}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitAssignmentDashboard;
