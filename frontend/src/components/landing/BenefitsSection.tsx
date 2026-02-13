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
    <section
      id="benefits"
      className="py-16 md:py-20"
      style={{ backgroundColor: '#e6f0f8' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serifa text-3xl sm:text-4xl font-medium text-tracc-primary mb-4">
            Why Choose TRACC?
          </h2>
          <p className="font-inter-tight text-xl text-tracc-gray max-w-3xl mx-auto">
            Join healthcare facilities and EMS providers who trust TRACC for their transport coordination needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 md:mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-tracc-primary/10"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-tracc-neutral rounded-lg">
                      <IconComponent className="h-6 w-6 text-tracc-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-inter-tight text-xl font-semibold text-tracc-primary mb-2">
                      {benefit.title}
                    </h3>
                    <p className="font-inter-tight text-tracc-gray">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-tracc-primary/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-serifa text-4xl font-medium text-tracc-primary mb-2">
                  {stat.value}
                </div>
                <div className="font-inter-tight text-tracc-gray font-medium">
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
