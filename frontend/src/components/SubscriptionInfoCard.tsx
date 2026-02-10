import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, CreditCard, Calendar, Sparkles } from 'lucide-react';
import axios from 'axios';
import UpgradeButton from './UpgradeButton';

interface SubscriptionInfo {
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  daysRemaining?: number;
  trialEndDate?: string;
  planName?: string;
  planId?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string | null;
  features: string[];
}

interface SubscriptionInfoCardProps {
  userId?: string;
  userType?: string;
  className?: string;
  showUpgradeButton?: boolean;
}

const SubscriptionInfoCard: React.FC<SubscriptionInfoCardProps> = ({
  userId,
  userType,
  className = '',
  showUpgradeButton = true
}) => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus();
    // Refresh every hour
    const interval = setInterval(fetchSubscriptionStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, userType]);

  const fetchSubscriptionStatus = async () => {
    if (!userId || !userType) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const subscriptionStr = localStorage.getItem('subscription');
          if (subscriptionStr) {
            const subInfo = JSON.parse(subscriptionStr);
            setSubscription(subInfo);
            if (subInfo.planId) {
              await fetchPlanDetails(subInfo.planId, user.userType);
            }
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
        const subInfo = response.data.subscription;
        setSubscription(subInfo);
        localStorage.setItem('subscription', JSON.stringify(subInfo));
        
        if (subInfo.planId) {
          await fetchPlanDetails(subInfo.planId, userType);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanDetails = async (planId: string, userType: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://api.traccems.com');
      const response = await axios.get(`${API_BASE_URL}/api/public/subscription-plans`, {
        params: { userType }
      });

      if (response.data.success && response.data.data) {
        const plan = response.data.data.find((p: SubscriptionPlan) => p.id === planId);
        if (plan) {
          setCurrentPlan(plan);
        }
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;

    switch (subscription.status) {
      case 'ACTIVE':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </div>
        );
      case 'TRIAL':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Trial
          </div>
        );
      case 'CANCELLED':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Cancelled
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-gray-400" />
            Subscription
          </h3>
          <p className="text-sm text-gray-500 mt-1">Your current plan and billing information</p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-4">
        {/* Current Plan */}
        <div>
          <dt className="text-sm font-medium text-gray-500">Current Plan</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {currentPlan ? currentPlan.displayName : subscription.planName || 'Free Trial'}
          </dd>
          {currentPlan && (
            <p className="mt-1 text-xs text-gray-500">{currentPlan.description}</p>
          )}
        </div>

        {/* Status Details */}
        {subscription.status === 'TRIAL' && subscription.daysRemaining !== undefined && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Trial Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {subscription.daysRemaining} {subscription.daysRemaining === 1 ? 'day' : 'days'} remaining
            </dd>
            {subscription.trialEndDate && (
              <p className="mt-1 text-xs text-gray-500">
                Trial ends: {formatDate(subscription.trialEndDate)}
              </p>
            )}
          </div>
        )}

        {subscription.status === 'ACTIVE' && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Subscription Status</dt>
            <dd className="mt-1 text-sm text-gray-900">Active subscription</dd>
          </div>
        )}

        {/* Plan Features (if available) */}
        {currentPlan && currentPlan.features && currentPlan.features.length > 0 && (
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-2">Plan Features</dt>
            <dd className="mt-1">
              <ul className="space-y-1">
                {currentPlan.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {currentPlan.features.length > 5 && (
                  <li className="text-xs text-gray-500 ml-6">
                    +{currentPlan.features.length - 5} more features
                  </li>
                )}
              </ul>
            </dd>
          </div>
        )}

        {/* Pricing (if available) */}
        {currentPlan && currentPlan.monthlyPrice && parseFloat(currentPlan.monthlyPrice) > 0 && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Monthly Price</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              ${parseFloat(currentPlan.monthlyPrice).toFixed(2)}/month
            </dd>
            {currentPlan.annualPrice && parseFloat(currentPlan.annualPrice) > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Annual: ${parseFloat(currentPlan.annualPrice).toFixed(2)}/year
              </p>
            )}
          </div>
        )}

        {/* Upgrade Button */}
        {showUpgradeButton && (subscription.status === 'TRIAL' || subscription.status === 'EXPIRED') && (
          <div className="pt-4 border-t border-gray-200">
            <UpgradeButton variant="primary" size="md" className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionInfoCard;
