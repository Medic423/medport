import React, { useState } from 'react';
import { useRoleBasedAccess } from '../hooks/useRoleBasedAccess';
import { 
  CogIcon, 
  BuildingOfficeIcon, 
  TruckIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

interface MainLoginProps {
  onLoginSuccess: (userData: any) => void;
}

const MainLogin: React.FC<MainLoginProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'transport-center' | 'hospital' | 'agency'>('transport-center');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { getLandingPage, getDemoLandingPage } = useRoleBasedAccess();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint: string;
      let userData: any;

      console.log('[MAIN_LOGIN] Login attempt for:', email, 'on tab:', activeTab);

      // Check if these are demo credentials and route accordingly
      if (email === 'developer@medport-transport.com' && password === 'dev123') {
        // Developer demo credentials - use auth demo endpoint
        endpoint = '/api/auth/demo/login';
        console.log('[MAIN_LOGIN] Using developer demo endpoint:', endpoint);
      } else if (email === 'coordinator@medport-transport.com' && password === 'demo123') {
        // Coordinator demo credentials - use auth demo endpoint
        endpoint = '/api/auth/demo/login';
        console.log('[MAIN_LOGIN] Using coordinator demo endpoint:', endpoint);
      } else if (email === 'coordinator@upmc-altoona.com' && password === 'demo123') {
        // Hospital demo credentials - use hospital login (already handles demo)
        endpoint = '/api/hospital/login';
        console.log('[MAIN_LOGIN] Using hospital demo endpoint:', endpoint);
      } else if (email === 'demo@agency.com' && password === 'demo123') {
        // Agency demo credentials - use agency demo endpoint
        endpoint = '/api/agency/demo/login';
        console.log('[MAIN_LOGIN] Using agency demo endpoint:', endpoint);
      } else if (email === 'billing@medport.com' && password === 'demo123') {
        // Billing demo credentials - use auth demo endpoint
        endpoint = '/api/auth/demo/login';
        console.log('[MAIN_LOGIN] Using billing demo endpoint:', endpoint);
      } else {
        // Regular credentials - use standard endpoints based on tab
        switch (activeTab) {
          case 'transport-center':
            endpoint = '/api/transport-center/login';
            break;
          case 'hospital':
            endpoint = '/api/hospital/login';
            break;
          case 'agency':
            endpoint = '/api/agency/login';
            break;
        }
        console.log('[MAIN_LOGIN] Using regular endpoint:', endpoint);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      userData = await response.json();
      
      if (userData.success) {
        // Store authentication data based on login type
        if (activeTab === 'agency' || email === 'demo@agency.com') {
          // Agency-specific storage
          localStorage.setItem('agencyToken', userData.data.token);
          localStorage.setItem('agencyUser', JSON.stringify(userData.data.user));
          localStorage.setItem('agency', JSON.stringify(userData.data.agency));
          localStorage.setItem('userRole', userData.data.user.role);
          localStorage.setItem('userEmail', userData.data.user.email);
        } else {
          // Transport Center/Hospital storage
          localStorage.setItem('token', userData.data.token);
          localStorage.setItem('userRole', userData.data.user.role);
          localStorage.setItem('userEmail', userData.data.user.email);
        }
        
        // Determine landing page based on user role and login type
        let landingPage: string;
        if (activeTab === 'agency' || email === 'demo@agency.com') {
          landingPage = 'agency-portal'; // Agency users go to agency portal
        } else {
          landingPage = await getLandingPage(userData.data.token);
        }
        
        console.log('[MAIN_LOGIN] User will land on:', landingPage);
        
        // Store landing page for App.tsx to use
        localStorage.setItem('landingPage', landingPage);
        
        // Call the success callback with the user data
        onLoginSuccess(userData.data.user);
      } else {
        throw new Error(userData.message || 'Login failed');
      }
    } catch (err) {
      console.error('[MAIN_LOGIN] Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo login functionality removed - now handled in regular login flow

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'transport-center': return <CogIcon className="w-5 h-5" />;
      case 'hospital': return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'agency': return <TruckIcon className="w-5 h-5" />;
      default: return <CogIcon className="w-5 h-5" />;
    }
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'transport-center': return 'Transport Center';
      case 'hospital': return 'Hospital';
      case 'agency': return 'Transport Agency';
      default: return 'Transport Center';
    }
  };

  // Demo credential functions removed for security - credentials documented in demo_credentials.md

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">MedPort</h2>
          <p className="text-gray-600">Medical Transport Coordination System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'transport-center', label: 'Transport Center' },
              { id: 'hospital', label: 'Hospital' },
              { id: 'agency', label: 'Agency' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {getTabIcon(tab.id)}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getTabTitle(activeTab)} Login
              </h3>
              <p className="text-sm text-gray-600">
                Access your {getTabTitle(activeTab).toLowerCase()} dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Demo credentials section removed for security - credentials documented in demo_credentials.md */}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact support at support@medport.com</p>
          <p className="mt-1">© 2025 MedPort. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default MainLogin;
