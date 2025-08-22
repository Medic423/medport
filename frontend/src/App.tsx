import React, { useState } from 'react';
import TransportRequests from './pages/TransportRequests';
import StatusBoard from './pages/StatusBoard';
import DistanceMatrix from './pages/DistanceMatrix';
import ResourceManagement from './pages/ResourceManagement';
import AdvancedTransport from './pages/AdvancedTransport';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'transport-requests' | 'status-board' | 'distance-matrix' | 'resource-management' | 'advanced-transport'>('home');

  return (
    <div className="App">
      {/* Navigation Header */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">MedPort</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'home'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('transport-requests')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'transport-requests'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                Transport Requests
              </button>
              <button
                onClick={() => setCurrentPage('status-board')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'status-board'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                Status Board
              </button>
              <button
                onClick={() => setCurrentPage('distance-matrix')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'distance-matrix'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                Distance Matrix
              </button>
              <button
                onClick={() => setCurrentPage('resource-management')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'resource-management'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                Resource Management
              </button>
              <button
                onClick={() => setCurrentPage('advanced-transport')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'advanced-transport'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                Advanced Transport
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to MedPort!</h1>
              <p className="text-xl text-gray-600 mb-8">
                Your medical transport coordination system is now running successfully.
              </p>
              
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Project Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">Phase 1: Foundation & Core Infrastructure</span>
                    <span className="text-green-600 font-bold">✅ COMPLETE</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">Phase 2.1: Transport Request System</span>
                    <span className="text-green-600 font-bold">✅ COMPLETE</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">Phase 2.2: Status Board Implementation</span>
                    <span className="text-green-600 font-bold">✅ COMPLETE</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">Phase 2.3: Basic Distance Matrix</span>
                    <span className="text-green-600 font-bold">✅ COMPLETE</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <span className="text-orange-800 font-medium">Phase 2.4: Real-Time Resource Management</span>
                    <span className="text-orange-600 font-bold">✅ COMPLETE</span>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">What's New in Phase 2.1</h4>
                  <ul className="text-blue-800 space-y-2 text-left">
                    <li>✅ Transport request creation form with validation</li>
                    <li>✅ Facility search and selection</li>
                    <li>✅ Transport level and priority selection</li>
                    <li>✅ HIPAA-compliant patient ID generation</li>
                    <li>✅ Request management (edit, duplicate, cancel)</li>
                    <li>✅ Status workflow management</li>
                    <li>✅ Bulk operations and filtering</li>
                  </ul>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">What's New in Phase 2.2</h4>
                  <ul className="text-green-800 space-y-2 text-left">
                    <li>✅ Real-time status board with live updates</li>
                    <li>✅ Advanced filtering and search capabilities</li>
                    <li>✅ Status workflow management with confirmation</li>
                    <li>✅ Comprehensive statistics and metrics</li>
                    <li>✅ Auto-refresh every 30 seconds</li>
                    <li>✅ Print-friendly status board layout</li>
                    <li>✅ Responsive card-based design</li>
                  </ul>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">What's New in Phase 2.3</h4>
                  <ul className="text-blue-800 space-y-2 text-left">
                    <li>✅ Google Maps API integration for distance calculations</li>
                    <li>✅ JSON-based editable distance matrix system</li>
                    <li>✅ Automatic distance calculation for transport requests</li>
                    <li>✅ Admin interface for distance matrix management</li>
                    <li>✅ Caching system for performance optimization</li>
                    <li>✅ Distance validation and error handling</li>
                    <li>✅ Route ID generation system</li>
                    <li>✅ Integration with existing transport request workflow</li>
                  </ul>
                </div>
                
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-orange-900 mb-2">What's New in Phase 2.4</h4>
                  <ul className="text-orange-800 space-y-2 text-left">
                    <li>✅ Real-time CCT unit availability tracking</li>
                    <li>✅ Urgent request escalation system with notifications</li>
                    <li>✅ Critical care provider availability matrix</li>
                    <li>✅ Emergency transport priority queue management</li>
                    <li>✅ CCT resource allocation dashboard</li>
                    <li>✅ Real-time crew availability monitoring</li>
                    <li>✅ Dynamic resource allocation algorithms</li>
                    <li>✅ Call volume analytics and capacity planning</li>
                    <li>✅ Unit status management and tracking</li>
                    <li>✅ Resource utilization reporting and analytics</li>
                  </ul>
                </div>
                
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-2">What's New in Phase 2.5</h4>
                  <ul className="text-indigo-800 space-y-2 text-left">
                    <li>✅ Multi-patient transport management system</li>
                    <li>✅ Bulk transport request creation interface</li>
                    <li>✅ Long-distance transport planning tools</li>
                    <li>✅ Multi-leg transport coordination</li>
                    <li>✅ Weather conditions and air medical suitability</li>
                    <li>✅ Advanced route optimization algorithms</li>
                    <li>✅ Transport batch management and tracking</li>
                    <li>✅ Long-distance provider network management</li>
                    <li>✅ Extended transport time estimation</li>
                    <li>✅ Cost optimization and revenue potential analysis</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 flex space-x-4 justify-center">
                <button
                  onClick={() => setCurrentPage('transport-requests')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium"
                >
                  Try Transport Requests →
                </button>
                <button
                  onClick={() => setCurrentPage('status-board')}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg font-medium"
                >
                  View Status Board →
                </button>
                <button
                  onClick={() => setCurrentPage('distance-matrix')}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-lg font-medium"
                >
                  Manage Distance Matrix →
                </button>
                <button
                  onClick={() => setCurrentPage('resource-management')}
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-lg font-medium"
                >
                  Resource Management →
                </button>
                <button
                  onClick={() => setCurrentPage('advanced-transport')}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-lg font-medium"
                >
                  Advanced Transport →
                </button>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'transport-requests' && <TransportRequests />}
        {currentPage === 'status-board' && <StatusBoard />}
        {currentPage === 'distance-matrix' && <DistanceMatrix />}
        {currentPage === 'resource-management' && <ResourceManagement />}
        {currentPage === 'advanced-transport' && <AdvancedTransport />}
      </main>
    </div>
  );
}

export default App;
