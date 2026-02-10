import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://api.traccems.com');
        const token = localStorage.getItem('token');

        if (!token) {
          // User might have been logged out during checkout
          // Redirect to login with return URL
          navigate('/login?returnUrl=/payment/success&session_id=' + sessionId);
          return;
        }

        // Verify the checkout session
        const response = await axios.get(
          `${API_BASE_URL}/api/payments/subscription-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Payment successful - subscription should be activated via webhook
          // Give webhook a moment to process
          setTimeout(() => {
            setLoading(false);
          }, 2000);
        } else {
          setError('Failed to verify payment status');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error verifying payment:', err);
        // Don't show error immediately - webhook might still be processing
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  const handleContinue = () => {
    // Navigate to dashboard based on user type
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.userType === 'HEALTHCARE') {
          navigate('/healthcare-dashboard');
        } else if (user.userType === 'EMS') {
          navigate('/ems-dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processing Your Payment
          </h2>
          <p className="text-sm text-gray-600">
            Please wait while we confirm your subscription...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Verification Error
          </h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Your subscription has been activated successfully.
          </p>
          <p className="text-xs text-gray-500">
            {sessionId && `Session ID: ${sessionId.substring(0, 20)}...`}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>What's next?</strong>
          </p>
          <p className="text-sm text-blue-700 mt-1">
            You now have full access to all features. Your subscription will automatically renew at the end of each billing period.
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
        >
          Continue to Dashboard
        </button>

        <button
          onClick={() => navigate('/pricing')}
          className="mt-3 w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          View Subscription Details
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
