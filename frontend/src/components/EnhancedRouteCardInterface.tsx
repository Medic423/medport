import React, { useState, useEffect } from 'react';
import { ChainedTripOpportunity } from '../pages/RouteOptimization';

interface EnhancedRouteCardInterfaceProps {
  opportunities: ChainedTripOpportunity[];
  onBack: () => void;
}

interface EnhancedRouteCard {
  id: string;
  routeType: string;
  optimizationScore: number;
  routeSummary: {
    totalDistance: number;
    totalTime: number;
    milesSaved: number;
    unitsSaved: number;
    revenueIncrease: number;
    fuelSavings: number;
    carbonFootprintReduction: number;
  };
  routeDetails: {
    stops: RouteStopDetail[];
    waypoints: Waypoint[];
    estimatedTimeline: TimelineEvent[];
    constraints: RouteConstraint[];
  };
  financialAnalysis: {
    revenuePotential: number;
    costSavings: number;
    profitMargin: number;
    roi: number;
    breakEvenAnalysis: BreakEvenPoint[];
  };
  operationalMetrics: {
    efficiencyScore: number;
    reliabilityScore: number;
    riskAssessment: RiskFactor[];
    recommendations: string[];
  };
  comparisonData: {
    baselineMetrics: RouteMetrics;
    optimizedMetrics: RouteMetrics;
    improvementPercentages: ImprovementMetrics;
  };
}

interface RouteStopDetail {
  stopNumber: number;
  facilityId: string;
  facilityName: string;
  stopType: string;
  estimatedArrival: Date;
  estimatedDeparture: Date;
  patientCount: number;
  specialRequirements: string[];
  estimatedDuration: number;
}

interface Waypoint {
  latitude: number;
  longitude: number;
  description: string;
  estimatedTime: Date;
  distanceFromPrevious: number;
  trafficConditions: string;
  weatherConditions: string;
}

interface TimelineEvent {
  eventType: string;
  location: string;
  estimatedTime: Date;
  actualTime?: Date;
  status: string;
  notes: string;
}

interface RouteConstraint {
  type: string;
  description: string;
  severity: string;
  impact: string;
  mitigation: string;
}

interface BreakEvenPoint {
  metric: string;
  threshold: number;
  currentValue: number;
  projectedValue: number;
  timeline: Date;
}

interface RiskFactor {
  category: string;
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
}

interface RouteMetrics {
  distance: number;
  time: number;
  cost: number;
  revenue: number;
  efficiency: number;
}

interface ImprovementMetrics {
  distance: number;
  time: number;
  cost: number;
  revenue: number;
  efficiency: number;
}

