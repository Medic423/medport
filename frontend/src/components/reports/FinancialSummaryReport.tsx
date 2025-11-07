import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Truck,
  MapPin,
  Clock,
  Calendar,
  Download,
  Share2,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface FinancialSummaryReportProps {
  data: {
    period: string;
    dateRange: { start: string; end: string };
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    averageProfitMargin: number;
    totalTrips: number;
    averageRevenuePerMile: number;
    averageCostPerMile: number;
    averageUtilizationRate: number;
    generatedAt: string;
  };
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const FinancialSummaryReport: React.FC<FinancialSummaryReportProps> = ({
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

  // Generate sample trend data for visualization
  const generateTrendData = () => {
    const trendData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 0; i < months.length; i++) {
      const baseRevenue = data.totalRevenue * 0.8 + (i * data.totalRevenue * 0.1) + Math.random() * data.totalRevenue * 0.1;
      const baseCost = data.totalCost * 0.8 + (i * data.totalCost * 0.1) + Math.random() * data.totalCost * 0.1;
      
      trendData.push({
        month: months[i],
        revenue: Math.round(baseRevenue),
        cost: Math.round(baseCost),
        profit: Math.round(baseRevenue - baseCost)
      });
    }
    
    return trendData;
  };

  const trendData = generateTrendData();

  const costBreakdownData = [
    { name: 'Crew Labor', value: data.totalCost * 0.35, color: '#8884d8' },
    { name: 'Vehicle', value: data.totalCost * 0.25, color: '#82ca9d' },
    { name: 'Fuel', value: data.totalCost * 0.15, color: '#ffc658' },
    { name: 'Maintenance', value: data.totalCost * 0.12, color: '#ff7300' },
    { name: 'Overhead', value: data.totalCost * 0.13, color: '#8dd1e1' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Financial Summary Report</h2>
            <p className="text-blue-100 mt-1">
              Period: {data.period} ({new Date(data.dateRange.start).toLocaleDateString()} - {new Date(data.dateRange.end).toLocaleDateString()})
            </p>
            <p className="text-blue-100 text-sm">
              Generated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onShare}
              className="p-2 bg-blue-500 hover:bg-blue-400 rounded-md transition-colors"
              title="Share Report"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 bg-blue-500 hover:bg-blue-400 rounded-md transition-colors"
              title="Download Report"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-500 hover:bg-red-400 rounded-md transition-colors"
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
                  {formatCurrency(data.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Total Costs</p>
                <p className="text-2xl font-semibold text-red-900">
                  {formatCurrency(data.totalCost)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Gross Profit</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {formatCurrency(data.grossProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Profit Margin</p>
                <p className={`text-2xl font-semibold ${getProfitMarginColor(data.averageProfitMargin)}`}>
                  {formatPercentage(data.averageProfitMargin)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Trips</p>
                <p className="text-xl font-semibold text-gray-900">
                  {data.totalTrips.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Revenue per Mile</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(data.averageRevenuePerMile)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Utilization Rate</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatPercentage(data.averageUtilizationRate * 100)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue vs Cost Trend Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue vs Cost Trend</h3>
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

        {/* Cost Breakdown Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Cost']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Financial Performance</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Average Revenue per Trip: {formatCurrency(data.totalRevenue / data.totalTrips)}</li>
                <li>• Average Cost per Trip: {formatCurrency(data.totalCost / data.totalTrips)}</li>
                <li>• Average Profit per Trip: {formatCurrency(data.grossProfit / data.totalTrips)}</li>
                <li>• Cost per Mile: {formatCurrency(data.averageCostPerMile)}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Operational Metrics</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Total Trips Completed: {data.totalTrips.toLocaleString()}</li>
                <li>• Average Revenue per Mile: {formatCurrency(data.averageRevenuePerMile)}</li>
                <li>• Utilization Rate: {formatPercentage(data.averageUtilizationRate * 100)}</li>
                <li>• Profit Margin: {formatPercentage(data.averageProfitMargin)}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryReport;
