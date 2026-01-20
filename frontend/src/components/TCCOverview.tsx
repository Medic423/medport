import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Building2, 
  Truck, 
  FileText,
  BarChart3,
  TrendingUp,
  MapPin,
  Activity,
  RefreshCw
} from 'lucide-react';
import { analyticsAPI } from '../services/api';

interface TCCOverviewProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
  onClearSession?: () => void;
}

interface SystemOverview {
  totalTrips: number;
  totalHospitals: number;
  totalAgencies: number;
  totalFacilities: number;
  activeHospitals: number;
  activeAgencies: number;
  activeFacilities: number;
  // Units removed - Units Management feature disabled
  // totalUnits: number;
  // activeUnits: number;
}

interface AccountStatistics {
  newFacilitiesLast60Days: number;
  newAgenciesLast60Days: number;
  newFacilitiesLast90Days: number;
  newAgenciesLast90Days: number;
  idleAccounts: {
    last30Days: { healthcare: number; ems: number; admin: number; total: number };
    last60Days: { healthcare: number; ems: number; admin: number; total: number };
    last90Days: { healthcare: number; ems: number; admin: number; total: number };
  };
}

const TCCOverview: React.FC<TCCOverviewProps> = ({ user, onClearSession }) => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [accountStats, setAccountStats] = useState<AccountStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchOverview = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [overviewResponse, accountStatsResponse] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getAccountStatistics()
      ]);
      console.log('TCC_DEBUG: Overview response:', overviewResponse.data);
      console.log('TCC_DEBUG: Account stats response:', accountStatsResponse.data);
      setOverview(overviewResponse.data.data);
      if (accountStatsResponse.data.success && accountStatsResponse.data.data) {
        setAccountStats(accountStatsResponse.data.data);
      } else {
        console.warn('TCC_DEBUG: Account stats response format unexpected:', accountStatsResponse.data);
        setAccountStats(null);
      }
      setLastRefresh(new Date());
    } catch (error: any) {
      console.error('Failed to load overview:', error);
      console.error('Account statistics error:', error.response?.data || error.message);
      // Don't set accountStats to null on error - keep previous value if available
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and auto-refresh every 30 seconds
  useEffect(() => {
    fetchOverview();
    
    // Set up auto-refresh interval (30 seconds)
    const interval = setInterval(() => {
      fetchOverview();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      title: 'Create Trip',
      description: 'Create a new transport request',
      icon: Plus,
      onClick: () => navigate('/dashboard/operations/trips/create'),
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      title: 'Add Healthcare Facility',
      description: 'Register a new healthcare facility',
      icon: Building2,
      onClick: () => {
        console.log('TCC_DEBUG: Add Healthcare Facility button clicked');
        // Clear session and navigate immediately to avoid flash
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/healthcare-register';
      },
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white'
    },
    {
      title: 'Add EMS Agency',
      description: 'Register a new EMS agency',
      icon: Truck,
      onClick: () => {
        console.log('TCC_DEBUG: Add EMS Agency button clicked');
        // Clear session and navigate immediately to avoid flash
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/ems-register';
      },
      color: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-white'
    },
    {
      title: 'Existing Trip Management',
      description: 'Manage and optimize existing trips',
      icon: MapPin,
      onClick: () => navigate('/dashboard/operations/trips'),
      color: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-white'
    }
  ];

  const statsCards = [
    {
      title: 'Active Trips',
      value: overview?.totalTrips?.toString() || '0',
      change: '—',
      changeType: 'neutral' as const,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Healthcare Facilities',
      value: overview?.totalHospitals?.toString() || '0',
      change: `${overview?.activeHospitals || 0} active`,
      changeType: 'positive' as const,
      icon: Building2,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'EMS Agencies',
      value: overview?.totalAgencies?.toString() || '0',
      change: `${overview?.activeAgencies || 0} active`,
      changeType: 'positive' as const,
      icon: Truck,
      color: 'bg-red-50 text-red-600'
    }
    // Active Units tile removed - Units Management feature disabled
    // See docs/active/sessions/2026-01/units-management-disabled.md
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <button
            onClick={() => fetchOverview(true)}
            disabled={refreshing || loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={action.onClick}
              className={`${action.color} ${action.textColor} p-4 rounded-lg transition-colors text-left group`}
            >
              <div className="flex items-center space-x-3">
                <action.icon className="h-6 w-6" />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : ''}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading activity...</p>
          </div>
        ) : accountStats ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New Healthcare Facilities Registered (Last 60 Days)</p>
                {accountStats.newFacilitiesLast60Days > 0 ? (
                  <p className="text-sm text-gray-500">
                    {accountStats.newFacilitiesLast60Days} Healthcare Facilities
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No healthcare facilities registered in the last 60 days</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New EMS Agencies Registered (Last 60 Days)</p>
                {accountStats.newAgenciesLast60Days > 0 ? (
                  <p className="text-sm text-gray-500">
                    {accountStats.newAgenciesLast60Days} EMS Agencies
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No EMS agencies registered in the last 60 days</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New Registrations (Last 90 Days)</p>
                {accountStats.newFacilitiesLast90Days > 0 || accountStats.newAgenciesLast90Days > 0 ? (
                  <p className="text-sm text-gray-500">
                    {accountStats.newFacilitiesLast90Days} Healthcare Facilities, 
                    {accountStats.newAgenciesLast90Days} EMS Agencies
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No new registrations in the last 90 days</p>
                )}
              </div>
            </div>
            {/* Idle Account Statistics */}
            {accountStats.idleAccounts && (
              <>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Idle Accounts (Last 30 Days)</p>
                    {accountStats.idleAccounts.last30Days.total > 0 ? (
                      <p className="text-sm text-gray-500">
                        {accountStats.idleAccounts.last30Days.total} total ({accountStats.idleAccounts.last30Days.healthcare} Healthcare, {accountStats.idleAccounts.last30Days.ems} EMS, {accountStats.idleAccounts.last30Days.admin} Admin)
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No idle accounts in the last 30 days</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="h-2 w-2 bg-orange-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Idle Accounts (Last 60 Days)</p>
                    {accountStats.idleAccounts.last60Days.total > 0 ? (
                      <p className="text-sm text-gray-500">
                        {accountStats.idleAccounts.last60Days.total} total ({accountStats.idleAccounts.last60Days.healthcare} Healthcare, {accountStats.idleAccounts.last60Days.ems} EMS, {accountStats.idleAccounts.last60Days.admin} Admin)
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No idle accounts in the last 60 days</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Idle Accounts (Last 90 Days)</p>
                    {accountStats.idleAccounts.last90Days.total > 0 ? (
                      <p className="text-sm text-gray-500">
                        {accountStats.idleAccounts.last90Days.total} total ({accountStats.idleAccounts.last90Days.healthcare} Healthcare, {accountStats.idleAccounts.last90Days.ems} EMS, {accountStats.idleAccounts.last90Days.admin} Admin)
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No idle accounts in the last 90 days</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No activity data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TCCOverview;