const EnhancedRouteCardInterface: React.FC<EnhancedRouteCardInterfaceProps> = ({
  opportunities,
  onBack
}) => {
  const [enhancedCards, setEnhancedCards] = useState<EnhancedRouteCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV' | 'JSON' | 'EXCEL'>('PDF');
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeMaps: true,
    includeFinancials: true,
    includeTimeline: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'comparison' | 'export' | 'analytics'>('cards');

  useEffect(() => {
    if (opportunities.length > 0) {
      generateEnhancedCards();
    } else {
      // Generate demo cards when no opportunities exist
      generateDemoCards();
    }
  }, [opportunities]);

  const generateEnhancedCards = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/route-card-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('demoMode') === 'true' ? 'demo-token' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          opportunityIds: opportunities.map(opp => opp.id),
          exportOptions
        })
      });

      if (response.ok) {
        const result = await response.json();
        setEnhancedCards(result.data.routeCards);
      } else {
        console.error('Failed to generate enhanced route cards');
      }
    } catch (error) {
      console.error('Error generating enhanced route cards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDemoCards = async () => {
    setIsGenerating(true);
    try {
      // Generate demo cards with mock opportunity IDs
      const response = await fetch('/api/route-card-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('demoMode') === 'true' ? 'demo-token' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          opportunityIds: ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'],
          exportOptions
        })
      });

      if (response.ok) {
        const result = await response.json();
        setEnhancedCards(result.data.routeCards);
      } else {
        console.error('Failed to generate demo route cards');
      }
    } catch (error) {
      console.error('Error generating demo route cards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleExport = async () => {
    if (selectedCards.length === 0) {
      alert('Please select at least one route card to export');
      return;
    }

    try {
      const response = await fetch('/api/route-card-generation/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('demoMode') === 'true' ? 'demo-token' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          routeCardIds: selectedCards,
          format: exportFormat,
          ...exportOptions
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `route-cards.${exportFormat.toLowerCase()}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting route cards:', error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Generating enhanced route cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Route Card Generation</h2>
          <p className="text-gray-600">
            {enhancedCards.length} enhanced route cards generated
          </p>
          {enhancedCards.length === 0 && (
            <button
              onClick={generateDemoCards}
              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generate Demo Cards
            </button>
          )}
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'cards', name: 'Route Cards', count: enhancedCards.length },
            { id: 'comparison', name: 'Comparison', count: selectedCards.length },
            { id: 'export', name: 'Export', count: selectedCards.length },
            { id: 'analytics', name: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enhancedCards.map((card) => (
            <div
              key={card.id}
              className={`bg-white rounded-lg shadow-lg border-2 transition-all cursor-pointer ${
                selectedCards.includes(card.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCardSelection(card.id)}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {card.routeType.replace('_', ' ')}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      Enhanced Route Card
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      card.optimizationScore >= 80 ? 'text-green-600' : 
                      card.optimizationScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {card.optimizationScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                </div>

                {/* Enhanced Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {card.routeSummary.milesSaved.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Miles Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">
                      ${card.routeSummary.revenueIncrease.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Revenue Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      ${card.routeSummary.fuelSavings.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Fuel Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {card.routeSummary.carbonFootprintReduction.toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500">CO2 Reduced</div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Financial Analysis */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Analysis</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ROI:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {card.financialAnalysis.roi.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Profit Margin:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        {card.financialAnalysis.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operational Metrics */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Operational Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Efficiency:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {card.operationalMetrics.efficiencyScore.toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reliability:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        {card.operationalMetrics.reliabilityScore.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Constraints */}
                {card.routeDetails.constraints.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Constraints</h4>
                    <div className="space-y-2">
                      {card.routeDetails.constraints.slice(0, 2).map((constraint, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(constraint.severity)}`}>
                            {constraint.type}
                          </span>
                          <span className="text-xs text-gray-600">{constraint.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                <div className="text-center">
                  {selectedCards.includes(card.id) ? (
                    <div className="inline-flex items-center text-green-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Selected
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Click to select</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Route Comparison</h3>
          {selectedCards.length < 2 ? (
            <p className="text-gray-600">Select at least 2 route cards to compare</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Comparing {selectedCards.length} route cards
                </p>
                <div className="text-sm text-gray-500">
                  {selectedCards.length} selected
                </div>
              </div>
              
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metric
                      </th>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <th key={cardId} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {card?.routeType.replace('_', ' ') || 'Route'}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Optimization Score */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Optimization Score
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (card?.optimizationScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                              (card?.optimizationScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {card?.optimizationScore.toFixed(1) || '0'}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Financial Metrics */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Revenue Increase
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="text-green-600 font-medium">
                              +${card?.financialAnalysis.revenueIncrease.toFixed(0) || '0'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Cost Savings
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="text-blue-600 font-medium">
                              ${card?.financialAnalysis.costSavings.toFixed(0) || '0'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ROI
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="text-green-600 font-medium">
                              {card?.financialAnalysis.roi.toFixed(1) || '0'}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Operational Metrics */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Distance Saved
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="text-blue-600 font-medium">
                              {card?.routeMetrics.distance.toFixed(0)} miles
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Time Saved
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="text-blue-600 font-medium">
                              {formatTime(card?.routeMetrics.time || 0)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Efficiency Score
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (card?.operationalMetrics.efficiencyScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                              (card?.operationalMetrics.efficiencyScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {card?.operationalMetrics.efficiencyScore.toFixed(0) || '0'}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Environmental Impact */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        CO2 Reduction
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="text-green-600 font-medium">
                              {card?.routeDetails.fuelSavings.toFixed(1) || '0'} lbs
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Route Details */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Stops
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {card?.routeDetails.stops.length || 0} stops
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Constraints
                      </td>
                      {selectedCards.map(cardId => {
                        const card = enhancedCards.find(c => c.id === cardId);
                        return (
                          <td key={cardId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {card?.routeDetails.constraints.length || 0} constraints
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Comparison */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Comparison Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Best Score:</span>
                    <div className="text-blue-900">
                      {(() => {
                        const bestCard = enhancedCards
                          .filter(c => selectedCards.includes(c.id))
                          .reduce((best, current) => 
                            (current.optimizationScore > best.optimizationScore) ? current : best
                          );
                        return bestCard ? `${bestCard.optimizationScore.toFixed(1)}%` : 'N/A';
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Highest Revenue:</span>
                    <div className="text-blue-900">
                      {(() => {
                        const bestCard = enhancedCards
                          .filter(c => selectedCards.includes(c.id))
                          .reduce((best, current) => 
                            (current.financialAnalysis.revenueIncrease > best.financialAnalysis.revenueIncrease) ? current : best
                          );
                        return bestCard ? `+$${bestCard.financialAnalysis.revenueIncrease.toFixed(0)}` : 'N/A';
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Most Efficient:</span>
                    <div className="text-blue-900">
                      {(() => {
                        const bestCard = enhancedCards
                          .filter(c => selectedCards.includes(c.id))
                          .reduce((best, current) => 
                            (current.operationalMetrics.efficiencyScore > best.operationalMetrics.efficiencyScore) ? current : best
                          );
                        return bestCard ? `${bestCard.operationalMetrics.efficiencyScore.toFixed(0)}%` : 'N/A';
                      })()}
                    </div>
                  </div>
                                       <div>
                       <span className="text-blue-600 font-medium">Best ROI:</span>
                       <div className="text-blue-900">
                         {(() => {
                           const bestCard = enhancedCards
                             .filter(c => selectedCards.includes(c.id))
                             .reduce((best, current) => 
                               (current.financialAnalysis.roi > best.financialAnalysis.roi) ? current : best
                             );
                           return bestCard ? `${bestCard.financialAnalysis.roi.toFixed(1)}%` : 'N/A';
                         })()}
                       </div>
                     </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Route Cards</h3>
          {selectedCards.length === 0 ? (
            <p className="text-gray-600">Select route cards to export</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PDF">PDF</option>
                  <option value="CSV">CSV</option>
                  <option value="JSON">JSON</option>
                  <option value="EXCEL">Excel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCharts}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include Charts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMaps}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeMaps: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include Maps</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFinancials}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeFinancials: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include Financials</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTimeline}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimeline: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include Timeline</span>
                </label>
              </div>

              <button
                onClick={handleExport}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Export {selectedCards.length} Route Card{selectedCards.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Route Card Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{enhancedCards.length}</div>
              <div className="text-sm text-gray-600">Cards Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {enhancedCards.reduce((sum, card) => sum + card.routeSummary.milesSaved, 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Total Miles Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                ${enhancedCards.reduce((sum, card) => sum + card.routeSummary.revenueIncrease, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue Increase</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRouteCardInterface;
