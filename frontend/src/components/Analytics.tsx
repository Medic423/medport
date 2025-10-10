import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, DollarSign, Settings } from 'lucide-react';
import api from '../services/api';
import RevenueOptimizationPanel from './RevenueOptimizationPanel';

interface SystemOverview {
  totalHospitals: number;
  totalAgencies: number;
  totalFacilities: number;
  activeHospitals: number;
  activeAgencies: number;
  activeFacilities: number;
  totalUnits: number;
  activeUnits: number;
}

interface TripStatistics {
  totalTrips: number;
  pendingTrips: number;
  acceptedTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  tripsByLevel: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  tripsByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState<SystemOverview | null>(null);
  const [tripStats, setTripStats] = useState<TripStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: BarChart3 },
    { id: 'revenue', name: 'Revenue Optimization', icon: DollarSign },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'units', name: 'Unit Management', icon: Activity },
    { id: 'settings', name: 'Revenue Settings', icon: Settings },
  ];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch overview data
        const overviewResponse = await api.get('/tcc/analytics/overview');
        const overviewResult = overviewResponse.data;
        if (overviewResult.success) {
          setOverviewData(overviewResult.data);
        }

        // Fetch trip statistics
        const tripsResponse = await api.get('/tcc/analytics/trips');
        const tripsResult = tripsResponse.data;
        if (tripsResult.success) {
          setTripStats(tripsResult.data);
        }

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          View system-wide analytics, performance metrics, and revenue optimization across all agencies.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading analytics data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && overviewData && tripStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                          <dd className="text-lg font-medium text-gray-900">{tripStats.totalTrips}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Units</dt>
                          <dd className="text-lg font-medium text-gray-900">{overviewData.activeUnits}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Agencies</dt>
                          <dd className="text-lg font-medium text-gray-900">{overviewData.activeAgencies}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Hospitals</dt>
                          <dd className="text-lg font-medium text-gray-900">{overviewData.activeHospitals}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Status Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Completed</span>
                      <span className="text-sm font-medium text-gray-900">{tripStats.completedTrips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Pending</span>
                      <span className="text-sm font-medium text-gray-900">{tripStats.pendingTrips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Accepted</span>
                      <span className="text-sm font-medium text-gray-900">{tripStats.acceptedTrips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Cancelled</span>
                      <span className="text-sm font-medium text-gray-900">{tripStats.cancelledTrips}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Level Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">BLS</span>
                      <span className="text-sm font-medium text-gray-900">{tripStats.tripsByLevel.BLS || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">ALS</span>
                      <span className="text-sm font-medium text-gray-900">{tripStats.tripsByLevel.ALS || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">CCT</span>
                      <span className="text-sm font-medium text-gray-900">{tripStats.tripsByLevel.CCT || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'revenue' && (
        <RevenueOptimizationPanel 
          showBackhaulPairs={true}
          showUnitManagement={true}
          title="Revenue Optimization Analytics"
        />
      )}

      {activeTab === 'performance' && (
        <PerformanceTab />
      )}

      {activeTab === 'units' && (
        <RevenueOptimizationPanel 
          showBackhaulPairs={false}
          showUnitManagement={true}
          title="Unit Management Analytics"
        />
      )}

      {activeTab === 'settings' && (
        <RevenueSettingsTab />
      )}
    </div>
  );
};

const PerformanceTab: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch performance data from optimization endpoint
        const response = await api.get('/optimize/performance');
        const result = response.data;
        if (result.success) {
          setPerformanceData(result.data);
        }

      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">Loading performance data...</p>
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
            <h3 className="text-sm font-medium text-red-800">Error loading performance data</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                  <dd className="text-lg font-medium text-gray-900">{performanceData?.totalTrips || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Trips</dt>
                  <dd className="text-lg font-medium text-gray-900">{performanceData?.completedTrips || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Efficiency</dt>
                  <dd className="text-lg font-medium text-gray-900">{performanceData?.efficiency ? `${(performanceData.efficiency * 100).toFixed(1)}%` : '0%'}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${performanceData?.totalRevenue || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Times</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Average Response Time</span>
              <span className="text-sm font-medium text-gray-900">
                {performanceData?.averageResponseTime ? `${performanceData.averageResponseTime.toFixed(1)} min` : '0 min'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Average Trip Time</span>
              <span className="text-sm font-medium text-gray-900">
                {performanceData?.averageTripTime ? `${performanceData.averageTripTime.toFixed(1)} min` : '0 min'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Satisfaction</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Rating</span>
              <span className="text-sm font-medium text-gray-900">
                {performanceData?.customerSatisfaction ? `${performanceData.customerSatisfaction}/5.0` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RevenueSettingsTab: React.FC = () => {
  const [revenueSettings, setRevenueSettings] = useState({
    baseRates: {
      BLS: 150.0,
      ALS: 250.0,
      CCT: 400.0
    },
    perMileRates: {
      BLS: 2.50,
      ALS: 3.75,
      CCT: 5.00
    },
    priorityMultipliers: {
      LOW: 1.0,
      MEDIUM: 1.1,
      HIGH: 1.25,
      URGENT: 1.5
    },
    specialSurcharge: 50.0,
    insuranceRates: {
      medicare: { BLS: 120.0, ALS: 200.0, CCT: 350.0 },
      medicaid: { BLS: 100.0, ALS: 180.0, CCT: 300.0 },
      private: { BLS: 180.0, ALS: 300.0, CCT: 450.0 },
      selfPay: { BLS: 200.0, ALS: 350.0, CCT: 500.0 }
    }
  });
  const [revenuePreview, setRevenuePreview] = useState<any>(null);

  const handleRevenueSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [category, subcategory] = name.split('.');
    
    if (subcategory) {
      setRevenueSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev],
          [subcategory]: parseFloat(value) || 0
        }
      }));
    } else {
      setRevenueSettings(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
    
    calculateRevenuePreview();
  };

  const calculateRevenuePreview = () => {
    const sampleTrip = {
      transportLevel: 'ALS',
      priority: 'MEDIUM',
      distanceMiles: 15.0,
      specialRequirements: false,
      insuranceCompany: 'medicare'
    };

    const baseRate = revenueSettings.baseRates[sampleTrip.transportLevel as keyof typeof revenueSettings.baseRates];
    const perMileRate = revenueSettings.perMileRates[sampleTrip.transportLevel as keyof typeof revenueSettings.perMileRates];
    const priorityMultiplier = revenueSettings.priorityMultipliers[sampleTrip.priority as keyof typeof revenueSettings.priorityMultipliers];
    const insuranceRate = revenueSettings.insuranceRates[sampleTrip.insuranceCompany as keyof typeof revenueSettings.insuranceRates][sampleTrip.transportLevel as keyof typeof revenueSettings.insuranceRates.medicare];
    
    const specialSurcharge = sampleTrip.specialRequirements ? revenueSettings.specialSurcharge : 0;
    
    const standardRevenue = (baseRate * priorityMultiplier + specialSurcharge);
    const mileageRevenue = (baseRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;
    const insuranceRevenue = (insuranceRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;

    setRevenuePreview({
      sampleTrip,
      standardRevenue: Math.round(standardRevenue * 100) / 100,
      mileageRevenue: Math.round(mileageRevenue * 100) / 100,
      insuranceRevenue: Math.round(insuranceRevenue * 100) / 100
    });
  };

  useEffect(() => {
    calculateRevenuePreview();
  }, [revenueSettings]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Revenue Settings</h3>
          <p className="text-sm text-gray-500">Configure global pricing rates for revenue calculations</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Base Rates */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Base Rates by Transport Level</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">BLS Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.BLS}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.BLS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ALS Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.ALS}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.ALS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CCT Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.CCT}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.CCT"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Per Mile Rates */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Per Mile Rates</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">BLS Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.BLS}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.BLS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ALS Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.ALS}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.ALS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CCT Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.CCT}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.CCT"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Preview */}
          {revenuePreview && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Revenue Preview</h4>
              <p className="text-sm text-gray-600 mb-4">
                Sample trip: {revenuePreview.sampleTrip.transportLevel} transport, {revenuePreview.sampleTrip.priority} priority, 
                {revenuePreview.sampleTrip.distanceMiles} miles, {revenuePreview.sampleTrip.insuranceCompany} insurance
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Standard Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${revenuePreview.standardRevenue}</p>
                  <p className="text-xs text-gray-500">Base rate × priority</p>
                </div>
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Mileage Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${revenuePreview.mileageRevenue}</p>
                  <p className="text-xs text-gray-500">Base + (per mile × distance)</p>
                </div>
                <div className="bg-white p-4 rounded-md border">
                  <h5 className="text-sm font-medium text-gray-700">Insurance Rate</h5>
                  <p className="text-2xl font-bold text-gray-900">${revenuePreview.insuranceRevenue}</p>
                  <p className="text-xs text-gray-500">Insurance rate + mileage</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                localStorage.setItem('tcc_revenue_settings', JSON.stringify(revenueSettings));
                alert('Revenue settings saved!');
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Revenue Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
