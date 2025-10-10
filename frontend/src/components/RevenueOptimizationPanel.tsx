import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Link, 
  Activity, 
  Target, 
  BarChart3
} from 'lucide-react';
import api from '../services/api';
import { asNumber, toFixed, toPercentage, toCurrency } from '../utils/numberUtils';

interface OptimizationMetrics {
  totalRevenue: number;
  revenuePerHour: number;
  loadedMileRatio: number;
  backhaulPairs: number;
  averageEfficiency: number;
  potentialRevenueIncrease: number;
  totalTrips: number;
  averageRevenuePerTrip: number;
  totalMiles: number;
  loadedMiles: number;
}

interface BackhaulPair {
  request1: any;
  request2: any;
  distance: number;
  timeWindow: number;
  efficiency: number;
  revenueBonus: number;
}

interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  status: string;
  capabilities: string[];
  currentLocation: any;
  shiftStart: string;
  shiftEnd: string;
}

interface RevenueOptimizationPanelProps {
  showBackhaulPairs?: boolean;
  showUnitManagement?: boolean;
  title?: string;
  className?: string;
}

const RevenueOptimizationPanel: React.FC<RevenueOptimizationPanelProps> = ({
  showBackhaulPairs = true,
  showUnitManagement = true,
  title = "Revenue Optimization",
  className = ""
}) => {
  const [optimizationMetrics, setOptimizationMetrics] = useState<OptimizationMetrics | null>(null);
  const [backhaulPairs, setBackhaulPairs] = useState<BackhaulPair[]>([]);
  const [, setUnits] = useState<Unit[]>([]);
  const [unitsAnalytics, setUnitsAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptimizationData();
  }, []);

  const loadOptimizationData = async () => {
    try {
      setLoading(true);
      
      // Load revenue analytics
      const revenueResponse = await api.get('/api/optimize/revenue?timeframe=24h');
      if (revenueResponse.data.success) {
        setOptimizationMetrics({
          totalRevenue: asNumber(revenueResponse.data.data.totalRevenue, 0),
          revenuePerHour: asNumber(revenueResponse.data.data.revenuePerHour, 0),
          loadedMileRatio: asNumber(revenueResponse.data.data.loadedMileRatio, 0),
          backhaulPairs: 0, // Will be updated from backhaul data
          averageEfficiency: 0.75, // Mock data
          potentialRevenueIncrease: 0, // Will be calculated
          totalTrips: asNumber(revenueResponse.data.data.totalTrips, 0),
          averageRevenuePerTrip: asNumber(revenueResponse.data.data.averageRevenuePerTrip, 0),
          totalMiles: asNumber(revenueResponse.data.data.totalMiles, 0),
          loadedMiles: asNumber(revenueResponse.data.data.loadedMiles, 0),
        });
      }

      // Load backhaul opportunities
      const backhaulResponse = await api.get('/api/optimize/backhaul');
      if (backhaulResponse.data.success) {
        setBackhaulPairs(backhaulResponse.data.data.pairs || []);
        // Update metrics with backhaul data
        setOptimizationMetrics(prev => prev ? {
          ...prev,
          backhaulPairs: backhaulResponse.data.data.pairs?.length || 0,
          potentialRevenueIncrease: backhaulResponse.data.data.pairs?.reduce((sum: number, pair: any) => sum + asNumber(pair.revenueBonus, 0), 0) || 0
        } : null);
      }

      // Load units data
      const unitsResponse = await api.get('/api/units');
      if (unitsResponse.data.success) {
        setUnits(unitsResponse.data.data || []);
      }

      // Load units analytics
      const unitsAnalyticsResponse = await api.get('/api/units/analytics');
      if (unitsAnalyticsResponse.data.success) {
        setUnitsAnalytics(unitsAnalyticsResponse.data.data);
      }

    } catch (error) {
      console.error('Error loading optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          {optimizationMetrics && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Revenue:</span>
                <span className="text-lg font-semibold text-gray-900">{toCurrency(optimizationMetrics.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue/Hour:</span>
                <span className="text-sm font-medium text-gray-900">{toCurrency(optimizationMetrics.revenuePerHour)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Loaded Mile Ratio:</span>
                <span className="text-sm font-medium text-gray-900">{toPercentage(optimizationMetrics.loadedMileRatio)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Trips:</span>
                <span className="text-sm font-medium text-gray-900">{optimizationMetrics.totalTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Revenue/Trip:</span>
                <span className="text-sm font-medium text-gray-900">{toCurrency(optimizationMetrics.averageRevenuePerTrip)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Backhaul Opportunities */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Backhaul Opportunities</h3>
            <Link className="h-6 w-6 text-blue-600" />
          </div>
          {optimizationMetrics && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Pairs:</span>
                <span className="text-lg font-semibold text-gray-900">{optimizationMetrics.backhaulPairs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Efficiency:</span>
                <span className="text-sm font-medium text-gray-900">{toPercentage(optimizationMetrics.averageEfficiency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Potential Increase:</span>
                <span className="text-sm font-medium text-green-600">+{toCurrency(optimizationMetrics.potentialRevenueIncrease)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Miles:</span>
                <span className="text-sm font-medium text-gray-900">{toFixed(optimizationMetrics.totalMiles, 1)} mi</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Loaded Miles:</span>
                <span className="text-sm font-medium text-gray-900">{toFixed(optimizationMetrics.loadedMiles, 1)} mi</span>
              </div>
            </div>
          )}
        </div>

        {/* Unit Management */}
        {showUnitManagement && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Unit Management</h3>
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Units:</span>
                <span className="text-lg font-semibold text-green-600">{unitsAnalytics?.availableUnits || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Committed Units:</span>
                <span className="text-sm font-medium text-yellow-600">{unitsAnalytics?.committedUnits || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Units:</span>
                <span className="text-sm font-medium text-gray-900">{unitsAnalytics?.totalUnits || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Out of Service:</span>
                <span className="text-sm font-medium text-red-600">{unitsAnalytics?.outOfServiceUnits || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Efficiency:</span>
                <span className="text-sm font-medium text-gray-900">{unitsAnalytics?.efficiency ? `${(unitsAnalytics.efficiency * 100).toFixed(1)}%` : '0%'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backhaul Pairs List */}
      {showBackhaulPairs && backhaulPairs.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recommended Backhaul Pairs</h3>
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {backhaulPairs.slice(0, 5).map((pair, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Link className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Pair #{index + 1}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Efficiency: {toPercentage(pair.efficiency)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">+{toCurrency(pair.revenueBonus)} bonus</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="bg-white rounded p-3">
                    <div className="font-medium text-gray-900 mb-1">Request 1</div>
                    <div>Patient: {pair.request1?.patientId || 'N/A'}</div>
                    <div>Level: {pair.request1?.transportLevel || 'N/A'}</div>
                    <div>Priority: {pair.request1?.priority || 'N/A'}</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-medium text-gray-900 mb-1">Request 2</div>
                    <div>Patient: {pair.request2?.patientId || 'N/A'}</div>
                    <div>Level: {pair.request2?.transportLevel || 'N/A'}</div>
                    <div>Priority: {pair.request2?.priority || 'N/A'}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Distance: {toFixed(pair.distance, 1)} mi</span>
                  <span>Time Window: {pair.timeWindow} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
          <BarChart3 className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {optimizationMetrics ? toPercentage(optimizationMetrics.loadedMileRatio) : '0.0%'}
            </div>
            <div className="text-sm text-gray-600">Loaded Mile Ratio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {optimizationMetrics ? toCurrency(optimizationMetrics.revenuePerHour, 0) : '$0'}/hr
            </div>
            <div className="text-sm text-gray-600">Revenue per Hour</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {optimizationMetrics ? optimizationMetrics.totalTrips : 0}
            </div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {backhaulPairs.length}
            </div>
            <div className="text-sm text-gray-600">Backhaul Pairs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueOptimizationPanel;
