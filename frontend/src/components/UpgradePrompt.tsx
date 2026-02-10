import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';

interface SubscriptionInfo {
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  daysRemaining?: number;
  trialEndDate?: string;
  planName?: string;
}

interface UpgradePromptProps {
  userId?: string;
  userType?: string;
  className?: string;
  onDismiss?: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  userId, 
  userType, 
  className = '',
  onDismiss 
}) => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
    // Refresh every hour
    const interval = setInterval(fetchSubscriptionStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, userType]);

  const fetchSubscriptionStatus = async () => {
    if (!userId || !userType) {
      // Try to get from localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const subscriptionStr = localStorage.getItem('subscription');
          if (subscriptionStr) {
            setSubscription(JSON.parse(subscriptionStr));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error reading subscription from localStorage:', err);
      }
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://api.traccems.com');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/subscription/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.subscription) {
        setSubscription(response.data.subscription);
        localStorage.setItem('subscription', JSON.stringify(response.data.subscription));
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    window.location.href = '/pricing';
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage (dismissed for this session)
    if (onDismiss) {
      onDismiss();
    }
  };

  if (loading || !subscription || dismissed) {
    return null;
  }

  // Only show prompt for TRIAL status with ≤3 days remaining or EXPIRED
  if (subscription.status === 'EXPIRED') {
    return (
      <div className={`bg-red-50 border-l-4 border-red-500 p-4 mb-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Your free trial has expired
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Upgrade to a paid subscription to continue using TRACC and access all features.
            </p>
            <div className="mt-3 flex items-center space-x-3">
              <button
                onClick={handleUpgradeClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Upgrade Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 flex-shrink-0 text-red-600 hover:text-red-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  if (subscription.status === 'TRIAL' && subscription.daysRemaining !== undefined) {
    const daysRemaining = subscription.daysRemaining;
    
    // Only show prompt if ≤3 days remaining
    if (daysRemaining > 3) {
      return null;
    }

    // Determine urgency level
    const isUrgent = daysRemaining <= 1;
    const isWarning = daysRemaining <= 3;

    const bgColor = isUrgent ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500';
    const textColor = isUrgent ? 'text-red-800' : 'text-orange-800';
    const buttonColor = isUrgent 
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
      : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';

    return (
      <div className={`${bgColor} border-l-4 p-4 mb-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isUrgent ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-orange-600" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${textColor}`}>
              {isUrgent 
                ? `Only ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial!`
                : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial`
              }
            </h3>
            <p className={`mt-1 text-sm ${textColor.replace('800', '700')}`}>
              {isUrgent
                ? 'Upgrade now to avoid interruption. Your account will be locked after the trial expires.'
                : 'Upgrade to a paid subscription to continue using TRACC after your trial ends.'
              }
            </p>
            <div className="mt-3 flex items-center space-x-3">
              <button
                onClick={handleUpgradeClick}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                Upgrade Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button
                onClick={handleDismiss}
                className={`text-sm ${textColor} hover:opacity-80`}
              >
                Remind me later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className={`ml-4 flex-shrink-0 ${textColor} hover:opacity-80`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default UpgradePrompt;
