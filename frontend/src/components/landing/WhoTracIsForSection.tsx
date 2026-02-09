import React from 'react';
import { Building2, Truck, Network } from 'lucide-react';

const WhoTracIsForSection: React.FC = () => {
  const audiences = [
    {
      icon: Building2,
      title: 'Hospitals & Health Systems',
      description: 'We help optimize ER facilities and spaces for a better workflow.',
    },
    {
      icon: Truck,
      title: 'EMS & Transport Providers',
      description: 'There are no roundabouts here, just straightforward routes for your team.',
    },
    {
      icon: Network,
      title: 'Coordinators & Dispatch',
      description: 'We reduce transfer delays and coordinate transports in real time.',
    },
  ];

  return (
    <section id="solutions" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Who TRACC is for
          </h2>
        </div>

        {/* Three Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {audiences.map((audience, index) => {
            const IconComponent = audience.icon;
            return (
              <div
                key={index}
                className="text-center"
              >
                {/* Icon */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {audience.title}
                </h3>
                <p className="text-gray-600">
                  {audience.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhoTracIsForSection;
