import React, { useState } from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Truck,
  Wrench,
  Fuel,
  Users,
  Building,
  Download,
  Share2,
  X,
  Filter
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
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface TripCostBreakdown {
  id: string;
  tripId: string;
  baseRevenue: number;
  mileageRevenue: number;
  priorityRevenue: number;
  specialRequirementsRevenue: number;
  insuranceAdjustment: number;
  totalRevenue: number;
  crewLaborCost: number;
  vehicleCost: number;
  fuelCost: number;
  maintenanceCost: number;
  overheadCost: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  revenuePerMile: number;
  costPerMile: number;
  loadedMileRatio: number;
  deadheadMileRatio: number;
  utilizationRate: number;
  tripDistance: number;
  loadedMiles: number;
  deadheadMiles: number;
  tripDurationHours: number;
  transportLevel: string;
  priorityLevel: string;
  costCenterId?: string;
  costCenterName?: string;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CostReportProps {
  data: {
    period: string;
    dateRange: { start: string; end: string };
    totalCost: number;
    averageCostPerMile: number;
    costCenterBreakdown: Array<{
      costCenterId: string;
      costCenterName: string;
      tripCount: number;
      totalRevenue: number;
      totalCost: number;
      grossProfit: number;
      profitMargin: number;
    }>;
    tripCostBreakdowns: TripCostBreakdown[];
    generatedAt: string;
  };
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const CostReport: React.FC<CostReportProps> = ({
  data,
  onClose,
  onDownload,
  onShare
}) => {
  const [selectedTransportLevel, setSelectedTransportLevel] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

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

  const getTransportLevelColor = (level: string) => {
    switch (level) {
      case 'BLS': return 'text-blue-600 bg-blue-100';
      case 'ALS': return 'text-purple-600 bg-purple-100';
      case 'CCT': return 'text-green-600 bg-green-100';
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

  // Early return if data is not available
  console.log('TCC_DEBUG: CostReport - Component render, data:', data);
  console.log('TCC_DEBUG: CostReport - data.tripCostBreakdowns:', data?.tripCostBreakdowns);
  console.log('TCC_DEBUG: CostReport - typeof data.tripCostBreakdowns:', typeof data?.tripCostBreakdowns);
  console.log('TCC_DEBUG: CostReport - Array.isArray(data.tripCostBreakdowns):', Array.isArray(data?.tripCostBreakdowns));

  if (!data || (!data.tripCostBreakdowns && !data.tripCostBreakdowns?.breakdowns)) {
    console.log('TCC_DEBUG: CostReport - Early return due to missing data');
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading cost analysis data...</p>
        </div>
      </div>
    );
  }

  // Filter trip breakdowns - handle both array and object formats
  let tripBreakdowns = [];
  if (Array.isArray(data.tripCostBreakdowns)) {
    tripBreakdowns = data.tripCostBreakdowns;
  } else if (data.tripCostBreakdowns && Array.isArray(data.tripCostBreakdowns.breakdowns)) {
    tripBreakdowns = data.tripCostBreakdowns.breakdowns;
  } else {
    tripBreakdowns = [];
  }
  console.log('TCC_DEBUG: CostReport - tripBreakdowns after Array.isArray check:', tripBreakdowns);
  console.log('TCC_DEBUG: CostReport - tripBreakdowns.length:', tripBreakdowns.length);
  
  const filteredTrips = tripBreakdowns.filter(trip => {
    if (selectedTransportLevel !== 'all' && trip.transportLevel !== selectedTransportLevel) return false;
    if (selectedPriority !== 'all' && trip.priorityLevel !== selectedPriority) return false;
    return true;
  });
  console.log('TCC_DEBUG: CostReport - filteredTrips after filter:', filteredTrips);
  console.log('TCC_DEBUG: CostReport - filteredTrips.length:', filteredTrips.length);
  console.log('TCC_DEBUG: CostReport - typeof filteredTrips:', typeof filteredTrips);
  console.log('TCC_DEBUG: CostReport - Array.isArray(filteredTrips):', Array.isArray(filteredTrips));

  // Calculate cost breakdown totals
  const totalCrewLabor = filteredTrips.reduce((sum, trip) => sum + (trip.crewLaborCost || 0), 0);
  const totalVehicle = filteredTrips.reduce((sum, trip) => sum + (trip.vehicleCost || 0), 0);
  const totalFuel = filteredTrips.reduce((sum, trip) => sum + (trip.fuelCost || 0), 0);
  const totalMaintenance = filteredTrips.reduce((sum, trip) => sum + (trip.maintenanceCost || 0), 0);
  const totalOverhead = filteredTrips.reduce((sum, trip) => sum + (trip.overheadCost || 0), 0);

  const costBreakdownData = [
    { name: 'Crew Labor', value: totalCrewLabor, color: '#8884d8' },
    { name: 'Vehicle', value: totalVehicle, color: '#82ca9d' },
    { name: 'Fuel', value: totalFuel, color: '#ffc658' },
    { name: 'Maintenance', value: totalMaintenance, color: '#ff7300' },
    { name: 'Overhead', value: totalOverhead, color: '#8dd1e1' }
  ];

  // Cost per transport level
  const transportLevelCosts = filteredTrips.reduce((acc, trip) => {
    const level = trip.transportLevel || 'Unknown';
    if (!acc[level]) {
      acc[level] = { totalCost: 0, tripCount: 0, averageCost: 0 };
    }
    acc[level].totalCost += (trip.totalCost || 0);
    acc[level].tripCount += 1;
    return acc;
  }, {} as Record<string, { totalCost: number; tripCount: number; averageCost: number }>);

  Object.keys(transportLevelCosts).forEach(level => {
    transportLevelCosts[level].averageCost = transportLevelCosts[level].totalCost / transportLevelCosts[level].tripCount;
  });

  const transportLevelData = Object.entries(transportLevelCosts).map(([level, info]) => ({
    level,
    totalCost: info.totalCost,
    tripCount: info.tripCount,
    averageCost: info.averageCost
  }));

  // Cost trends over time (last 10 trips)
  console.log('TCC_DEBUG: CostReport - About to filter recentTrips, filteredTrips:', filteredTrips);
  const tripsWithDates = filteredTrips.filter(trip => trip.calculatedAt);
  console.log('TCC_DEBUG: CostReport - tripsWithDates after filter:', tripsWithDates);
  const sortedTrips = tripsWithDates.sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime());
  console.log('TCC_DEBUG: CostReport - sortedTrips after sort:', sortedTrips);
  console.log('TCC_DEBUG: CostReport - About to call slice on sortedTrips, typeof:', typeof sortedTrips, 'Array.isArray:', Array.isArray(sortedTrips));
  const slicedTrips = sortedTrips.slice(0, 10);
  console.log('TCC_DEBUG: CostReport - slicedTrips after slice:', slicedTrips);
  const recentTrips = slicedTrips.reverse();
  console.log('TCC_DEBUG: CostReport - recentTrips after reverse:', recentTrips);

  const costTrendData = recentTrips.map((trip, index) => ({
    trip: `Trip ${index + 1}`,
    totalCost: trip.totalCost || 0,
    crewLabor: trip.crewLaborCost || 0,
    vehicle: trip.vehicleCost || 0,
    fuel: trip.fuelCost || 0,
    maintenance: trip.maintenanceCost || 0,
    overhead: trip.overheadCost || 0
  }));

  const uniqueTransportLevels = [...new Set(tripBreakdowns.map(trip => trip.transportLevel).filter(Boolean))];
  const uniquePriorities = [...new Set(tripBreakdowns.map(trip => trip.priorityLevel).filter(Boolean))];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Cost Analysis Report</h2>
            <p className="text-red-100 mt-1">
              Period: {data.period} ({new Date(data.dateRange.start).toLocaleDateString()} - {new Date(data.dateRange.end).toLocaleDateString()})
            </p>
            <p className="text-red-100 text-sm">
              Generated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onShare}
              className="p-2 bg-red-500 hover:bg-red-400 rounded-md transition-colors"
              title="Share Report"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 bg-red-500 hover:bg-red-400 rounded-md transition-colors"
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
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Total Cost</p>
                <p className="text-2xl font-semibold text-red-900">
                  {formatCurrency(data.totalCost)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Avg Cost/Mile</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {formatCurrency(data.averageCostPerMile)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Total Trips</p>
                <p className="text-2xl font-semibold text-purple-900">
                  {filteredTrips.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex space-x-4">
              <select
                value={selectedTransportLevel}
                onChange={(e) => setSelectedTransportLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Transport Levels</option>
                {uniqueTransportLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                {uniquePriorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
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

        {/* Cost by Transport Level */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost by Transport Level</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transportLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Cost']} />
                <Legend />
                <Bar dataKey="totalCost" fill="#ef4444" name="Total Cost" />
                <Bar dataKey="averageCost" fill="#f97316" name="Average Cost per Trip" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Cost Trends (Last 10 Trips)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trip" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Legend />
                <Line type="monotone" dataKey="totalCost" stroke="#ef4444" strokeWidth={2} name="Total Cost" />
                <Line type="monotone" dataKey="crewLabor" stroke="#8884d8" strokeWidth={2} name="Crew Labor" />
                <Line type="monotone" dataKey="vehicle" stroke="#82ca9d" strokeWidth={2} name="Vehicle" />
                <Line type="monotone" dataKey="fuel" stroke="#ffc658" strokeWidth={2} name="Fuel" />
                <Line type="monotone" dataKey="maintenance" stroke="#ff7300" strokeWidth={2} name="Maintenance" />
                <Line type="monotone" dataKey="overhead" stroke="#8dd1e1" strokeWidth={2} name="Overhead" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Centers Table */}
        {data.costCenterBreakdown.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Center Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Center</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.costCenterBreakdown.map((center) => (
                    <tr key={center.costCenterId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {center.costCenterName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{center.tripCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(center.totalRevenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(center.totalCost)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(center.grossProfit)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitMarginBgColor(center.profitMargin)} ${getProfitMarginColor(center.profitMargin)}`}>
                          {formatPercentage(center.profitMargin)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Trip Costs */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Trip Cost Breakdowns</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew Labor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  console.log('TCC_DEBUG: CostReport - About to slice filteredTrips for table, filteredTrips:', filteredTrips);
                  console.log('TCC_DEBUG: CostReport - typeof filteredTrips for table:', typeof filteredTrips, 'Array.isArray:', Array.isArray(filteredTrips));
                  const tableTrips = filteredTrips.slice(0, 10);
                  console.log('TCC_DEBUG: CostReport - tableTrips after slice:', tableTrips);
                  return tableTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.tripId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransportLevelColor(trip.transportLevel)}`}>
                        {trip.transportLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(trip.priorityLevel)}`}>
                        {trip.priorityLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trip.totalCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trip.crewLaborCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trip.vehicleCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trip.fuelCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(trip.calculatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Analysis Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Cost Breakdown</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Crew Labor: {formatCurrency(totalCrewLabor)} ({(totalCrewLabor / data.totalCost * 100).toFixed(1)}%)</li>
                <li>• Vehicle Costs: {formatCurrency(totalVehicle)} ({(totalVehicle / data.totalCost * 100).toFixed(1)}%)</li>
                <li>• Fuel Costs: {formatCurrency(totalFuel)} ({(totalFuel / data.totalCost * 100).toFixed(1)}%)</li>
                <li>• Maintenance: {formatCurrency(totalMaintenance)} ({(totalMaintenance / data.totalCost * 100).toFixed(1)}%)</li>
                <li>• Overhead: {formatCurrency(totalOverhead)} ({(totalOverhead / data.totalCost * 100).toFixed(1)}%)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Metrics</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Average Cost per Trip: {formatCurrency(data.totalCost / filteredTrips.length)}</li>
                <li>• Average Cost per Mile: {formatCurrency(data.averageCostPerMile)}</li>
                <li>• Total Trips Analyzed: {filteredTrips.length.toLocaleString()}</li>
                <li>• Highest Cost Category: {costBreakdownData.sort((a, b) => b.value - a.value)[0].name}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostReport;
