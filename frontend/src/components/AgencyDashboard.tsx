import React, { useState, useEffect } from 'react';
import UnitManagement from './UnitManagement';
import TransportRequests from './TransportRequests';
import BidManagement from './BidManagement';
import MatchingSystem from './MatchingSystem';

interface AgencyStats {
  totalUnits: number;
  availableUnits: number;
  totalTransports: number;
  completedTransports: number;
  completionRate: number;
}

interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  currentStatus: string;
  unitAvailability?: {
    status: string;
    location?: any;
    shiftStart?: string;
    shiftEnd?: string;
  };
}

interface RecentTransport {
  id: string;
  patientId: string;
  originFacility: { name: string; city: string };
  destinationFacility: { name: string; city: string };
  transportLevel: string;
  priority: string;
  status: string;
  requestTimestamp: string;
}

interface AgencyDashboardProps {
  onNavigate: (page: string) => void;
}

const AgencyDashboard: React.FC<AgencyDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [recentTransports, setRecentTransports] = useState<RecentTransport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const agencyUser = JSON.parse(localStorage.getItem('agencyUser') || '{}');
  const agency = JSON.parse(localStorage.getItem('agency') || '{}');
  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
    } else {
      loadAgencyData();
    }
  }, []);

  const loadDemoData = () => {
    // Demo data for testing
    setStats({
      totalUnits: 8,
      availableUnits: 5,
      totalTransports: 156,
      completedTransports: 142,
      completionRate: 91.0
    });

    setUnits([
      { id: '1', unitNumber: 'A-101', type: 'BLS', currentStatus: 'AVAILABLE' },
      { id: '2', unitNumber: 'A-102', type: 'ALS', currentStatus: 'IN_USE' },
      { id: '3', unitNumber: 'A-103', type: 'CCT', currentStatus: 'AVAILABLE' },
      { id: '4', unitNumber: 'A-104', type: 'BLS', currentStatus: 'AVAILABLE' },
      { id: '5', unitNumber: 'A-105', type: 'ALS', currentStatus: 'MAINTENANCE' },
      { id: '6', unitNumber: 'A-106', type: 'BLS', currentStatus: 'AVAILABLE' },
      { id: '7', unitNumber: 'A-107', type: 'CCT', currentStatus: 'AVAILABLE' },
      { id: '8', unitNumber: 'A-108', type: 'ALS', currentStatus: 'OUT_OF_SERVICE' }
    ]);

    setRecentTransports([
      {
        id: '1',
        patientId: 'P-001',
        originFacility: { name: 'UPMC Altoona', city: 'Altoona' },
        destinationFacility: { name: 'Penn State Health', city: 'Hershey' },
        transportLevel: 'CCT',
        priority: 'HIGH',
        status: 'COMPLETED',
        requestTimestamp: '2025-08-23T10:30:00Z'
      },
      {
        id: '2',
        patientId: 'P-002',
        originFacility: { name: 'Mount Nittany Medical Center', city: 'State College' },
        destinationFacility: { name: 'UPMC Altoona', city: 'Altoona' },
        transportLevel: 'ALS',
        priority: 'MEDIUM',
        status: 'IN_TRANSIT',
        requestTimestamp: '2025-08-23T09:15:00Z'
      }
    ]);

    setIsLoading(false);
  };

  const loadAgencyData = async () => {
    try {
      const token = localStorage.getItem('agencyToken');
      if (!token) {
        onNavigate('agency-login');
        return;
      }

      // Load stats
      const statsResponse = await fetch('/api/agency/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Load units
      const unitsResponse = await fetch('/api/agency/units', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        setUnits(unitsData.data);
      }

      // Load recent transports (from bids)
      const bidsResponse = await fetch('/api/agency/bids?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (bidsResponse.ok) {
        const bidsData = await bidsResponse.json();
        setRecentTransports(bidsData.data.map((bid: any) => bid.transportRequest));
      }

    } catch (error) {
      console.error('Error loading agency data:', error);
      setError('Failed to load agency data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agencyToken');
    localStorage.removeItem('agencyUser');
    localStorage.removeItem('agency');
    localStorage.removeItem('demoMode');
            onNavigate('agency-login');
      };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-100';
      case 'IN_USE': return 'text-blue-600 bg-blue-100';
      case 'OUT_OF_SERVICE': return 'text-red-600 bg-red-100';
      case 'MAINTENANCE': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agency dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {agency.name || 'Demo Transport Agency'}
              </h1>
              <p className="text-gray-600">
                Welcome back, {agencyUser.name || 'Demo User'}
                {isDemoMode && <span className="ml-2 text-blue-600 text-sm">(Demo Mode)</span>}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('agency-profile')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'units', name: 'Units', icon: '🚑' },
              { id: 'transports', name: 'Transports', icon: '📋' },
              { id: 'bids', name: 'Bids', icon: '💰' },
              { id: 'matching', name: 'Smart Matching', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-2xl">🚑</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Units</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUnits}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Available Units</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.availableUnits}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Transports</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalTransports}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <span className="text-2xl">📈</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.completionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('transports')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">🔍</span>
                    <p className="font-medium text-gray-900">View Available Transports</p>
                    <p className="text-sm text-gray-600">Find new opportunities</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('units')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">🚑</span>
                    <p className="text-sm text-gray-600">Update availability</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bids')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">💰</span>
                    <p className="text-sm text-gray-600">Track submissions</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentTransports.map(transport => (
                  <div key={transport.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-lg">🚑</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transport.originFacility.name} → {transport.destinationFacility.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transport.transportLevel} • {transport.priority} Priority
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(transport.priority)}`}>
                        {transport.priority}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(transport.requestTimestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && <UnitManagement />}

        {activeTab === 'transports' && <TransportRequests />}

        {activeTab === 'bids' && <BidManagement />}
        {activeTab === 'matching' && <MatchingSystem />}
      </main>
    </div>
  );
};

export default AgencyDashboard;
