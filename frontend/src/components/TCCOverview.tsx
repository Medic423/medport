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
  RefreshCw,
  ChevronDown,
  ChevronUp
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

interface FacilityListItem {
  id: string;
  name: string;
  city: string;
  state: string;
  createdAt: string;
  isActive: boolean;
  email?: string;
  phone?: string;
}

interface AgencyListItem {
  id: string;
  name: string;
  city: string;
  state: string;
  createdAt: string;
  isActive: boolean;
  email: string;
  phone: string;
  contactName: string;
}

interface IdleAccountListItem {
  id: string;
  email: string;
  name: string;
  facilityName?: string;
  agencyName?: string;
  lastLogin: string | null;
  createdAt: string;
}

interface IdleAccountsList {
  healthcare: IdleAccountListItem[];
  ems: IdleAccountListItem[];
  admin: IdleAccountListItem[];
}

interface ActiveUserListItem {
  id: string;
  name: string;
  facilityName?: string;
  agencyName?: string;
  city: string;
  state: string;
  lastActivity: string;
  minutesAgo: number;
}

interface ActiveUsersList {
  healthcare: ActiveUserListItem[];
  ems: ActiveUserListItem[];
}

const TCCOverview: React.FC<TCCOverviewProps> = ({ user, onClearSession }) => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [accountStats, setAccountStats] = useState<AccountStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Phase 3: Show List functionality state
  const [expandedLists, setExpandedLists] = useState<{
    facilities60: boolean;
    agencies60: boolean;
    registrations90: boolean;
    idle30: boolean;
    idle60: boolean;
    idle90: boolean;
  }>({ 
    facilities60: false, 
    agencies60: false, 
    registrations90: false,
    idle30: false,
    idle60: false,
    idle90: false
  });
  
  const [listData, setListData] = useState<{
    facilities60: FacilityListItem[] | null;
    agencies60: AgencyListItem[] | null;
    registrations90: { facilities: FacilityListItem[]; agencies: AgencyListItem[] } | null;
    idle30: IdleAccountsList | null;
    idle60: IdleAccountsList | null;
    idle90: IdleAccountsList | null;
  }>({
    facilities60: null,
    agencies60: null,
    registrations90: null,
    idle30: null,
    idle60: null,
    idle90: null
  });
  
  const [listLoading, setListLoading] = useState<{
    facilities60: boolean;
    agencies60: boolean;
    registrations90: boolean;
    idle30: boolean;
    idle60: boolean;
    idle90: boolean;
  }>({ 
    facilities60: false, 
    agencies60: false, 
    registrations90: false,
    idle30: false,
    idle60: false,
    idle90: false
  });
  
  // Current Activity state
  const [activeUsers, setActiveUsers] = useState<ActiveUsersList | null>(null);
  const [activeUsersLoading, setActiveUsersLoading] = useState(false);
  const [showActiveUsers, setShowActiveUsers] = useState(false);
  const [facilitiesOnline, setFacilitiesOnline] = useState<{
    healthcare: { last24Hours: number; lastWeek: number };
    ems: { last24Hours: number; lastWeek: number };
    total: { last24Hours: number; lastWeek: number };
  } | null>(null);
  const [facilitiesOnlineLoading, setFacilitiesOnlineLoading] = useState(false);

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

  // Phase 3: Fetch list data when expanded
  const fetchListData = async (type: 'facilities60' | 'agencies60' | 'registrations90' | 'idle30' | 'idle60' | 'idle90') => {
    // If already loaded, don't fetch again
    if (listData[type] !== null) {
      return;
    }

    setListLoading(prev => ({ ...prev, [type]: true }));

    try {
      if (type === 'facilities60') {
        const response = await analyticsAPI.getRecentRegistrations('facilities', 60);
        if (response.data.success) {
          setListData(prev => ({ ...prev, facilities60: response.data.data }));
        }
      } else if (type === 'agencies60') {
        const response = await analyticsAPI.getRecentRegistrations('agencies', 60);
        if (response.data.success) {
          setListData(prev => ({ ...prev, agencies60: response.data.data }));
        }
      } else if (type === 'registrations90') {
        const [facilitiesResponse, agenciesResponse] = await Promise.all([
          analyticsAPI.getRecentRegistrations('facilities', 90),
          analyticsAPI.getRecentRegistrations('agencies', 90)
        ]);
        if (facilitiesResponse.data.success && agenciesResponse.data.success) {
          setListData(prev => ({
            ...prev,
            registrations90: {
              facilities: facilitiesResponse.data.data,
              agencies: agenciesResponse.data.data
            }
          }));
        }
      } else if (type === 'idle30' || type === 'idle60' || type === 'idle90') {
        const days = type === 'idle30' ? 30 : type === 'idle60' ? 60 : 90;
        const response = await analyticsAPI.getIdleAccountsList(days as 30 | 60 | 90);
        if (response.data.success) {
          setListData(prev => ({ ...prev, [type]: response.data.data }));
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type} list:`, error);
    } finally {
      setListLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const toggleList = (type: 'facilities60' | 'agencies60' | 'registrations90' | 'idle30' | 'idle60' | 'idle90') => {
    const isExpanding = !expandedLists[type];
    setExpandedLists(prev => ({ ...prev, [type]: isExpanding }));
    
    if (isExpanding) {
      fetchListData(type);
    }
  };

  // Current Activity fetch functions
  const fetchActiveUsers = async () => {
    setActiveUsersLoading(true);
    try {
      const response = await analyticsAPI.getActiveUsers(15, true);
      if (response.data.success) {
        setActiveUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setActiveUsersLoading(false);
    }
  };

  const fetchFacilitiesOnline = async () => {
    setFacilitiesOnlineLoading(true);
    try {
      const response = await analyticsAPI.getFacilitiesOnline();
      if (response.data.success) {
        setFacilitiesOnline(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching facilities online stats:', error);
    } finally {
      setFacilitiesOnlineLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Initial load and auto-refresh
  useEffect(() => {
    fetchOverview();
    fetchFacilitiesOnline(); // Load facilities online stats on mount
    
    // Set up auto-refresh intervals
    const overviewInterval = setInterval(() => {
      fetchOverview();
    }, 30000); // 30 seconds for overview
    
    const facilitiesOnlineInterval = setInterval(() => {
      fetchFacilitiesOnline();
    }, 60000); // 60 seconds for facilities online
    
    const activeUsersInterval = setInterval(() => {
      if (showActiveUsers) {
        fetchActiveUsers();
      }
    }, 60000); // 60 seconds for active users (only if list is shown)

    // Cleanup intervals on unmount
    return () => {
      clearInterval(overviewInterval);
      clearInterval(facilitiesOnlineInterval);
      clearInterval(activeUsersInterval);
    };
  }, [showActiveUsers]);

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
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
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
                {accountStats.newFacilitiesLast60Days > 0 && (
                  <button
                    onClick={() => toggleList('facilities60')}
                    className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <span>{expandedLists.facilities60 ? 'Hide List' : 'Show List'}</span>
                    {expandedLists.facilities60 ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
              {expandedLists.facilities60 && (
                <div className="mt-3 ml-5 border-l-2 border-blue-200 pl-3 space-y-2">
                  {listLoading.facilities60 ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Loading facilities...</span>
                    </div>
                  ) : listData.facilities60 && listData.facilities60.length > 0 ? (
                    listData.facilities60.map((facility) => (
                      <div key={facility.id} className="py-2 border-b border-gray-200 last:border-0">
                        <p className="text-sm font-medium text-gray-900">{facility.name}</p>
                        <p className="text-xs text-gray-500">
                          {facility.city}, {facility.state} • Registered {formatDate(facility.createdAt)}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                          facility.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {facility.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No facilities found</p>
                  )}
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
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
                {accountStats.newAgenciesLast60Days > 0 && (
                  <button
                    onClick={() => toggleList('agencies60')}
                    className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <span>{expandedLists.agencies60 ? 'Hide List' : 'Show List'}</span>
                    {expandedLists.agencies60 ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
              {expandedLists.agencies60 && (
                <div className="mt-3 ml-5 border-l-2 border-green-200 pl-3 space-y-2">
                  {listLoading.agencies60 ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <span>Loading agencies...</span>
                    </div>
                  ) : listData.agencies60 && listData.agencies60.length > 0 ? (
                    listData.agencies60.map((agency) => (
                      <div key={agency.id} className="py-2 border-b border-gray-200 last:border-0">
                        <p className="text-sm font-medium text-gray-900">{agency.name}</p>
                        <p className="text-xs text-gray-500">
                          {agency.city}, {agency.state} • Registered {formatDate(agency.createdAt)}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                          agency.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agency.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No agencies found</p>
                  )}
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
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
                {(accountStats.newFacilitiesLast90Days > 0 || accountStats.newAgenciesLast90Days > 0) && (
                  <button
                    onClick={() => toggleList('registrations90')}
                    className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                  >
                    <span>{expandedLists.registrations90 ? 'Hide List' : 'Show List'}</span>
                    {expandedLists.registrations90 ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
              {expandedLists.registrations90 && (
                <div className="mt-3 ml-5 border-l-2 border-purple-200 pl-3 space-y-4">
                  {listLoading.registrations90 ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span>Loading registrations...</span>
                    </div>
                  ) : listData.registrations90 ? (
                    <>
                      {listData.registrations90.facilities.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2">Healthcare Facilities:</p>
                          <div className="space-y-2">
                            {listData.registrations90.facilities.map((facility) => (
                              <div key={facility.id} className="py-2 border-b border-gray-200 last:border-0">
                                <p className="text-sm font-medium text-gray-900">{facility.name}</p>
                                <p className="text-xs text-gray-500">
                                  {facility.city}, {facility.state} • Registered {formatDate(facility.createdAt)}
                                </p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                                  facility.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {facility.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {listData.registrations90.agencies.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2">EMS Agencies:</p>
                          <div className="space-y-2">
                            {listData.registrations90.agencies.map((agency) => (
                              <div key={agency.id} className="py-2 border-b border-gray-200 last:border-0">
                                <p className="text-sm font-medium text-gray-900">{agency.name}</p>
                                <p className="text-xs text-gray-500">
                                  {agency.city}, {agency.state} • Registered {formatDate(agency.createdAt)}
                                </p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                                  agency.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {agency.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {listData.registrations90.facilities.length === 0 && listData.registrations90.agencies.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No registrations found</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No registrations found</p>
                  )}
                </div>
              )}
            </div>
            {/* Idle Account Statistics */}
            {accountStats.idleAccounts && (
              <>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
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
                    {accountStats.idleAccounts.last30Days.total > 0 && (
                      <button
                        onClick={() => toggleList('idle30')}
                        className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 rounded-md transition-colors"
                      >
                        <span>{expandedLists.idle30 ? 'Hide List' : 'Show List'}</span>
                        {expandedLists.idle30 ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  {expandedLists.idle30 && (
                    <div className="mt-3 ml-5 border-l-2 border-yellow-300 pl-3 space-y-4">
                      {listLoading.idle30 ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                          <span>Loading idle accounts...</span>
                        </div>
                      ) : listData.idle30 ? (
                        <>
                          {listData.idle30.healthcare.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Healthcare Users ({listData.idle30.healthcare.length}):</p>
                              <div className="space-y-2">
                                {listData.idle30.healthcare.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {user.email} {user.facilityName && `• ${user.facilityName}`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle30.ems.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">EMS Users ({listData.idle30.ems.length}):</p>
                              <div className="space-y-2">
                                {listData.idle30.ems.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {user.email} {user.agencyName && `• ${user.agencyName}`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle30.admin.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Admin Users ({listData.idle30.admin.length}):</p>
                              <div className="space-y-2">
                                {listData.idle30.admin.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle30.healthcare.length === 0 && listData.idle30.ems.length === 0 && listData.idle30.admin.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No idle accounts found</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No idle accounts found</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3">
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
                    {accountStats.idleAccounts.last60Days.total > 0 && (
                      <button
                        onClick={() => toggleList('idle60')}
                        className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-orange-700 hover:text-orange-800 hover:bg-orange-100 rounded-md transition-colors"
                      >
                        <span>{expandedLists.idle60 ? 'Hide List' : 'Show List'}</span>
                        {expandedLists.idle60 ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  {expandedLists.idle60 && (
                    <div className="mt-3 ml-5 border-l-2 border-orange-300 pl-3 space-y-4">
                      {listLoading.idle60 ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                          <span>Loading idle accounts...</span>
                        </div>
                      ) : listData.idle60 ? (
                        <>
                          {listData.idle60.healthcare.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Healthcare Users ({listData.idle60.healthcare.length}):</p>
                              <div className="space-y-2">
                                {listData.idle60.healthcare.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {user.email} {user.facilityName && `• ${user.facilityName}`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle60.ems.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">EMS Users ({listData.idle60.ems.length}):</p>
                              <div className="space-y-2">
                                {listData.idle60.ems.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {user.email} {user.agencyName && `• ${user.agencyName}`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle60.admin.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Admin Users ({listData.idle60.admin.length}):</p>
                              <div className="space-y-2">
                                {listData.idle60.admin.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle60.healthcare.length === 0 && listData.idle60.ems.length === 0 && listData.idle60.admin.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No idle accounts found</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No idle accounts found</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
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
                    {accountStats.idleAccounts.last90Days.total > 0 && (
                      <button
                        onClick={() => toggleList('idle90')}
                        className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-red-700 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                      >
                        <span>{expandedLists.idle90 ? 'Hide List' : 'Show List'}</span>
                        {expandedLists.idle90 ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  {expandedLists.idle90 && (
                    <div className="mt-3 ml-5 border-l-2 border-red-300 pl-3 space-y-4">
                      {listLoading.idle90 ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span>Loading idle accounts...</span>
                        </div>
                      ) : listData.idle90 ? (
                        <>
                          {listData.idle90.healthcare.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Healthcare Users ({listData.idle90.healthcare.length}):</p>
                              <div className="space-y-2">
                                {listData.idle90.healthcare.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {user.email} {user.facilityName && `• ${user.facilityName}`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle90.ems.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">EMS Users ({listData.idle90.ems.length}):</p>
                              <div className="space-y-2">
                                {listData.idle90.ems.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {user.email} {user.agencyName && `• ${user.agencyName}`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle90.admin.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Admin Users ({listData.idle90.admin.length}):</p>
                              <div className="space-y-2">
                                {listData.idle90.admin.map((user) => (
                                  <div key={user.id} className="py-2 border-b border-gray-200 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {user.lastLogin 
                                        ? `Last login: ${formatDate(user.lastLogin)}` 
                                        : 'Never logged in'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {listData.idle90.healthcare.length === 0 && listData.idle90.ems.length === 0 && listData.idle90.admin.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No idle accounts found</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No idle accounts found</p>
                      )}
                    </div>
                  )}
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

      {/* Current Activity Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Current Activity</h2>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <button
              onClick={() => {
                setShowActiveUsers(!showActiveUsers);
                if (!showActiveUsers && !activeUsers) {
                  fetchActiveUsers();
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showActiveUsers ? 'Hide' : 'Show'} List
            </button>
          </div>
        </div>
        
        {/* Facilities Online Stats */}
        {facilitiesOnlineLoading ? (
          <div className="text-center py-2 mb-4">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        ) : facilitiesOnline ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-semibold text-purple-800 text-lg">
                {facilitiesOnline.total.last24Hours}
              </p>
              <p className="text-sm text-gray-600">Facilities Online (24h)</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="font-semibold text-indigo-800 text-lg">
                {facilitiesOnline.total.lastWeek}
              </p>
              <p className="text-sm text-gray-600">Facilities Online (Week)</p>
            </div>
          </div>
        ) : null}
        
        {activeUsersLoading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading active users...</p>
          </div>
        ) : activeUsers ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-800">
                  {activeUsers.healthcare.length + activeUsers.ems.length}
                </p>
                <p className="text-gray-600">Currently Active</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-800">{activeUsers.healthcare.length}</p>
                <p className="text-gray-600">Healthcare</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="font-semibold text-red-800">{activeUsers.ems.length}</p>
                <p className="text-gray-600">EMS</p>
              </div>
            </div>
            
            {showActiveUsers && (
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {/* Healthcare Users */}
                {activeUsers.healthcare.map((user) => (
                  <div key={user.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Display Order: 1. Facility Name, 2. Location, 3. Last Activity, 4. Name */}
                        <p className="font-semibold text-gray-900">{user.facilityName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {user.city}, {user.state}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">
                            {user.minutesAgo === 0 
                              ? 'Just now' 
                              : `Active ${user.minutesAgo} min${user.minutesAgo > 1 ? 's' : ''} ago`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{user.name}</p>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Healthcare
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* EMS Users */}
                {activeUsers.ems.map((user) => (
                  <div key={user.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Display Order: 1. Agency Name, 2. Location, 3. Last Activity, 4. Name */}
                        <p className="font-semibold text-gray-900">{user.agencyName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {user.city}, {user.state}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">
                            {user.minutesAgo === 0 
                              ? 'Just now' 
                              : `Active ${user.minutesAgo} min${user.minutesAgo > 1 ? 's' : ''} ago`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{user.name}</p>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          EMS
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State */}
                {activeUsers.healthcare.length === 0 && 
                 activeUsers.ems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No active users in the last 15 minutes</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : showActiveUsers ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Click "Show List" to load active users</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TCCOverview;
