import React, { useState, useEffect } from 'react';
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
import Settings from './components/Settings';
import Analytics from './pages/Analytics';
import AgencyPortal from './pages/AgencyPortal';
import UnitManagement from './components/UnitManagement';
import BidManagement from './components/BidManagement';
import MatchingSystem from './components/MatchingSystem';
import CrewScheduling from './components/CrewScheduling';
import TripAcceptance from './components/TripAcceptance';
import RevenueOpportunities from './components/RevenueOpportunities';
import AgencyAnalytics from './components/AgencyAnalytics';
import QRCodeSystem from './pages/QRCodeSystem';
import OfflineCapabilities from './pages/OfflineCapabilities';

// New simplified components
import HospitalDashboard from './pages/HospitalDashboard';
import NewTripForm from './pages/NewTripForm';
import TripManagement from './pages/TripManagement';

import MainLogin from './components/MainLogin';
import { useSimpleNavigation } from './hooks/useSimpleNavigation';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const { navigation, userType, loading, error, fetchNavigation, fetchLandingPage } = useSimpleNavigation();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const landingPage = localStorage.getItem('landingPage');
    
    if (token && userRole) {
      setIsAuthenticated(true);
      setUserData({
        role: userRole,
        email: localStorage.getItem('userEmail')
      });
      
      // Fetch navigation data for the authenticated user
      fetchNavigation(token);
      
      // Use the stored landing page or default to status-board
      if (landingPage) {
        setCurrentPage(landingPage);
      } else {
        setCurrentPage('status-board');
      }
    } else {
      // Clear any stale data
      localStorage.removeItem('landingPage');
      setCurrentPage('login');
      setIsAuthenticated(false);
    }
  }, [fetchNavigation]);

  const handleLoginSuccess = async (userData: any) => {
    setIsAuthenticated(true);
    setUserData(userData);
    
    // Fetch navigation data for the newly logged in user
    const token = localStorage.getItem('token');
    
    if (token) {
      await fetchNavigation(token);
      
      // Get the landing page from the simplified navigation system
      try {
        const landingPage = await fetchLandingPage(token);
        
        if (landingPage) {
          setCurrentPage(landingPage);
          localStorage.setItem('landingPage', landingPage);
        } else {
          // Fallback based on user type
          if (userData.userType === 'hospital') {
            setCurrentPage('dashboard');
          } else if (userData.userType === 'ems') {
            setCurrentPage('trips/available');
          } else if (userData.userType === 'center') {
            setCurrentPage('overview');
          } else {
            setCurrentPage('status-board');
          }
        }
      } catch (error) {
        console.error('[App] Failed to fetch landing page:', error);
        // Fallback to status-board
        setCurrentPage('status-board');
      }
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('landingPage');
    localStorage.removeItem('demoMode');
    
    setIsAuthenticated(false);
    setUserData(null);
    setCurrentPage('login');
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Render the main application with simplified navigation
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified navigation header based on user type */}
      <nav className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">MedPort</h1>
              {userType && (
                <span className="ml-4 px-2 py-1 bg-blue-500 rounded text-sm">
                  {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="text-blue-100">Loading navigation...</div>
              ) : error ? (
                <div className="text-red-200">Navigation error</div>
              ) : navigation ? (
                // Render simplified navigation items
                <>
                  {navigation.navigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white"
                    >
                      {item.name}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Fallback to basic navigation if simplified data isn't available
                <>
                  <button
                    onClick={() => handleNavigation('status-board')}
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white"
                  >
                    Status Board
                  </button>
                  <button
                    onClick={() => handleNavigation('transport-requests')}
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white"
                  >
                    Transport Requests
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="pt-16">
        {/* Simplified routing based on user type */}
        {currentPage === 'dashboard' && <HospitalDashboard />}
        {currentPage === 'trips/new' && <NewTripForm />}
        {currentPage === 'trips' && <TripManagement />}
        {currentPage === 'trips/available' && <TransportRequests />}
        {currentPage === 'trips/assigned' && <TripManagement />}
        {currentPage === 'optimization' && <RouteOptimization />}
        {currentPage === 'agency' && <AgencyDashboard onNavigate={handleNavigation} />}
        {currentPage === 'overview' && <StatusBoard />}
        {currentPage === 'trips/all' && <TripManagement />}
        {currentPage === 'hospitals' && <StatusBoard />}
        {currentPage === 'ems-agencies' && <AgencyDashboard onNavigate={handleNavigation} />}
        {currentPage === 'settings' && <Settings />}
        {currentPage === 'features' && <StatusBoard />}
        {currentPage === 'notifications' && <NotificationDashboard />}
        
        {/* Legacy page support for backward compatibility */}
        {currentPage === 'transport-requests' && <TransportRequests />}
        {currentPage === 'status-board' && <StatusBoard />}
        {currentPage === 'distance-matrix' && <DistanceMatrix />}
        {currentPage === 'resource-management' && <ResourceManagement />}
        {currentPage === 'advanced-transport' && <AdvancedTransport />}
        {currentPage === 'air-medical' && <AirMedical />}
        {currentPage === 'emergency-department' && <EmergencyDepartment />}
        {currentPage === 'agency-registration' && <AgencyRegistration onNavigate={handleNavigation} />}
        {currentPage === 'agency-login' && <AgencyLogin onNavigate={handleNavigation} />}
        {currentPage === 'agency-dashboard' && <AgencyDashboard onNavigate={handleNavigation} />}
        {currentPage === 'route-optimization' && <RouteOptimization />}
        {currentPage === 'unit-assignment' && <UnitAssignment />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'agency-portal' && <AgencyPortal onNavigate={handleNavigation} />}
        {currentPage === 'unit-management' && <UnitManagement />}
        {currentPage === 'bid-management' && <BidManagement />}
        {currentPage === 'matching-system' && <MatchingSystem />}
        {currentPage === 'crew-scheduling' && <CrewScheduling />}
        {currentPage === 'trip-acceptance' && <TripAcceptance />}
        {currentPage === 'revenue-opportunities' && <RevenueOpportunities />}
        {currentPage === 'agency-analytics' && <AgencyAnalytics />}
        {currentPage === 'qr-code-system' && <QRCodeSystem />}
        {currentPage === 'offline-capabilities' && <OfflineCapabilities />}
      </main>
    </div>
  );
}

export default App;
