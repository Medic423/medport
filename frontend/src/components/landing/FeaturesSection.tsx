import React from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Shield, 
  BarChart3, 
  MessageSquare 
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Clock,
      title: 'Real-Time Coordination',
      description: 'Instant communication between healthcare facilities and EMS providers for faster response times.',
    },
    {
      icon: MapPin,
      title: 'Route Optimization',
      description: 'Intelligent routing algorithms to minimize travel time and maximize efficiency.',
    },
    {
      icon: Users,
      title: 'Multi-User Management',
      description: 'Role-based access control for healthcare facilities, EMS agencies, and administrators.',
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security and compliance to protect sensitive patient information.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Comprehensive dashboards and reports to track performance and optimize operations.',
    },
    {
      icon: MessageSquare,
      title: 'SMS Notifications',
      description: 'Automated SMS alerts to keep all stakeholders informed in real-time.',
    },
  ];

  return (
    <section
      id="features"
      className="py-16 md:py-20"
      style={{ backgroundColor: '#e6f0f8' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serifa text-3xl sm:text-4xl font-medium text-tracc-primary mb-4">
            Powerful Features for Modern Healthcare Transport
          </h2>
          <p className="font-inter-tight text-xl text-tracc-gray max-w-3xl mx-auto">
            Everything you need to streamline medical transport coordination and improve patient care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-tracc-primary/10"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-tracc-neutral rounded-lg mb-4">
                  <IconComponent className="h-6 w-6 text-tracc-primary" />
                </div>
                <h3 className="font-inter-tight text-xl font-semibold text-tracc-primary mb-2">
                  {feature.title}
                </h3>
                <p className="font-inter-tight text-tracc-gray">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
