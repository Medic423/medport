import React, { useState } from 'react';
import TransportRequests from './pages/TransportRequests';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'transport-requests'>('home');

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
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-blue-800 font-medium">Phase 2.1: Transport Request System</span>
                    <span className="text-blue-600 font-bold">🚧 IN PROGRESS</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Phase 2.2: Status Board Implementation</span>
                    <span className="text-gray-600 font-bold">⏳ PENDING</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Phase 2.3: Basic Distance Matrix</span>
                    <span className="text-gray-600 font-bold">⏳ PENDING</span>
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
              </div>
              
              <div className="mt-8">
                <button
                  onClick={() => setCurrentPage('transport-requests')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium"
                >
                  Try Transport Requests →
                </button>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'transport-requests' && <TransportRequests />}
      </main>
    </div>
  );
}

export default App;
