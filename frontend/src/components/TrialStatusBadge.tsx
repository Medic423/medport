import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

interface SubscriptionInfo {
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  daysRemaining?: number;
  trialEndDate?: string;
  planName?: string;
}

interface TrialStatusBadgeProps {
  userId?: string;
  userType?: string;
  className?: string;
}

const TrialStatusBadge: React.FC<TrialStatusBadgeProps> = ({ userId, userType, className = '' }) => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

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
          // Check if subscription info was included in login response
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
        // Store in localStorage for quick access
        localStorage.setItem('subscription', JSON.stringify(response.data.subscription));
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) {
    return null;
  }

  const handleUpgradeClick = () => {
    // Navigate to pricing page (now accessible even when logged in)
    window.location.href = '/pricing';
  };

  // Don't show badge for active paid subscriptions
  if (subscription.status === 'ACTIVE') {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
        <CheckCircle className="h-3 w-3 mr-1" />
        Active Subscription
      </div>
    );
  }

  // Show expired warning
  if (subscription.status === 'EXPIRED') {
    return (
      <button
        onClick={handleUpgradeClick}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors ${className}`}
      >
        <XCircle className="h-3 w-3 mr-1" />
        Trial Expired - Upgrade Now
      </button>
    );
  }

  // Show trial countdown
  if (subscription.status === 'TRIAL' && subscription.daysRemaining !== undefined) {
    const daysRemaining = subscription.daysRemaining;
    let bgColor = 'bg-blue-100 text-blue-800';
    let icon = <Clock className="h-3 w-3 mr-1" />;
    
    // Warning colors for low days remaining
    if (daysRemaining <= 1) {
      bgColor = 'bg-red-100 text-red-800';
      icon = <AlertTriangle className="h-3 w-3 mr-1" />;
    } else if (daysRemaining <= 3) {
      bgColor = 'bg-orange-100 text-orange-800';
      icon = <AlertTriangle className="h-3 w-3 mr-1" />;
    }

    return (
      <button
        onClick={handleUpgradeClick}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} hover:opacity-80 transition-opacity ${className}`}
        title={`${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial`}
      >
        {icon}
        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
      </button>
    );
  }

  return null;
};

export default TrialStatusBadge;
