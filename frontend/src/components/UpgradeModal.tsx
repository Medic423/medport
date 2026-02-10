import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, CreditCard, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  userType: 'HEALTHCARE' | 'EMS' | 'ALL';
  monthlyPrice: string;
  annualPrice: string | null;
  features: string[];
  trialDays: number;
  isActive: boolean;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'HEALTHCARE' | 'EMS';
  currentPlanId?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  userType,
  currentPlanId
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen, userType]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://api.traccems.com');
      const response = await axios.get(`${API_BASE_URL}/api/public/subscription-plans`, {
        params: { userType }
      });

      if (response.data.success) {
        // Filter out FREE plan and sort: REGULAR first, then PREMIUM
        const filteredPlans = response.data.data
          .filter((plan: SubscriptionPlan) => plan.name !== 'FREE')
          .sort((a: SubscriptionPlan, b: SubscriptionPlan) => {
            const order: { [key: string]: number } = { 'REGULAR': 0, 'PREMIUM': 1 };
            return (order[a.name] ?? 99) - (order[b.name] ?? 99);
          });
        setPlans(filteredPlans);
        
        // Auto-select REGULAR plan if available
        const regularPlan = filteredPlans.find((p: SubscriptionPlan) => p.name === 'REGULAR');
        if (regularPlan) {
          setSelectedPlan(regularPlan);
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      setError('Please select a plan to upgrade');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://api.traccems.com');
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Create checkout session
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/create-checkout-session`,
        {
          planId: selectedPlan.id,
          billingCycle: billingCycle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(
        err.response?.data?.error || 
        'Failed to start checkout process. Please try again.'
      );
      setLoading(false);
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price || price === '0') return 'Free';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === 'MONTHLY') {
      return formatPrice(plan.monthlyPrice);
    }
    return formatPrice(plan.annualPrice);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 text-white mr-2" />
                <h3 className="text-xl font-semibold text-white">
                  Upgrade Your Subscription
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="mt-2 text-sm text-blue-100">
              Choose a plan that fits your needs. All plans include a 7-day free trial.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-500">Loading plans...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Billing Cycle Toggle */}
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
                    <button
                      onClick={() => setBillingCycle('MONTHLY')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingCycle === 'MONTHLY'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('ANNUAL')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingCycle === 'ANNUAL'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      Annual
                      <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        Save
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan?.id === plan.id;
                    const isPopular = plan.name === 'REGULAR';
                    
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isPopular ? 'bg-blue-50' : 'bg-white'}`}
                      >
                        {isPopular && (
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                              Most Popular
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{plan.displayName}</h4>
                          <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                        </div>

                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-gray-900">
                            {getPrice(plan)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {billingCycle === 'MONTHLY' ? 'per month' : 'per year'}
                          </div>
                        </div>

                        <ul className="space-y-2 mb-4">
                          {plan.features.slice(0, 5).map((feature, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-600">
                              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 5 && (
                            <li className="text-xs text-gray-500 ml-6">
                              +{plan.features.length - 5} more features
                            </li>
                          )}
                        </ul>

                        {isSelected && (
                          <div className="mt-4 flex items-center justify-center text-blue-600">
                            <Check className="h-5 w-5 mr-2" />
                            <span className="text-sm font-medium">Selected</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">
                        Secure Payment Processing
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        Payments are securely processed by Stripe. Your payment information is never stored on our servers.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              disabled={!selectedPlan || loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {selectedPlan ? `Upgrade to ${selectedPlan.displayName}` : 'Select a Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
