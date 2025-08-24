import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  TruckIcon, 
  BuildingOfficeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  overview: {
    totalTransports: number;
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    activeUnits: number;
    averageResponseTime: number;
  };
  efficiency: {
    totalTransports: number;
    totalMiles: number;
    totalRevenue: number;
    averageResponseTime: number;
    averageTransportTime: number;
    utilizationRate: number;
    efficiencyScore: number;
    chainedTripRate: number;
    emptyMilesReduction: number;
  };
  agencyPerformance: Array<{
    agencyId: string;
    agencyName: string;
    totalUnits: number;
    activeUnits: number;
    totalTransports: number;
    totalRevenue: number;
    averageResponseTime: number;
    utilizationRate: number;
    performanceScore: number;
    growthRate: number;
  }>;
  costAnalysis: {
    totalCosts: number;
    fuelCosts: number;
    maintenanceCosts: number;
    laborCosts: number;
    insuranceCosts: number;
    administrativeCosts: number;
    costPerMile: number;
    costPerTransport: number;
    profitMargin: number;
  };
  historicalData: {
    timeRange: {
      start: Date;
      end: Date;
    };
    period: string;
    data: Array<{
      period: string;
      transports: number;
      revenue: number;
      miles: number;
      costs: number;
      profit: number;
      utilization: number;
    }>;
    trends: {
      revenueGrowth: number;
      costTrend: number;
      utilizationTrend: number;
      efficiencyTrend: number;
    };
  };
  recommendations: string[];
  lastUpdated: Date;
}

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'efficiency' | 'agency' | 'costs' | 'historical' | 'recommendations'>('overview');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/summary?period=${timeRange}`, {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalyticsData(result.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch(`/api/analytics/export/csv?period=${timeRange}`, {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medport-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      alert('Failed to export analytics data');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Analytics data is not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive performance metrics and business intelligence for MedPort
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export CSV
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
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'efficiency', name: 'Efficiency', icon: TruckIcon },
              { id: 'agency', name: 'Agency Performance', icon: BuildingOfficeIcon },
              { id: 'costs', name: 'Cost Analysis', icon: CurrencyDollarIcon },
              { id: 'historical', name: 'Historical Data', icon: ArrowTrendingUpIcon },
              { id: 'recommendations', name: 'Recommendations', icon: ClockIcon }
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
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.name}
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <TruckIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Transports</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analyticsData.overview.totalTransports.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${analyticsData.overview.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <BuildingOfficeIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Units</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analyticsData.overview.activeUnits}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Response</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analyticsData.overview.averageResponseTime.toFixed(1)}m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${analyticsData.overview.netProfit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Net Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ${analyticsData.overview.totalCosts.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total Costs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {((analyticsData.overview.netProfit / analyticsData.overview.totalRevenue) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Profit Margin</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
              Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}

        {/* Efficiency Tab */}
        {activeTab === 'efficiency' && (
          <div className="space-y-6">
            {/* Efficiency Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.efficiency.efficiencyScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">Efficiency Score</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.efficiency.utilizationRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Utilization Rate</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analyticsData.efficiency.chainedTripRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Chained Trip Rate</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.efficiency.emptyMilesReduction.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Empty Miles Reduction</div>
                </div>
              </div>
            </div>

            {/* Detailed Efficiency Data */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Transport Efficiency Details</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Miles:</span>
                        <span className="font-medium">{analyticsData.efficiency.totalMiles.toLocaleString()} mi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Transport Time:</span>
                        <span className="font-medium">{analyticsData.efficiency.averageTransportTime.toFixed(1)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue per Mile:</span>
                        <span className="font-medium">${(analyticsData.efficiency.totalRevenue / analyticsData.efficiency.totalMiles).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Efficiency Indicators</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Utilization Rate</span>
                          <span>{analyticsData.efficiency.utilizationRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${analyticsData.efficiency.utilizationRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Chained Trip Rate</span>
                          <span>{analyticsData.efficiency.chainedTripRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${analyticsData.efficiency.chainedTripRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agency Performance Tab */}
        {activeTab === 'agency' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Agency Performance Rankings</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transports</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.agencyPerformance.map((agency, index) => (
                        <tr key={agency.agencyId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {agency.agencyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {agency.activeUnits}/{agency.totalUnits}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {agency.totalTransports}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${agency.totalRevenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${agency.performanceScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{agency.performanceScore.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`${agency.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {agency.growthRate >= 0 ? '+' : ''}{agency.growthRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cost Analysis Tab */}
        {activeTab === 'costs' && (
          <div className="space-y-6">
            {analyticsData.costAnalysis.totalCosts > 0 ? (
              <>
                {/* Cost Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        ${analyticsData.costAnalysis.totalCosts.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Total Costs</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${analyticsData.costAnalysis.costPerMile.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Cost per Mile</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData.costAnalysis.profitMargin !== null ? analyticsData.costAnalysis.profitMargin.toFixed(1) : '0.0'}%
                      </div>
                      <div className="text-sm text-gray-500">Profit Margin</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Cost Analysis</h3>
                <p className="text-gray-600 mb-4">No cost data available for the selected time period.</p>
                <p className="text-sm text-gray-500">Costs will appear here once transport assignments are completed and cost data is available.</p>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Cost Breakdown</h3>
              </div>
              <div className="p-6">
                {analyticsData.costAnalysis.totalCosts > 0 ? (
                  <div className="space-y-4">
                    {[
                      { label: 'Fuel Costs', value: analyticsData.costAnalysis.fuelCosts, color: 'bg-red-500' },
                      { label: 'Maintenance Costs', value: analyticsData.costAnalysis.maintenanceCosts, color: 'bg-yellow-500' },
                      { label: 'Labor Costs', value: analyticsData.costAnalysis.laborCosts, color: 'bg-blue-500' },
                      { label: 'Insurance Costs', value: analyticsData.costAnalysis.insuranceCosts, color: 'bg-purple-500' },
                      { label: 'Administrative Costs', value: analyticsData.costAnalysis.administrativeCosts, color: 'bg-gray-500' }
                    ].map((cost, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{cost.label}</span>
                          <span className="font-medium">${cost.value.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${cost.color} h-2 rounded-full`}
                            style={{ width: `${(cost.value / analyticsData.costAnalysis.totalCosts) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">💰</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Cost Data Available</h3>
                    <p className="text-gray-600">Cost analysis data will appear here once transport assignments are completed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Historical Data Tab */}
        {activeTab === 'historical' && (
          <div className="space-y-6">
            {/* Trends Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${analyticsData.historicalData.trends.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.historicalData.trends.revenueGrowth >= 0 ? '+' : ''}{analyticsData.historicalData.trends.revenueGrowth.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Revenue Growth</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${analyticsData.historicalData.trends.costTrend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.historicalData.trends.costTrend >= 0 ? '+' : ''}{analyticsData.historicalData.trends.costTrend.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Cost Trend</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${analyticsData.historicalData.trends.utilizationTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.historicalData.trends.utilizationTrend >= 0 ? '+' : ''}{analyticsData.historicalData.trends.utilizationTrend.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Utilization Trend</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${analyticsData.historicalData.trends.efficiencyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.historicalData.trends.efficiencyTrend >= 0 ? '+' : ''}{analyticsData.historicalData.trends.efficiencyTrend.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Efficiency Trend</div>
                </div>
              </div>
            </div>

            {/* Historical Data Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Historical Performance Data</h3>
                <p className="text-sm text-gray-600 mt-1">Period: {analyticsData.historicalData.period}</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transports</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miles</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costs</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.historicalData.data.map((period, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {period.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period.transports}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${period.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period.miles.toLocaleString()} mi
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${period.costs.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={period.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ${period.profit.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period.utilization.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Optimization Recommendations</h3>
                <p className="text-sm text-gray-600 mt-1">AI-powered suggestions for improving performance</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analyticsData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
