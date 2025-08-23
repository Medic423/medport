import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginData {
  email: string;
  password: string;
}

const AgencyLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/agency/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Store the token and redirect to agency dashboard
        localStorage.setItem('agencyToken', result.data.token);
        localStorage.setItem('agencyUser', JSON.stringify(result.data.user));
        localStorage.setItem('agency', JSON.stringify(result.data.agency));
        
        navigate('/agency/dashboard');
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

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/agency/demo/login', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Store demo data and redirect to agency dashboard
        localStorage.setItem('agencyToken', result.data.token);
        localStorage.setItem('agencyUser', JSON.stringify(result.data.user));
        localStorage.setItem('agency', JSON.stringify(result.data.agency));
        localStorage.setItem('demoMode', 'true');
        
        navigate('/agency/dashboard');
      } else {
        setSubmitError(result.message || 'Demo login failed');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setSubmitError('Demo login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agency Portal
          </h1>
          <p className="text-gray-600">
            Sign in to your transport agency account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{submitError}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            {/* Demo Mode Button */}
            <div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Loading...' : 'Try Demo Mode'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to MedPort?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/agency/register')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Register your agency
              </button>
            </div>
          </div>

          {/* Demo Mode Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Mode Available</h3>
            <p className="text-sm text-blue-700">
              Try the agency portal with sample data. Click "Try Demo Mode" to explore features without creating an account.
            </p>
          </div>
        </div>
      </div>

      {/* Back to Main */}
      <div className="text-center mt-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-500 font-medium"
        >
          ← Back to Main Menu
        </button>
      </div>
    </div>
  );
};

export default AgencyLogin;
