import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  X,
  Search,
  Filter,
  FileText,
  Calendar,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ExportDataReportProps {
  data: {
    costAnalysis: any;
    profitabilityAnalysis: any;
    tripCostBreakdowns: any[];
    exportDate: string;
  };
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const ExportDataReport: React.FC<ExportDataReportProps> = ({
  data,
  onClose,
  onDownload,
  onShare
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataType, setSelectedDataType] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['costAnalysis']));
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const dataTypes = [
    { id: 'all', name: 'All Data', count: 3, description: 'Complete dataset including all analysis' },
    { id: 'costAnalysis', name: 'Cost Analysis', count: 1, description: 'Financial cost breakdown and metrics' },
    { id: 'profitabilityAnalysis', name: 'Profitability Analysis', count: 1, description: 'Profit margins and trends' },
    { id: 'tripCostBreakdowns', name: 'Trip Details', count: data.tripCostBreakdowns.length, description: 'Individual trip cost breakdowns' }
  ];

  const filteredDataTypes = dataTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'costAnalysis': return <Database className="h-5 w-5 text-blue-600" />;
      case 'profitabilityAnalysis': return <FileText className="h-5 w-5 text-green-600" />;
      case 'tripCostBreakdowns': return <Calendar className="h-5 w-5 text-purple-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderCostAnalysisData = () => {
    if (!data.costAnalysis) return <p className="text-gray-500">No cost analysis data available</p>;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Financial Summary</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Total Revenue: {formatCurrency(data.costAnalysis.totalRevenue || 0)}</li>
              <li>Total Cost: {formatCurrency(data.costAnalysis.totalCost || 0)}</li>
              <li>Gross Profit: {formatCurrency(data.costAnalysis.grossProfit || 0)}</li>
              <li>Profit Margin: {(data.costAnalysis.averageProfitMargin || 0).toFixed(1)}%</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Operational Metrics</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Total Trips: {(data.costAnalysis.totalTrips || 0).toLocaleString()}</li>
              <li>Avg Revenue/Mile: {formatCurrency(data.costAnalysis.averageRevenuePerMile || 0)}</li>
              <li>Avg Cost/Mile: {formatCurrency(data.costAnalysis.averageCostPerMile || 0)}</li>
              <li>Utilization Rate: {((data.costAnalysis.averageUtilizationRate || 0) * 100).toFixed(1)}%</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderProfitabilityAnalysisData = () => {
    if (!data.profitabilityAnalysis) return <p className="text-gray-500">No profitability analysis data available</p>;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Period Summary</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Period: {data.profitabilityAnalysis.period || 'N/A'}</li>
              <li>Total Revenue: {formatCurrency(data.profitabilityAnalysis.totalRevenue || 0)}</li>
              <li>Total Cost: {formatCurrency(data.profitabilityAnalysis.totalCost || 0)}</li>
              <li>Gross Profit: {formatCurrency(data.profitabilityAnalysis.grossProfit || 0)}</li>
              <li>Profit Margin: {(data.profitabilityAnalysis.profitMargin || 0).toFixed(1)}%</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Trip Metrics</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Trip Count: {(data.profitabilityAnalysis.tripCount || 0).toLocaleString()}</li>
              <li>Avg Revenue/Trip: {formatCurrency(data.profitabilityAnalysis.averageRevenuePerTrip || 0)}</li>
              <li>Avg Cost/Trip: {formatCurrency(data.profitabilityAnalysis.averageCostPerTrip || 0)}</li>
              <li>Monthly Breakdown: {data.profitabilityAnalysis.monthlyBreakdown?.length || 0} months</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderTripCostBreakdownsData = () => {
    if (!data.tripCostBreakdowns || data.tripCostBreakdowns.length === 0) {
      return <p className="text-gray-500">No trip cost breakdown data available</p>;
    }
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Trip Summary</h4>
          <p className="text-sm text-gray-600">
            {data.tripCostBreakdowns.length} trip records available with detailed cost breakdowns
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.tripCostBreakdowns.slice(0, 10).map((trip, index) => (
                <tr key={trip.id || index}>
                  <td className="px-4 py-2 text-sm text-gray-900">{trip.tripId?.substring(0, 8) || 'N/A'}...</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{trip.transportLevel || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{trip.priorityLevel || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(trip.totalRevenue || 0)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(trip.totalCost || 0)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(trip.grossProfit || 0)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {trip.calculatedAt ? new Date(trip.calculatedAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.tripCostBreakdowns.length > 10 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Showing first 10 of {data.tripCostBreakdowns.length} records
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Data Export Report</h2>
            <p className="text-gray-100 mt-1">
              Comprehensive financial data export
            </p>
            <p className="text-gray-100 text-sm">
              Generated: {formatDate(data.exportDate)}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onShare}
              className="p-2 bg-gray-500 hover:bg-gray-400 rounded-md transition-colors"
              title="Share Report"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 bg-gray-500 hover:bg-gray-400 rounded-md transition-colors"
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
        {/* Export Options */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search data types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {dataTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xlsx">Excel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDataTypes.map((type) => (
            <div key={type.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getDataTypeIcon(type.id)}
                  <div>
                    <h4 className="font-medium text-gray-900">{type.name}</h4>
                    <p className="text-sm text-gray-500">{type.count} records</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{type.id}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{type.description}</p>
            </div>
          ))}
        </div>

        {/* Data Sections */}
        <div className="space-y-4">
          {/* Cost Analysis Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('costAnalysis')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Cost Analysis Data</h3>
                  <p className="text-sm text-gray-500">Financial cost breakdown and metrics</p>
                </div>
              </div>
              {expandedSections.has('costAnalysis') ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.has('costAnalysis') && (
              <div className="px-6 pb-4 border-t border-gray-200">
                {renderCostAnalysisData()}
              </div>
            )}
          </div>

          {/* Profitability Analysis Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('profitabilityAnalysis')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Profitability Analysis Data</h3>
                  <p className="text-sm text-gray-500">Profit margins and trends</p>
                </div>
              </div>
              {expandedSections.has('profitabilityAnalysis') ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.has('profitabilityAnalysis') && (
              <div className="px-6 pb-4 border-t border-gray-200">
                {renderProfitabilityAnalysisData()}
              </div>
            )}
          </div>

          {/* Trip Cost Breakdowns Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('tripCostBreakdowns')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Trip Cost Breakdowns</h3>
                  <p className="text-sm text-gray-500">{data.tripCostBreakdowns.length} individual trip records</p>
                </div>
              </div>
              {expandedSections.has('tripCostBreakdowns') ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.has('tripCostBreakdowns') && (
              <div className="px-6 pb-4 border-t border-gray-200">
                {renderTripCostBreakdownsData()}
              </div>
            )}
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Data Overview</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Total Records: {data.tripCostBreakdowns.length + 2}</li>
                <li>• Data Types: 3 (Cost Analysis, Profitability, Trip Details)</li>
                <li>• Export Format: {selectedFormat.toUpperCase()}</li>
                <li>• Generated: {formatDate(data.exportDate)}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Export Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={onDownload}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {selectedFormat.toUpperCase()} Export
                </button>
                <button
                  onClick={onShare}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Export Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDataReport;
