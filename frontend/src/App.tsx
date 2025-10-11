import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import TCCDashboard from './components/TCCDashboard';
import HealthcareDashboard from './components/HealthcareDashboard';
import EMSDashboard from './components/EMSDashboard';
import PublicLogin from './components/PublicLogin';
import HealthcareRegistration from './components/HealthcareRegistration';
import EMSRegistration from './components/EMSRegistration';
import HealthcareLogin from './components/HealthcareLogin';
import EMSLogin from './components/EMSLogin';
import { authAPI } from './services/api';
import ErrorBoundary from './components/ErrorBoundary';

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.verify();
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
      if (user && (location.pathname.startsWith('/login') || location.pathname.startsWith('/register'))) {
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

  const handleRoleSelect = (role: 'healthcare' | 'ems' | 'tcc') => {
    if (role === 'tcc') {
      navigate('/login');
    } else if (role === 'healthcare') {
      navigate('/healthcare-login');
    } else if (role === 'ems') {
      navigate('/ems-login');
    }
  };

  const handleShowRegistration = (role: 'healthcare' | 'ems') => {
    if (role === 'healthcare') {
      navigate('/healthcare-register');
    } else {
      navigate('/ems-register');
    }
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
      <Routes>
        <Route path="/" element={
          <PublicLogin 
            onRoleSelect={handleRoleSelect}
            onShowRegistration={handleShowRegistration}
            onClearSession={handleClearSession}
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
        <Route path="/login" element={
          <Login onLogin={handleLogin} onBack={handleBackToPublic} />
        } />
        <Route path="/healthcare-login" element={
          <HealthcareLogin 
            onBack={handleBackToPublic}
            onLogin={handleLogin}
          />
        } />
        <Route path="/ems-login" element={
          <EMSLogin 
            onBack={handleBackToPublic}
            onLogin={handleLogin}
          />
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
