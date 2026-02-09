import React, { useState, useEffect, useRef } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
}

interface UniversalLoginProps {
  onLogin: (user: User, token: string, subscription?: any) => void;
  onShowRegistration: () => void;
}

const UniversalLogin: React.FC<UniversalLoginProps> = ({ onLogin, onShowRegistration }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);
  
  // Debug: Log when error state changes
  useEffect(() => {
    if (error) {
      console.log('Universal Login: Error state is:', error);
    }
  }, [error]);

  // Scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Don't clear error at start - only clear on successful login or when user types
    // setError('');

    try {
      // Clear any existing session before attempting login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('Universal Login: Attempting login with:', formData);
      const response = await authAPI.login(formData);
      console.log('Universal Login: Login response:', response.data);
      
      if (response.data.success) {
        console.log('Universal Login: Login successful, calling onLogin');
        setError(''); // Clear error on successful login
        if (response.data.mustChangePassword === true) {
          try { localStorage.setItem('mustChangePassword', 'true'); } catch {}
        }
        // Pass subscription info if available
        onLogin(response.data.user, response.data.token, response.data.subscription);
      } else {
        console.log('Universal Login: Login failed:', response.data.error);
        const errorMsg = response.data.error || 'Login failed';
        setError(errorMsg);
        setLoading(false);
        return; // Prevent any further execution
      }
    } catch (error: any) {
      console.log('Universal Login: Login error:', error);
      console.log('Universal Login: Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      console.log('Universal Login: Setting error message:', errorMessage);
      
      // Set error message
      console.log('Universal Login: Setting error state to:', errorMessage);
      setError(errorMessage);
      
      // Ensure loading is set to false AFTER error is set
      setLoading(false);
      
      // Double-check error is set after a brief delay
      setTimeout(() => {
        console.log('Universal Login: Error state after timeout - checking...');
      }, 200);
      
      return; // Prevent any further execution
    }
    
    // This should not be reached if there's an error
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const fieldName = e.target.name as keyof typeof formData;
    const oldValue = formData[fieldName];
    
    // Only update form data if value actually changed
    if (newValue !== oldValue) {
      // Clear error when user starts typing (better UX)
      if (error) {
        console.log('Universal Login: Clearing error because user is typing in', fieldName);
        setError('');
      }
      setFormData(prev => ({
        ...prev,
        [fieldName]: newValue
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <img 
              src="/tracc-banner.png" 
              alt="Tracc Logo" 
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              ref={errorRef}
              className="rounded-md bg-red-50 p-4 border-2 border-red-300 shadow-md"
              style={{ 
                animation: 'fadeIn 0.3s ease-in',
                minHeight: '60px'
              }}
              role="alert"
              aria-live="assertive"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-red-900">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        {/* Create Account Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Don't have an account?
            </p>
            <button
              onClick={onShowRegistration}
              className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalLogin;

