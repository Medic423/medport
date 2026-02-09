import React from 'react';
import { FileText, Search, Truck } from 'lucide-react';

const ProcessSection: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Request',
      description: 'Clinicians or coordinators submit a transport request within the TRAGG.portal',
      icon: FileText,
    },
    {
      number: '2',
      title: 'Match',
      description: 'TRACC identifies the best available transport provider based on location and needs',
      icon: Search,
    },
    {
      number: '3',
      title: 'Transport',
      description: 'Your teams receive clear instructions and updates for the patient move',
      icon: Truck,
    },
  ];

  return (
    <section id="quick-start" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple three-step process to streamline your medical transport coordination
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-gray-700" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>

                {/* Connector Line (not on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-200 -z-10">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
