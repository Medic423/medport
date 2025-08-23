import React, { useState, useEffect } from 'react';
import { RouteOptimizationResult } from '../pages/RouteOptimization';

interface OptimizationAnalyticsProps {
  optimizationResult: RouteOptimizationResult | null;
  onBack: () => void;
}

const OptimizationAnalytics: React.FC<OptimizationAnalyticsProps> = ({
  optimizationResult,
  onBack
}) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');

  useEffect(() => {
    if (optimizationResult) {
      generateAnalyticsData();
    }
  }, [optimizationResult]);

  const generateAnalyticsData = () => {
    if (!optimizationResult) return;

    // Generate mock analytics data based on optimization results
    const data = {
      performanceMetrics: {
        averageCalculationTime: optimizationResult.performance.calculationTime,
        requestsPerMinute: Math.round(optimizationResult.performance.requestsAnalyzed / (optimizationResult.performance.calculationTime / 1000 / 60)),
        opportunitiesPerRequest: optimizationResult.performance.routesGenerated / optimizationResult.performance.requestsAnalyzed,
        successRate: 85 + Math.random() * 10, // Mock success rate
      },
      optimizationTrends: {
        daily: generateDailyTrends(),
        weekly: generateWeeklyTrends(),
        monthly: generateMonthlyTrends(),
      },
      revenueAnalysis: {
        totalRevenue: optimizationResult.summary.totalRevenueIncrease,
        averagePerOpportunity: optimizationResult.summary.totalRevenueIncrease / optimizationResult.summary.totalOpportunities,
        topPerformingTypes: getTopPerformingTypes(),
        revenueByDistance: generateRevenueByDistance(),
      },
      efficiencyMetrics: {
        averageMilesSaved: optimizationResult.summary.totalMilesSaved / optimizationResult.summary.totalOpportunities,
        averageUnitsSaved: optimizationResult.summary.totalUnitsSaved / optimizationResult.summary.totalOpportunities,
        geographicEfficiency: calculateGeographicEfficiency(),
        temporalEfficiency: calculateTemporalEfficiency(),
      }
    };

    setAnalyticsData(data);
  };

  const generateDailyTrends = () => {
    const trends = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      trends.push({
        date: date.toLocaleDateString(),
        opportunities: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 500) + 100,
        milesSaved: Math.floor(Math.random() * 50) + 10,
      });
    }
    return trends;
  };

  const generateWeeklyTrends = () => {
    const trends = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      trends.push({
        week: `Week ${Math.ceil((date.getDate() + date.getDay()) / 7)}`,
        opportunities: Math.floor(Math.random() * 100) + 20,
        revenue: Math.floor(Math.random() * 2000) + 500,
        milesSaved: Math.floor(Math.random() * 200) + 50,
      });
    }
    return trends;
  };

  const generateMonthlyTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      opportunities: Math.floor(Math.random() * 400) + 100,
      revenue: Math.floor(Math.random() * 8000) + 2000,
      milesSaved: Math.floor(Math.random() * 800) + 200,
    }));
  };

  const getTopPerformingTypes = () => {
    if (!optimizationResult) return [];
    
    return Object.entries(optimizationResult.summary.optimizationTypes)
      .map(([type, count]) => ({
        type: type.replace('_', ' '),
        count,
        averageScore: Math.floor(Math.random() * 30) + 70, // Mock average score
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const generateRevenueByDistance = () => {
    const ranges = ['0-25', '26-50', '51-100', '101-200', '200+'];
    return ranges.map(range => ({
      range,
      revenue: Math.floor(Math.random() * 1000) + 100,
      opportunities: Math.floor(Math.random() * 20) + 5,
    }));
  };

  const calculateGeographicEfficiency = () => {
    if (!optimizationResult) return 0;
    
    const opportunities = optimizationResult.opportunities;
    if (opportunities.length === 0) return 0;
    
    const totalEfficiency = opportunities.reduce((sum, opp) => sum + opp.geographicEfficiency, 0);
    return totalEfficiency / opportunities.length;
  };

  const calculateTemporalEfficiency = () => {
    if (!optimizationResult) return 0;
    
    const opportunities = optimizationResult.opportunities;
    if (opportunities.length === 0) return 0;
    
    const totalEfficiency = opportunities.reduce((sum, opp) => sum + opp.temporalEfficiency, 0);
    return totalEfficiency / opportunities.length;
  };

  if (!optimizationResult || !analyticsData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600 mb-4">Run an optimization to see analytics</p>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Optimization Analytics</h2>
          <p className="text-gray-600">
            Detailed performance metrics and optimization insights
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
          </select>
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
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Calculation Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.performanceMetrics.averageCalculationTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.performanceMetrics.successRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Opportunities/Request</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.performanceMetrics.opportunitiesPerRequest.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Requests/Minute</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.performanceMetrics.requestsPerMinute}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daily Trends</h3>
            <p className="text-sm text-gray-600">Opportunities and revenue over the last 7 days</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.optimizationTrends.daily.map((trend: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{trend.date}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{trend.opportunities} opps</span>
                    <span className="text-sm text-green-600">${trend.revenue}</span>
                    <span className="text-sm text-blue-600">{trend.milesSaved} mi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Types */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Types</h3>
            <p className="text-sm text-gray-600">Optimization types by success rate</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.revenueAnalysis.topPerformingTypes.map((type: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{type.type}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{type.count} routes</span>
                    <span className="text-sm text-green-600">{type.averageScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Distance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Revenue by Distance</h3>
            <p className="text-sm text-gray-600">Revenue generation across distance ranges</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.revenueAnalysis.revenueByDistance.map((range: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{range.range} miles</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{range.opportunities} opps</span>
                    <span className="text-sm text-green-600">${range.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Efficiency Metrics</h3>
            <p className="text-sm text-gray-600">Geographic and temporal efficiency scores</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Geographic Efficiency</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {analyticsData.efficiencyMetrics.geographicEfficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${analyticsData.efficiencyMetrics.geographicEfficiency}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Temporal Efficiency</span>
                  <span className="text-sm font-semibold text-green-600">
                    {analyticsData.efficiencyMetrics.temporalEfficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analyticsData.efficiencyMetrics.temporalEfficiency}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {analyticsData.efficiencyMetrics.averageMilesSaved.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Avg Miles Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">
                    {analyticsData.efficiencyMetrics.averageUnitsSaved.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Avg Units Saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Optimization Recommendations</h3>
          <p className="text-sm text-gray-600">AI-powered suggestions for improving route optimization</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Increase Time Window Flexibility</p>
                <p className="text-sm text-gray-600">
                  Consider expanding time windows by 1-2 hours to capture more chaining opportunities
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Focus on Return Trip Optimization</p>
                <p className="text-sm text-gray-600">
                  Return trips show 23% higher efficiency. Prioritize these opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Review Geographic Constraints</p>
                <p className="text-sm text-gray-600">
                  Current geographic efficiency is below target. Consider relaxing distance constraints.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationAnalytics;
