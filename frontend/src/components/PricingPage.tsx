import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './landing/Navigation';
import Footer from './landing/Footer';
import { Check, ArrowRight } from 'lucide-react';
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

interface PricingPageProps {
  onShowRegistration: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onShowRegistration }) => {
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState<'HEALTHCARE' | 'EMS'>('HEALTHCARE');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [selectedUserType]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the public API endpoint
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://api.traccems.com');
      const response = await axios.get(`${API_BASE_URL}/api/public/subscription-plans`, {
        params: { userType: selectedUserType }
      });

      if (response.data.success) {
        setPlans(response.data.data);
      } else {
        setError(response.data.error || 'Failed to load plans');
      }
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError('Failed to load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.name === 'FREE') {
      // Redirect to registration
      onShowRegistration();
    } else {
      // TODO: Implement payment flow for paid plans
      alert(`Upgrade to ${plan.displayName} - Payment integration coming soon!`);
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price || price === '0') return 'Free';
    return `$${parseFloat(price).toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation onShowRegistration={onShowRegistration} />
      
      <main className="pt-16">
        {/* Header Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Select the perfect plan for your organization. Start with a 7-day free trial, no credit card required.
            </p>

            {/* User Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
                <button
                  onClick={() => setSelectedUserType('HEALTHCARE')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedUserType === 'HEALTHCARE'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Healthcare Facilities
                </button>
                <button
                  onClick={() => setSelectedUserType('EMS')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedUserType === 'EMS'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  EMS Agencies
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading plans...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchPlans}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-lg border-2 p-8 ${
                      plan.name === 'REGULAR'
                        ? 'border-blue-600 shadow-xl scale-105'
                        : 'border-gray-200 shadow-md'
                    }`}
                  >
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      {plan.name === 'REGULAR' && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                          Most Popular
                        </span>
                      )}
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.displayName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {plan.description}
                      </p>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(plan.monthlyPrice)}
                        </span>
                        {plan.monthlyPrice !== '0' && (
                          <span className="text-gray-600">/month</span>
                        )}
                      </div>
                      {plan.annualPrice && plan.annualPrice !== '0' && (
                        <p className="text-sm text-gray-500">
                          {formatPrice(plan.annualPrice)}/year
                          <span className="text-green-600 ml-1">
                            (Save ${(parseFloat(plan.monthlyPrice) * 12 - parseFloat(plan.annualPrice)).toFixed(0)})
                          </span>
                        </p>
                      )}
                      {plan.trialDays > 0 && (
                        <p className="text-sm text-blue-600 font-medium mt-2">
                          {plan.trialDays}-day free trial
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                        plan.name === 'REGULAR'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : plan.name === 'FREE'
                          ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          : 'bg-gray-800 text-white hover:bg-gray-900'
                      }`}
                    >
                      {plan.name === 'FREE' ? (
                        <span className="flex items-center justify-center">
                          Start Free Trial
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      ) : (
                        `Select ${plan.displayName}`
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Can I change plans later?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What happens after my free trial?
                </h3>
                <p className="text-gray-600">
                  After your 7-day free trial ends, you'll need to select a paid plan to continue using TRACC. No charges during the trial period.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Do you offer annual billing discounts?
                </h3>
                <p className="text-gray-600">
                  Yes! Annual plans offer savings compared to monthly billing. See pricing above for details.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
