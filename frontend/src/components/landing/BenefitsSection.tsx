import React from 'react';
import { CheckCircle, TrendingUp, Heart, Zap } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: Zap,
      title: 'Faster Response Times',
      description: 'Reduce average response time by up to 40% with optimized routing and real-time coordination.',
    },
    {
      icon: TrendingUp,
      title: 'Increased Efficiency',
      description: 'Streamline operations and reduce administrative overhead with automated workflows.',
    },
    {
      icon: Heart,
      title: 'Better Patient Care',
      description: 'Improve patient outcomes through better coordination and communication between facilities.',
    },
    {
      icon: CheckCircle,
      title: 'Cost Savings',
      description: 'Optimize resource utilization and reduce operational costs across your organization.',
    },
  ];

  const stats = [
    { value: '40%', label: 'Faster Response' },
    { value: '24/7', label: 'Availability' },
    { value: '99.9%', label: 'Uptime' },
    { value: 'HIPAA', label: 'Compliant' },
  ];

  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose TraccEMS?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join healthcare facilities and EMS providers who trust TraccEMS for their transport coordination needs.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
