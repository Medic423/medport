import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import TCCDashboard from './components/TCCDashboard';
import HealthcareDashboard from './components/HealthcareDashboard';
import EMSDashboard from './components/EMSDashboard';
import UniversalLogin from './components/UniversalLogin';
import RegistrationChoiceModal from './components/RegistrationChoiceModal';
import HealthcareRegistration from './components/HealthcareRegistration';
import EMSRegistration from './components/EMSRegistration';
import { authAPI } from './services/api';
import ErrorBoundary from './components/ErrorBoundary';
import TripAcceptance from './components/TripAcceptance';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
  facilityName?: string;
  facilityType?: string;
  agencyName?: string;
  manageMultipleLocations?: boolean; // ✅ NEW: Multi-location flag
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Always start with null user state
      setUser(null);
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.verify();
          setUser(response.data.user);
        } catch (error) {
          // Clear both localStorage and user state when token verification fails
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Handle browser back button navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If user is logged in and tries to go back to login pages, redirect to root
      if (user && location.pathname.startsWith('/register')) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, location.pathname, navigate]);

  const handleLogin = (userData: User, token: string) => {
    console.log('TCC_DEBUG: handleLogin called with userData:', userData);
    console.log('TCC_DEBUG: handleLogin called with token:', token ? 'present' : 'missing');
    
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('TCC_DEBUG: User state set, localStorage updated');
    
    // Use React Router navigation instead of window.location
    if (userData.userType === 'ADMIN' || userData.userType === 'USER') {
      console.log('TCC_DEBUG: Redirecting to root for admin/user');
      navigate('/', { replace: true });
    } else {
      console.log('TCC_DEBUG: No redirect needed for healthcare/EMS - component should re-render');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };


  const handleShowRegistrationModal = () => {
    setShowRegistrationModal(true);
  };

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
  };

  const handleSelectHealthcareRegistration = () => {
    setShowRegistrationModal(false);
    navigate('/healthcare-register');
  };

  const handleSelectEMSRegistration = () => {
    setShowRegistrationModal(false);
    navigate('/ems-register');
  };

  const handleRegistrationSuccess = () => {
    navigate('/');
  };

  const handleBackToPublic = () => {
    navigate('/');
  };

  const handleClearSession = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  console.log('TCC_DEBUG: App render - user:', user, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is logged in, show appropriate dashboard based on user type
  if (user) {
    // Show different dashboards based on user type
    if (user.userType === 'HEALTHCARE') {
      return <HealthcareDashboard user={user} onLogout={handleLogout} />;
    } else if (user.userType === 'EMS') {
      return <EMSDashboard user={user} onLogout={handleLogout} />;
    } else {
      // ADMIN and USER types go to TCC Dashboard
      return (
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/"
              element={<TCCDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/dashboard/*"
              element={<TCCDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </div>
      );
    }
  }

  // If not logged in, show public interface with proper routing
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Registration Choice Modal */}
      {showRegistrationModal && (
        <RegistrationChoiceModal
          onClose={handleCloseRegistrationModal}
          onSelectHealthcare={handleSelectHealthcareRegistration}
          onSelectEMS={handleSelectEMSRegistration}
        />
      )}

      <Routes>
        <Route path="/" element={
          <UniversalLogin
            onLogin={handleLogin}
            onShowRegistration={handleShowRegistrationModal}
          />
        } />
        <Route path="/healthcare-register" element={
          <HealthcareRegistration 
            key="healthcare-register"
            onBack={handleBackToPublic}
            onSuccess={handleRegistrationSuccess}
          />
        } />
        <Route path="/ems-register" element={
          <EMSRegistration 
            onBack={handleBackToPublic}
            onSuccess={handleRegistrationSuccess}
          />
        } />
        <Route path="/test-trip-acceptance" element={
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Acceptance Test Page</h1>
                <p className="text-gray-600">Testing the TripAcceptance component</p>
              </div>
              <TripAcceptance />
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
