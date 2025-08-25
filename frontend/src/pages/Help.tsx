import React from 'react';

interface HelpProps {
  onNavigate?: (page: string) => void;
}

const Help: React.FC<HelpProps> = ({ onNavigate }) => {
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">MedPort</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The comprehensive medical transport coordination system that optimizes ambulance availability, 
              loaded miles, and routing efficiency across hospital service areas.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleNavigate('transport-requests')}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Get Started →
              </button>
              <button
                onClick={() => handleNavigate('status-board')}
                className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium transition-all duration-200"
              >
                View Status Board
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">System Capabilities</h2>
          <p className="text-lg text-gray-600">Comprehensive features designed for modern medical transport coordination</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Transport Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Transport Management</h3>
            <p className="text-gray-600 mb-4">Complete transport request system with HIPAA compliance, real-time status tracking, and workflow management.</p>
            <button
              onClick={() => handleNavigate('transport-requests')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn More →
            </button>
          </div>

          {/* Resource Optimization */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Resource Optimization</h3>
            <p className="text-gray-600 mb-4">Advanced route optimization, unit assignment algorithms, and revenue maximization for transport agencies.</p>
            <button
              onClick={() => handleNavigate('route-optimization')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Learn More →
            </button>
          </div>

          {/* Real-Time Monitoring */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Monitoring</h3>
            <p className="text-gray-600 mb-4">Live status board, resource tracking, and comprehensive analytics for operational insights.</p>
            <button
              onClick={() => handleNavigate('status-board')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Learn More →
            </button>
          </div>

          {/* Agency Integration */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-emerald-100 p-3 rounded-lg w-fit mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Agency Integration</h3>
            <p className="text-gray-600 mb-4">Complete portal for transport agencies with bidding, performance tracking, and service management.</p>
            <button
              onClick={() => handleNavigate('agency-login')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Learn More →
            </button>
          </div>

          {/* Advanced Transport */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Transport</h3>
            <p className="text-gray-600 mb-4">Multi-patient coordination, long-distance planning, and specialized transport services.</p>
            <button
              onClick={() => handleNavigate('advanced-transport')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Learn More →
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 004 6v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Notifications</h3>
            <p className="text-gray-600 mb-4">Automated SMS, email, and push notifications for urgent requests and status updates.</p>
            <button
              onClick={() => handleNavigate('notifications')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Learn More →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Access</h2>
            <p className="text-lg text-gray-600">Jump directly to the tools you need</p>
          </div>
          
          {/* Dispatch Operations */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-2">🚑</span> Dispatch Operations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleNavigate('transport-requests')}
                className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-blue-600 font-semibold mb-2">📋 Transport Requests</div>
                <div className="text-sm text-blue-600">Create & manage</div>
              </button>
              
              <button
                onClick={() => handleNavigate('status-board')}
                className="p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-green-600 font-semibold mb-2">📊 Status Board</div>
                <div className="text-sm text-green-600">Live monitoring</div>
              </button>
              
              <button
                onClick={() => handleNavigate('unit-assignment')}
                className="p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-purple-600 font-semibold mb-2">🚗 Unit Assignment</div>
                <div className="text-sm text-purple-600">Optimize assignments</div>
              </button>
              
              <button
                onClick={() => handleNavigate('route-optimization')}
                className="p-6 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-indigo-600 font-semibold mb-2">🗺️ Route Optimization</div>
                <div className="text-sm text-indigo-600">Maximize efficiency</div>
              </button>
            </div>
          </div>

          {/* Financial Planning */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-2">💰</span> Financial Planning
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleNavigate('analytics')}
                className="p-6 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-teal-600 font-semibold mb-2">📈 Analytics</div>
                <div className="text-sm text-teal-600">Performance insights</div>
              </button>
              
              <button
                onClick={() => handleNavigate('resource-management')}
                className="p-6 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-emerald-600 font-semibold mb-2">🏥 Resource Management</div>
                <div className="text-sm text-emerald-600">Capacity planning</div>
              </button>
            </div>
          </div>

          {/* Tools and Utilities */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-2">🛠️</span> Tools and Utilities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleNavigate('qr-code-system')}
                className="p-6 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-indigo-600 font-semibold mb-2">📱 QR Code System</div>
                <div className="text-sm text-indigo-600">Generate & scan</div>
              </button>
              
              <button
                onClick={() => handleNavigate('real-time-tracking')}
                className="p-6 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-red-600 font-semibold mb-2">📍 Real-Time Tracking</div>
                <div className="text-sm text-red-600">Live unit monitoring</div>
              </button>
              
              <button
                onClick={() => handleNavigate('notifications')}
                className="p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-orange-600 font-semibold mb-2">🔔 Notifications</div>
                <div className="text-sm text-orange-600">Smart alerts</div>
              </button>
              
              <button
                onClick={() => handleNavigate('offline-capabilities')}
                className="p-6 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-amber-600 font-semibold mb-2">📱 Offline Capabilities</div>
                <div className="text-sm text-amber-600">Work without internet</div>
              </button>
              
              <button
                onClick={() => handleNavigate('settings')}
                className="p-6 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-gray-600 font-semibold mb-2">⚙️ Settings</div>
                <div className="text-sm text-gray-600">System configuration</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
