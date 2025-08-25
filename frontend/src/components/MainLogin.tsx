import React, { useState } from 'react';
import { 
  BuildingOfficeIcon, 
  TruckIcon, 
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface LoginData {
  email: string;
  password: string;
}

interface MainLoginProps {
  onNavigate: (page: string) => void;
}

const MainLogin: React.FC<MainLoginProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'transport-center' | 'hospital' | 'agency'>('transport-center');
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showDemoInfo, setShowDemoInfo] = useState(false);

  const validateForm = (): boolean => {
    if (!formData.email.trim() || !formData.password) {
      setSubmitError('Email and password are required');
      return false;
    }
    return true;
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      let endpoint = '';
      let redirectPage = '';

      switch (activeTab) {
        case 'transport-center':
          endpoint = '/api/transport-center/login';
          redirectPage = 'transport-center-dashboard';
          break;
        case 'hospital':
          endpoint = '/api/hospital/login';
          redirectPage = 'hospital-dashboard';
          break;
        case 'agency':
          endpoint = '/api/agency/login';
          redirectPage = 'agency-dashboard';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Store authentication data
        const tokenKey = `${activeTab}Token`;
        const userKey = `${activeTab}User`;
        const orgKey = activeTab === 'agency' ? 'agency' : 
                      activeTab === 'hospital' ? 'hospital' : 'organization';
        
        localStorage.setItem(tokenKey, result.data.token);
        localStorage.setItem(userKey, JSON.stringify(result.data.user));
        if (result.data[orgKey]) {
          localStorage.setItem(orgKey, JSON.stringify(result.data[orgKey]));
        }
        
        // Redirect to appropriate dashboard
        onNavigate(redirectPage);
      } else {
        setSubmitError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const getDemoCredentials = (tab: string) => {
    switch (tab) {
      case 'transport-center':
        return { email: 'coordinator@medport-transport.com', password: 'demo123' };
      case 'hospital':
        return { email: 'coordinator@upmc-altoona.com', password: 'demo123' };
      case 'agency':
        return { email: 'admin@demo-ems.com', password: 'demo123' };
      default:
        return { email: '', password: '' };
    }
  };

  const fillDemoCredentials = () => {
    const credentials = getDemoCredentials(activeTab);
    setFormData(credentials);
  };

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
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
              {submitError && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {submitError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
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

            {/* Demo Credentials Info */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowDemoInfo(!showDemoInfo)}
                className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <InformationCircleIcon className="w-4 h-4" />
                <span>Demo Credentials</span>
              </button>

              {showDemoInfo && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-800 mb-2">
                    Use these credentials in the Sign In form above:
                  </p>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p><strong>Email:</strong> {getDemoCredentials(activeTab).email}</p>
                    <p><strong>Password:</strong> {getDemoCredentials(activeTab).password}</p>
                  </div>
                  <button
                    onClick={fillDemoCredentials}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Fill Demo Credentials
                  </button>
                </div>
              )}
            </div>
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
