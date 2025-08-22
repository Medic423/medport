import React, { useState, useEffect } from 'react';
import { 
  ProviderForecast, 
  DemandPattern, 
  TransportAgency,
  ForecastType,
  PatternType,
  TrendDirection 
} from '../types/emergencyDepartment';

interface TransportProviderForecastingProps {
  agencyId?: string;
}

const TransportProviderForecasting: React.FC<TransportProviderForecastingProps> = ({ 
  agencyId 
}) => {
  const [forecasts, setForecasts] = useState<ProviderForecast[]>([]);
  const [demandPatterns, setDemandPatterns] = useState<DemandPattern[]>([]);
  const [agencies, setAgencies] = useState<TransportAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forecasts' | 'patterns' | 'analytics' | 'planning'>('forecasts');
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [forecastType, setForecastType] = useState<ForecastType>('DAILY');

  // Demo data for testing
  const demoAgencies: TransportAgency[] = [
    {
      id: 'agency-1',
      name: 'Altoona EMS',
      contactName: 'John Smith',
      phone: '(814) 555-0123',
      email: 'john.smith@altoonaems.com',
      address: '123 Main Street',
      city: 'Altoona',
      state: 'PA',
      zipCode: '16601'
    },
    {
      id: 'agency-2',
      name: 'Blair County Ambulance',
      contactName: 'Sarah Johnson',
      phone: '(814) 555-0456',
      email: 'sarah.johnson@blaircounty.com',
      address: '456 Oak Avenue',
      city: 'Altoona',
      state: 'PA',
      zipCode: '16602'
    }
  ];

  const demoForecasts: ProviderForecast[] = [
    {
      id: 'forecast-1',
      agencyId: 'agency-1',
      forecastDate: new Date().toISOString(),
      forecastType: 'DAILY',
      predictedDemand: 24,
      availableCapacity: 28,
      capacityUtilization: 85.7,
      confidence: 0.85,
      factors: { seasonalFactor: 1.1, historicalDataPoints: 25 },
      recommendations: 'High capacity utilization expected. Consider adding additional units or extending operating hours.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agency: demoAgencies[0]
    },
    {
      id: 'forecast-2',
      agencyId: 'agency-1',
      forecastDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      forecastType: 'DAILY',
      predictedDemand: 22,
      availableCapacity: 28,
      capacityUtilization: 78.6,
      confidence: 0.82,
      factors: { seasonalFactor: 1.0, historicalDataPoints: 25 },
      recommendations: 'Moderate capacity utilization. Monitor closely and prepare for potential surges.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agency: demoAgencies[0]
    }
  ];

  const demoDemandPatterns: DemandPattern[] = [
    {
      id: 'pattern-1',
      facilityId: 'facility-1',
      patternType: 'DAILY',
      hourOfDay: 14,
      averageDemand: 3.2,
      peakDemand: 6,
      seasonalFactor: 1.1,
      trendDirection: 'INCREASING',
      confidence: 0.88,
      dataPoints: 120,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      facility: {
        id: 'facility-1',
        name: 'UPMC Altoona',
        type: 'HOSPITAL',
        address: '620 Howard Avenue',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601'
      }
    },
    {
      id: 'pattern-2',
      facilityId: 'facility-1',
      patternType: 'WEEKLY',
      dayOfWeek: 1, // Monday
      averageDemand: 18.5,
      peakDemand: 25,
      seasonalFactor: 1.0,
      trendDirection: 'STABLE',
      confidence: 0.92,
      dataPoints: 52,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      facility: {
        id: 'facility-1',
        name: 'UPMC Altoona',
        type: 'HOSPITAL',
        address: '620 Howard Avenue',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601'
      }
    }
  ];

  useEffect(() => {
    // For demo purposes, use demo data
    setAgencies(demoAgencies);
    setForecasts(demoForecasts);
    setDemandPatterns(demoDemandPatterns);
    setLoading(false);

    // TODO: Implement actual API calls when backend is ready
    // const fetchData = async () => {
    //   try {
    //     setLoading(true);
    //     // Fetch agencies, forecasts, and demand patterns
    //   } catch (err) {
    //     setError('Failed to fetch forecasting data');
    //     console.error('Error fetching forecasting data:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchData();
  }, []);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 80) return 'text-orange-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-100';
    if (utilization >= 80) return 'bg-orange-100';
    if (utilization >= 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case 'INCREASING':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'DECREASING':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      case 'STABLE':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">Transport Provider Forecasting</h1>
        <p className="text-purple-100">Demand prediction and capacity planning analytics</p>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Type</label>
            <select
              value={forecastType}
              onChange={(e) => setForecastType(e.target.value as ForecastType)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="SEASONAL">Seasonal</option>
            </select>
          </div>

          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mt-6">
            Generate Forecast
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'forecasts', name: 'Forecasts', count: forecasts.length },
            { id: 'patterns', name: 'Demand Patterns', count: demandPatterns.length },
            { id: 'analytics', name: 'Analytics', count: null },
            { id: 'planning', name: 'Capacity Planning', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'forecasts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Provider Forecasts</h3>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                Create Forecast
              </button>
            </div>
            
            {forecasts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No forecasts available</p>
            ) : (
              <div className="space-y-4">
                {forecasts.map((forecast) => (
                  <div key={forecast.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{forecast.agency.name}</h4>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {forecast.forecastType}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(forecast.forecastDate)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getUtilizationColor(forecast.capacityUtilization)}`}>
                          {forecast.capacityUtilization.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">utilization</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Predicted Demand</div>
                        <div className="text-lg font-semibold text-gray-900">{forecast.predictedDemand}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Available Capacity</div>
                        <div className="text-lg font-semibold text-gray-900">{forecast.availableCapacity}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Confidence</div>
                        <div className="text-lg font-semibold text-gray-900">{(forecast.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    
                    {forecast.recommendations && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="text-sm text-blue-800">
                          <strong>Recommendation:</strong> {forecast.recommendations}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Demand Patterns</h3>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                Add Pattern
              </button>
            </div>
            
            {demandPatterns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No demand patterns available</p>
            ) : (
              <div className="space-y-4">
                {demandPatterns.map((pattern) => (
                  <div key={pattern.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{pattern.facility.name}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {pattern.patternType}
                        </span>
                        {pattern.dayOfWeek !== undefined && (
                          <span className="text-sm text-gray-500">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][pattern.dayOfWeek]}
                          </span>
                        )}
                        {pattern.hourOfDay !== undefined && (
                          <span className="text-sm text-gray-500">
                            {pattern.hourOfDay}:00
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(pattern.trendDirection)}
                        <span className="text-sm text-gray-500">{pattern.trendDirection}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Average Demand</div>
                        <div className="text-lg font-semibold text-gray-900">{pattern.averageDemand.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Peak Demand</div>
                        <div className="text-lg font-semibold text-gray-900">{pattern.peakDemand}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Seasonal Factor</div>
                        <div className="text-lg font-semibold text-gray-900">{pattern.seasonalFactor.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Confidence</div>
                        <div className="text-lg font-semibold text-gray-900">{(pattern.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Based on {pattern.dataPoints} data points • Last updated {formatDate(pattern.lastUpdated)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Forecasting Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Capacity Utilization Trends</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today</span>
                    <span className="text-sm font-medium text-orange-600">85.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tomorrow</span>
                    <span className="text-sm font-medium text-yellow-600">78.6%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="text-sm font-medium text-green-600">72.3%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Demand Predictions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Peak Hours</span>
                    <span className="text-sm font-medium text-gray-900">14:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Peak Days</span>
                    <span className="text-sm font-medium text-gray-900">Monday, Friday</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Seasonal Peak</span>
                    <span className="text-sm font-medium text-gray-900">Winter (Dec-Feb)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Forecast Accuracy</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Daily Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-gray-600">Weekly Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">78%</div>
                  <div className="text-sm text-gray-600">Monthly Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Capacity Planning</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Resource Recommendations</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Add 2 BLS units during peak hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Extend operating hours on weekends</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Increase CCT capacity by 25%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">High Demand Risk</span>
                    <span className="text-sm font-medium text-red-600">Medium</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Capacity Shortage</span>
                    <span className="text-sm font-medium text-yellow-600">Low</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Resource Availability</span>
                    <span className="text-sm font-medium text-green-600">Good</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Planning Actions</h4>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                  Generate Capacity Plan
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                  Schedule Resource Allocation
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm">
                  Export Planning Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportProviderForecasting;
