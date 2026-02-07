import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onShowRegistration: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onShowRegistration }) => {
  return (
    <section className="py-20 bg-blue-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Transform Your Medical Transport Operations?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join healthcare facilities and EMS providers who are already using TraccEMS 
          to streamline their transport coordination and improve patient care.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onShowRegistration}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-blue-600 bg-white hover:bg-gray-50 rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button
            onClick={() => {
              const element = document.getElementById('features');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white border-2 border-white hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
