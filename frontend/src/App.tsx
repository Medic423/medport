import React, { useState } from 'react';
import TransportRequests from './pages/TransportRequests';
import StatusBoard from './pages/StatusBoard';
import DistanceMatrix from './pages/DistanceMatrix';
import ResourceManagement from './pages/ResourceManagement';
import AdvancedTransport from './pages/AdvancedTransport';
import AirMedical from './pages/AirMedical';
import EmergencyDepartment from './pages/EmergencyDepartment';
import AgencyRegistration from './pages/AgencyRegistration';
import AgencyLogin from './pages/AgencyLogin';
import AgencyDashboard from './pages/AgencyDashboard';
import RouteOptimization from './pages/RouteOptimization';
import UnitAssignment from './pages/UnitAssignment';
import NotificationDashboard from './components/NotificationDashboard';
import QRCodeSystem from './pages/QRCodeSystem';
import RealTimeTracking from './pages/RealTimeTracking';
import Analytics from './pages/Analytics';
import OfflineCapabilities from './pages/OfflineCapabilities';
import OfflineIndicator from './components/OfflineIndicator';
import MainLogin from './components/MainLogin';
import SettingsPage from './pages/Settings';
import Help from './pages/Help';
import AgencyPortal from './pages/AgencyPortal';


function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'transport-requests' | 'status-board' | 'distance-matrix' | 'resource-management' | 'advanced-transport' | 'air-medical' | 'emergency-department' | 'agency-registration' | 'agency-login' | 'agency-dashboard' | 'route-optimization' | 'unit-assignment' | 'notifications' | 'qr-code-system' | 'real-time-tracking' | 'analytics' | 'offline-capabilities' | 'login' | 'settings' | 'help' | 'agency-portal'>('home');

  return (
    <div className="App">
      {/* Navigation Header */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">MedPort</h1>
            </div>
            <div className="flex items-center space-x-4">
              <OfflineIndicator showDetails={true} />
            </div>
            <div className="flex space-x-2">
              {/* Home */}
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

              {/* Core Operations Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white flex items-center">
                  Core Operations
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => setCurrentPage('transport-requests')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Transport Requests
                    </button>
                    <button
                      onClick={() => setCurrentPage('status-board')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Status Board
                    </button>
                    <button
                      onClick={() => setCurrentPage('unit-assignment')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Unit Assignment
                    </button>
                  </div>
                </div>
              </div>

              {/* Dispatch Operations Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white flex items-center">
                  Dispatch Operations
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => setCurrentPage('transport-requests')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Transport Requests
                    </button>
                    <button
                      onClick={() => setCurrentPage('status-board')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Status Board
                    </button>
                    <button
                      onClick={() => setCurrentPage('unit-assignment')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Unit Assignment
                    </button>
                    <button
                      onClick={() => setCurrentPage('route-optimization')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Route Optimization
                    </button>
                    <button
                      onClick={() => setCurrentPage('distance-matrix')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Distance Matrix
                    </button>
                    <button
                      onClick={() => setCurrentPage('real-time-tracking')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Real-Time Tracking
                    </button>
                    <button
                      onClick={() => setCurrentPage('notifications')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Notifications
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial Planning Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white flex items-center">
                  Financial Planning
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => setCurrentPage('analytics')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Analytics & Reporting
                    </button>
                    <button
                      onClick={() => setCurrentPage('resource-management')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Resource Management
                    </button>
                  </div>
                </div>
              </div>

              {/* Agency Portal */}
              <button
                onClick={() => setCurrentPage('agency-portal')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'agency-portal'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                Agency Portal
              </button>

              {/* Tools and Utilities Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white flex items-center">
                  Tools and Utilities
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => setCurrentPage('advanced-transport')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Advanced Transport
                    </button>
                    <button
                      onClick={() => setCurrentPage('air-medical')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Air Medical
                    </button>
                    <button
                      onClick={() => setCurrentPage('emergency-department')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Emergency Department
                    </button>
                    <button
                      onClick={() => setCurrentPage('qr-code-system')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      QR Code System
                    </button>
                    <button
                      onClick={() => setCurrentPage('offline-capabilities')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Offline Capabilities
                    </button>
                    <button
                      onClick={() => setCurrentPage('settings')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => setCurrentPage('help')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Help
                    </button>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
                  Your medical transport coordination system is ready. Navigate to the Status Board to begin monitoring transport operations.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setCurrentPage('status-board')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Go to Status Board →
                  </button>
                  <button
                    onClick={() => setCurrentPage('help')}
                    className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium transition-all duration-200"
                  >
                    View Help & Documentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'transport-requests' && <TransportRequests />}
        {currentPage === 'status-board' && <StatusBoard />}
        {currentPage === 'distance-matrix' && <DistanceMatrix />}
        {currentPage === 'resource-management' && <ResourceManagement />}
        {currentPage === 'advanced-transport' && <AdvancedTransport />}
        {currentPage === 'air-medical' && <AirMedical />}
        {currentPage === 'emergency-department' && <EmergencyDepartment />}
        {currentPage === 'route-optimization' && <RouteOptimization />}
        {currentPage === 'unit-assignment' && <UnitAssignment />}
        {currentPage === 'notifications' && <NotificationDashboard />}
        {currentPage === 'qr-code-system' && <QRCodeSystem />}
        {currentPage === 'real-time-tracking' && <RealTimeTracking />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'offline-capabilities' && <OfflineCapabilities />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'help' && <Help />}
        {currentPage === 'login' && <MainLogin onNavigate={(page) => setCurrentPage(page as any)} />}
        {/* Placeholder dashboards removed - users now navigate to main app interface */}
        {currentPage === 'agency-registration' && <AgencyRegistration onNavigate={(page) => setCurrentPage(page as any)} />}
        {currentPage === 'agency-login' && <AgencyLogin onNavigate={(page) => setCurrentPage(page as any)} />}
        {currentPage === 'agency-dashboard' && <AgencyDashboard onNavigate={(page) => setCurrentPage(page as any)} />}
        {currentPage === 'agency-portal' && <AgencyPortal onNavigate={(page) => setCurrentPage(page as any)} />}

      </main>
    </div>
  );
}

export default App;
