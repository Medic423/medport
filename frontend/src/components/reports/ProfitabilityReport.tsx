import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart,
  DollarSign,
  Calendar,
  Download,
  Share2,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ProfitabilityReportProps {
  data: {
    period: string;
    profitabilityAnalysis: {
      period: string;
      totalRevenue: number;
      totalCost: number;
      grossProfit: number;
      profitMargin: number;
      tripCount: number;
      averageRevenuePerTrip: number;
      averageCostPerTrip: number;
      trends: {
        revenue: number[];
        cost: number[];
        profit: number[];
        margin: number[];
      };
      monthlyBreakdown: Array<{
        month: string;
        revenue: number;
        cost: number;
        profit: number;
        margin: number;
        tripCount: number;
      }>;
    };
    generatedAt: string;
  };
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const ProfitabilityReport: React.FC<ProfitabilityReportProps> = ({
  data,
  onClose,
  onDownload,
  onShare
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-600';
    if (margin >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitMarginBgColor = (margin: number) => {
    if (margin >= 20) return 'bg-green-100';
    if (margin >= 10) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getMarginTrendColor = (margin: number) => {
    if (margin >= 20) return '#10b981';
    if (margin >= 10) return '#eab308';
    return '#ef4444';
  };

  // Prepare data for charts
  const monthlyData = data.profitabilityAnalysis.monthlyBreakdown.map(month => ({
    ...month,
    profitMargin: month.margin
  }));

  // Generate trend data for visualization
  const generateTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      revenue: data.profitabilityAnalysis.trends.revenue[index] || 0,
      cost: data.profitabilityAnalysis.trends.cost[index] || 0,
      profit: data.profitabilityAnalysis.trends.profit[index] || 0,
      margin: data.profitabilityAnalysis.trends.margin[index] || 0
    }));
  };

  const trendData = generateTrendData();

  // Calculate performance metrics
  const avgMargin = data.profitabilityAnalysis.monthlyBreakdown.reduce((sum, month) => sum + month.margin, 0) / data.profitabilityAnalysis.monthlyBreakdown.length;
  const bestMonth = data.profitabilityAnalysis.monthlyBreakdown.reduce((best, month) => 
    month.margin > best.margin ? month : best
  );
  const worstMonth = data.profitabilityAnalysis.monthlyBreakdown.reduce((worst, month) => 
    month.margin < worst.margin ? month : worst
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Profitability Analysis Report</h2>
            <p className="text-purple-100 mt-1">
              Period: {data.period} - {data.profitabilityAnalysis.period}
            </p>
            <p className="text-purple-100 text-sm">
              Generated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onShare}
              className="p-2 bg-purple-500 hover:bg-purple-400 rounded-md transition-colors"
              title="Share Report"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 bg-purple-500 hover:bg-purple-400 rounded-md transition-colors"
              title="Download Report"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-500 hover:bg-gray-400 rounded-md transition-colors"
              title="Close Report"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Total Revenue</p>
                <p className="text-2xl font-semibold text-green-900">
                  {formatCurrency(data.profitabilityAnalysis.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Total Cost</p>
                <p className="text-2xl font-semibold text-red-900">
                  {formatCurrency(data.profitabilityAnalysis.totalCost)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Gross Profit</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {formatCurrency(data.profitabilityAnalysis.grossProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <PieChart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Profit Margin</p>
                <p className={`text-2xl font-semibold ${getProfitMarginColor(data.profitabilityAnalysis.profitMargin)}`}>
                  {formatPercentage(data.profitabilityAnalysis.profitMargin)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Trips</p>
                <p className="text-xl font-semibold text-gray-900">
                  {data.profitabilityAnalysis.tripCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Revenue/Trip</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(data.profitabilityAnalysis.averageRevenuePerTrip)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Cost/Trip</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(data.profitabilityAnalysis.averageCostPerTrip)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profitability Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profitability Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'margin' ? `${value}%` : formatCurrency(value), 
                    name === 'margin' ? 'Margin' : name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Cost'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Profit"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Margin %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Cost Analysis */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue vs Cost Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stackId="2" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name="Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Profitability Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Profitability Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'profitMargin' ? `${value}%` : formatCurrency(value), 
                    name === 'profitMargin' ? 'Margin' : name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Cost'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="profit" fill="#3b82f6" name="Profit" />
                <Bar yAxisId="right" dataKey="profitMargin" fill="#10b981" name="Margin %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Breakdown Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.profitabilityAnalysis.monthlyBreakdown.map((month, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{month.tripCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.cost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.profit)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitMarginBgColor(month.margin)} ${getProfitMarginColor(month.margin)}`}>
                        {formatPercentage(month.margin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Best Performing Month</h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>{bestMonth.month}</strong> achieved the highest profit margin of{' '}
                  <span className="font-semibold">{formatPercentage(bestMonth.margin)}</span> with{' '}
                  <span className="font-semibold">{formatCurrency(bestMonth.profit)}</span> in profit from{' '}
                  <span className="font-semibold">{bestMonth.tripCount}</span> trips.
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Areas for Improvement</h4>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>{worstMonth.month}</strong> had the lowest profit margin of{' '}
                  <span className="font-semibold">{formatPercentage(worstMonth.margin)}</span>. 
                  Consider analyzing cost drivers and revenue optimization strategies.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Overall Performance Summary</h4>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Average profit margin across all months: <span className="font-semibold">{formatPercentage(avgMargin)}</span>. 
                Total profit generated: <span className="font-semibold">{formatCurrency(data.profitabilityAnalysis.grossProfit)}</span> from{' '}
                <span className="font-semibold">{data.profitabilityAnalysis.tripCount}</span> trips over the period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityReport;
