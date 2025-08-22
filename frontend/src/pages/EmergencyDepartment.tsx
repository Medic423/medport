import React, { useState } from 'react';
import EmergencyDepartmentDashboard from '../components/EmergencyDepartmentDashboard';
import TransportProviderForecasting from '../components/TransportProviderForecasting';

const EmergencyDepartment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecasting'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Emergency Department Optimization</h1>
          <p className="mt-2 text-lg text-gray-600">
            High-volume transport management and provider forecasting for emergency departments
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>ED Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('forecasting')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'forecasting'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Provider Forecasting</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Emergency Department Dashboard</h2>
                <p className="text-gray-600">
                  Real-time monitoring of ED capacity, transport queues, and capacity alerts. 
                  Manage bed status and coordinate high-volume transport requests.
                </p>
              </div>
              <EmergencyDepartmentDashboard />
            </div>
          )}

          {activeTab === 'forecasting' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Transport Provider Forecasting</h2>
                <p className="text-gray-600">
                  Advanced analytics for demand prediction, capacity planning, and resource optimization. 
                  Generate forecasts and analyze demand patterns to optimize transport provider operations.
                </p>
              </div>
              <TransportProviderForecasting />
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phase 2.7 Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">High-Volume Transport Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time ED transport queue monitoring</li>
                <li>• Bed status integration and hallway bed tracking</li>
                <li>• Capacity alerts and threshold notifications</li>
                <li>• Transport queue priority management</li>
                <li>• Multiple simultaneous transport coordination</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Transport Provider Forecasting</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Demand prediction algorithms and analytics</li>
                <li>• Provider capacity planning tools</li>
                <li>• Peak demand management system</li>
                <li>• Seasonal and trend analysis</li>
                <li>• Resource optimization recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDepartment;
