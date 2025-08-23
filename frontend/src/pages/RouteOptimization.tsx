import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import RouteOptimizationDashboard from '../components/RouteOptimizationDashboard';
import OptimizationControls from '../components/OptimizationControls';
import RouteCardInterface from '../components/RouteCardInterface';
import OptimizationAnalytics from '../components/OptimizationAnalytics';

export interface RouteOptimizationRequest {
  timeWindowStart: Date;
  timeWindowEnd: Date;
  maxDistance?: number;
  transportLevels?: string[];
  priorities?: string[];
  agencyId?: string;
  optimizationType?: string;
  constraints?: {
    maxDuration?: number;
    maxStops?: number;
    minRevenue?: number;
    avoidHighways?: boolean;
    preferReturnTrips?: boolean;
  };
}

export interface ChainedTripOpportunity {
  id: string;
  routeType: string;
  totalDistance: number;
  totalTime: number;
  milesSaved: number;
  unitsSaved: number;
  revenuePotential: number;
  revenueIncrease: number;
  optimizationScore: number;
  transportRequests: any[];
  routeStops: any[];
  chainingDetails: {
    type: string;
    description: string;
    benefits: string[];
  };
  estimatedStartTime: Date;
  estimatedEndTime: Date;
  timeWindowFlexibility: number;
  geographicEfficiency: number;
  temporalEfficiency: number;
}

export interface RouteOptimizationResult {
  opportunities: ChainedTripOpportunity[];
  summary: {
    totalOpportunities: number;
    totalMilesSaved: number;
    totalRevenueIncrease: number;
    totalUnitsSaved: number;
    averageOptimizationScore: number;
    optimizationTypes: Record<string, number>;
  };
  recommendations: {
    highValue: ChainedTripOpportunity[];
    quickWins: ChainedTripOpportunity[];
    longTerm: ChainedTripOpportunity[];
  };
  performance: {
    calculationTime: number;
    requestsAnalyzed: number;
    routesGenerated: number;
  };
}

const RouteOptimization: React.FC = () => {
  const { user } = useAuth();
  const [optimizationRequest, setOptimizationRequest] = useState<RouteOptimizationRequest>({
    timeWindowStart: new Date(Date.now() - 12 * 60 * 60 * 1000), // Last 12 hours
    timeWindowEnd: new Date(Date.now() + 12 * 60 * 60 * 1000), // Next 12 hours
    transportLevels: ['BLS', 'ALS', 'CCT'],
    priorities: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    constraints: {
      maxDuration: 240, // 4 hours
      maxStops: 10,
      minRevenue: 25,
      preferReturnTrips: true,
    }
  });

  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'controls' | 'results' | 'analytics'>('dashboard');
  const [selectedOpportunity, setSelectedOpportunity] = useState<ChainedTripOpportunity | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check demo mode on component mount
  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
    
    // If no token and not in demo mode, automatically enable demo mode
    if (!localStorage.getItem('token') && !demoMode) {
      localStorage.setItem('demoMode', 'true');
      setIsDemoMode(true);
    }
  }, []);

  const handleOptimizationRequest = async (request: RouteOptimizationRequest) => {
    setIsOptimizing(true);
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (isDemoMode) {
        headers['Authorization'] = 'demo-token';
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Set demo mode and try again
        localStorage.setItem('demoMode', 'true');
        headers['Authorization'] = 'demo-token';
      }

      const response = await fetch('/api/route-optimization/optimize', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...request,
          timeWindowStart: request.timeWindowStart.toISOString(),
          timeWindowEnd: request.timeWindowEnd.toISOString(),
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOptimizationResult(result.data);
        setActiveTab('results');
      } else {
        const error = await response.json();
        console.error('Optimization failed:', error);
        
        // Better error handling
        let errorMessage = 'Unknown error occurred';
        if (error.error) {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.details && Array.isArray(error.details)) {
          errorMessage = error.details.join(', ');
        }
        
        alert(`Optimization failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error during optimization:', error);
      alert('Error during optimization. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleQuickOptimize = async (transportRequestIds: string[]) => {
    setIsOptimizing(true);
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (isDemoMode) {
        headers['Authorization'] = 'demo-token';
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Set demo mode and try again
        localStorage.setItem('demoMode', 'true');
        headers['Authorization'] = 'demo-token';
      }

      const response = await fetch('/api/route-optimization/quick-optimize', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transportRequestIds,
          maxTimeWindow: 120 // 2 hours
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOptimizationResult(result.data);
        setActiveTab('results');
      } else {
        const error = await response.json();
        console.error('Quick optimization failed:', error);
        alert(`Quick optimization failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error during quick optimization:', error);
      alert('Error during quick optimization. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAcceptOpportunity = async (opportunity: ChainedTripOpportunity) => {
    try {
      const response = await fetch(`/api/route-optimization/opportunities/${opportunity.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          agencyId: user?.agencyId || 'demo-agency',
          notes: 'Accepted via route optimization interface'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Opportunity accepted successfully! Route has been created.');
        console.log('Route created:', result.data.route);
      } else {
        const error = await response.json();
        console.error('Failed to accept opportunity:', error);
        alert(`Failed to accept opportunity: ${error.error}`);
      }
    } catch (error) {
      console.error('Error accepting opportunity:', error);
      alert('Error accepting opportunity. Please try again.');
    }
  };

  const handleRejectOpportunity = async (opportunity: ChainedTripOpportunity, reason: string) => {
    try {
      const response = await fetch(`/api/route-optimization/opportunities/${opportunity.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reason,
          feedback: 'Rejected via route optimization interface'
        })
      });

      if (response.ok) {
        alert('Opportunity rejected successfully.');
        // Remove from results
        if (optimizationResult) {
          setOptimizationResult({
            ...optimizationResult,
            opportunities: optimizationResult.opportunities.filter(opp => opp.id !== opportunity.id)
          });
        }
      } else {
        const error = await response.json();
        console.error('Failed to reject opportunity:', error);
        alert(`Failed to reject opportunity: ${error.error}`);
      }
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
      alert('Error rejecting opportunity. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Route Optimization Engine</h1>
              <p className="mt-2 text-sm text-gray-600">
                Advanced route optimization and chaining opportunities for maximum revenue
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || 'Demo User'}
                </div>
                <div className="text-sm text-gray-500">
                  {user?.role || 'COORDINATOR'}
                </div>
                {isDemoMode && (
                  <div className="text-xs text-blue-600 font-medium">
                    Demo Mode
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'controls'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Optimization Controls
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Results & Route Cards
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <RouteOptimizationDashboard
            optimizationRequest={optimizationRequest}
            optimizationResult={optimizationResult}
            isOptimizing={isOptimizing}
            onQuickOptimize={handleQuickOptimize}
            onStartOptimization={() => setActiveTab('controls')}
          />
        )}

        {activeTab === 'controls' && (
          <OptimizationControls
            optimizationRequest={optimizationRequest}
            onOptimizationRequest={handleOptimizationRequest}
            isOptimizing={isOptimizing}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'results' && (
          <RouteCardInterface
            optimizationResult={optimizationResult}
            selectedOpportunity={selectedOpportunity}
            onSelectOpportunity={setSelectedOpportunity}
            onAcceptOpportunity={handleAcceptOpportunity}
            onRejectOpportunity={handleRejectOpportunity}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'analytics' && (
          <OptimizationAnalytics
            optimizationResult={optimizationResult}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </div>

      {/* Loading Overlay */}
      {isOptimizing && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Optimizing Routes
            </h3>
            <p className="text-gray-600">
              Analyzing transport requests and identifying chaining opportunities...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteOptimization;
