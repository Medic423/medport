import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Truck,
  Star,
  Download,
  Share2,
  X
} from 'lucide-react';
import { 
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

interface RevenueReportProps {
  data: {
    period: string;
    dateRange: { start: string; end: string };
    tripsByTransportLevel: {
      BLS: { count: number; revenue: number; cost: number; profit: number; margin: number };
      ALS: { count: number; revenue: number; cost: number; profit: number; margin: number };
      CCT: { count: number; revenue: number; cost: number; profit: number; margin: number };
    };
    tripsByPriority: {
      LOW: { count: number; revenue: number; cost: number; profit: number; margin: number };
      MEDIUM: { count: number; revenue: number; cost: number; profit: number; margin: number };
      HIGH: { count: number; revenue: number; cost: number; profit: number; margin: number };
      URGENT: { count: number; revenue: number; cost: number; profit: number; margin: number };
    };
    averageRevenuePerMile: number;
    generatedAt: string;
  };
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const RevenueReport: React.FC<RevenueReportProps> = ({
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransportLevelColor = (level: string) => {
    switch (level) {
      case 'BLS': return 'text-blue-600 bg-blue-100';
      case 'ALS': return 'text-purple-600 bg-purple-100';
      case 'CCT': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Prepare data for charts
  const transportLevelData = Object.entries(data.tripsByTransportLevel).map(([level, info]) => ({
    level,
    revenue: info.revenue,
    cost: info.cost,
    profit: info.profit,
    margin: info.margin,
    count: info.count
  }));

  const priorityData = Object.entries(data.tripsByPriority).map(([priority, info]) => ({
    priority,
    revenue: info.revenue,
    cost: info.cost,
    profit: info.profit,
    margin: info.margin,
    count: info.count
  }));

  const transportLevelPieData = Object.entries(data.tripsByTransportLevel).map(([level, info]) => ({
    name: level,
    value: info.revenue,
    color: level === 'BLS' ? '#3b82f6' : level === 'ALS' ? '#8b5cf6' : '#10b981'
  }));

  const priorityPieData = Object.entries(data.tripsByPriority).map(([priority, info]) => ({
    name: priority,
    value: info.revenue,
    color: priority === 'URGENT' ? '#ef4444' : priority === 'HIGH' ? '#f97316' : priority === 'MEDIUM' ? '#eab308' : '#22c55e'
  }));

  const totalRevenue = Object.values(data.tripsByTransportLevel).reduce((sum, info) => sum + info.revenue, 0);
  const totalTrips = Object.values(data.tripsByTransportLevel).reduce((sum, info) => sum + info.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Revenue Analysis Report</h2>
            <p className="text-green-100 mt-1">
              Period: {data.period} ({new Date(data.dateRange.start).toLocaleDateString()} - {new Date(data.dateRange.end).toLocaleDateString()})
            </p>
            <p className="text-green-100 text-sm">
              Generated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onShare}
              className="p-2 bg-green-500 hover:bg-green-400 rounded-md transition-colors"
              title="Share Report"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 bg-green-500 hover:bg-green-400 rounded-md transition-colors"
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
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Total Revenue</p>
                <p className="text-2xl font-semibold text-green-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Total Trips</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {totalTrips.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Avg Revenue/Mile</p>
                <p className="text-2xl font-semibold text-purple-900">
                  {formatCurrency(data.averageRevenuePerMile)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Transport Level Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Transport Level</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transportLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Priority Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Priority Level</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transport Level Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Distribution by Transport Level</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={transportLevelPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transportLevelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Distribution by Priority</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={priorityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transport Level Table */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Level Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transportLevelData.map((item) => (
                    <tr key={item.level}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransportLevelColor(item.level)}`}>
                          {item.level}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.count}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.revenue)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitMarginBgColor(item.margin)} ${getProfitMarginColor(item.margin)}`}>
                          {formatPercentage(item.margin)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Priority Level Table */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Level Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {priorityData.map((item) => (
                    <tr key={item.priority}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.count}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.revenue)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitMarginBgColor(item.margin)} ${getProfitMarginColor(item.margin)}`}>
                          {formatPercentage(item.margin)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Revenue Insights */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Top Performing Transport Level</h4>
              <p className="text-sm text-gray-600">
                {Object.entries(data.tripsByTransportLevel)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)[0][0]} generates the highest revenue at{' '}
                {formatCurrency(Object.entries(data.tripsByTransportLevel)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)[0][1].revenue)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Top Performing Priority Level</h4>
              <p className="text-sm text-gray-600">
                {Object.entries(data.tripsByPriority)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)[0][0]} priority generates the highest revenue at{' '}
                {formatCurrency(Object.entries(data.tripsByPriority)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)[0][1].revenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;
