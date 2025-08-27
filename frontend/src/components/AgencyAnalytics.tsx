import React, { useState, useEffect } from 'react';

interface AgencyMetrics {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalRevenue: number;
  averageRevenuePerTrip: number;
  totalMiles: number;
  averageMilesPerTrip: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  onTimePercentage: number;
  customerSatisfaction: number;
  unitUtilization: number;
  crewEfficiency: number;
}

interface TripTrends {
  date: string;
  trips: number;
  revenue: number;
  costs: number;
  profit: number;
}

interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

const AgencyAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AgencyMetrics | null>(null);
  const [tripTrends, setTripTrends] = useState<TripTrends[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30_DAYS');

  useEffect(() => {
    loadAgencyAnalytics();
  }, [timeRange]);

  const loadAgencyAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      // Load agency metrics
      const metricsResponse = await fetch(`/api/agency/analytics/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
      }

      // Load trip trends
      const trendsResponse = await fetch(`/api/agency/analytics/trends?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setTripTrends(trendsData.trends);
      }

      // Load revenue breakdown
      const revenueResponse = await fetch(`/api/agency/analytics/revenue?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueBreakdown(revenueData.breakdown);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load agency analytics';
      console.error('[MedPort:AgencyAnalytics] Error loading analytics:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value: number, threshold: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value >= threshold ? 'text-green-600' : 'text-red-600';
    } else {
      return value <= threshold ? 'text-green-600' : 'text-red-600';
    }
  };

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'totalTrips': return '🚑';
      case 'totalRevenue': return '💰';
      case 'totalMiles': return '🗺️';
      case 'onTimePercentage': return '⏰';
      case 'customerSatisfaction': return '😊';
      case 'unitUtilization': return '📊';
      case 'crewEfficiency': return '👥';
      default: return '📈';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading agency analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Agency Analytics</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={loadAgencyAnalytics}
                  className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No analytics data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agency Analytics</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive performance and financial analytics for your transport agency
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Time Range</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
              <option value="90_DAYS">Last 90 Days</option>
              <option value="1_YEAR">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">{getMetricIcon('totalTrips')}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTrips}</p>
                <p className="text-sm text-gray-500">
                  {metrics.completedTrips} completed, {metrics.cancelledTrips} cancelled
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">{getMetricIcon('totalRevenue')}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  ${metrics.averageRevenuePerTrip.toLocaleString()} per trip
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">{getMetricIcon('totalMiles')}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Miles</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalMiles.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {metrics.averageMilesPerTrip.toFixed(1)} per trip
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.netProfit, 0)}`}>
                  ${metrics.netProfit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {metrics.profitMargin.toFixed(1)}% margin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Indicators */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getMetricIcon('onTimePercentage')}</span>
                  <span className="text-sm font-medium text-gray-700">On-Time Performance</span>
                </div>
                <span className={`text-lg font-semibold ${getMetricColor(metrics.onTimePercentage, 90)}`}>
                  {metrics.onTimePercentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getMetricIcon('customerSatisfaction')}</span>
                  <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                </div>
                <span className={`text-lg font-semibold ${getMetricColor(metrics.customerSatisfaction, 4.0)}`}>
                  {metrics.customerSatisfaction.toFixed(1)}/5.0
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getMetricIcon('unitUtilization')}</span>
                  <span className="text-sm font-medium text-gray-700">Unit Utilization</span>
                </div>
                <span className={`text-lg font-semibold ${getMetricColor(metrics.unitUtilization, 80)}`}>
                  {metrics.unitUtilization.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getMetricIcon('crewEfficiency')}</span>
                  <span className="text-sm font-medium text-gray-700">Crew Efficiency</span>
                </div>
                <span className={`text-lg font-semibold ${getMetricColor(metrics.crewEfficiency, 85)}`}>
                  {metrics.crewEfficiency.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                <span className="text-lg font-semibold text-green-600">${metrics.totalRevenue.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Costs</span>
                <span className="text-lg font-semibold text-red-600">${metrics.totalCosts.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Net Profit</span>
                <span className={`text-lg font-semibold ${getMetricColor(metrics.netProfit, 0)}`}>
                  ${metrics.netProfit.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Profit Margin</span>
                <span className={`text-lg font-semibold ${getMetricColor(metrics.profitMargin, 15)}`}>
                  {metrics.profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        {revenueBreakdown.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-2">${item.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trip Trends Chart */}
        {tripTrends.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Trends</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trips
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tripTrends.map((trend, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(trend.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trend.trips}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        ${trend.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        ${trend.costs.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getMetricColor(trend.profit, 0)}>
                          ${trend.profit.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyAnalytics;
