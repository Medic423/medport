import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onShowRegistration: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onShowRegistration }) => {
  return (
    <section className="py-16 md:py-20 bg-tracc-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serifa text-3xl sm:text-4xl font-medium text-white mb-4">
          Ready to Transform Your Medical Transport Operations?
        </h2>
        <p className="font-inter-tight text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join healthcare facilities and EMS providers who are already using
          TRACC to streamline their transport coordination and improve patient
          care.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onShowRegistration}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-inter-tight font-medium text-tracc-primary bg-tracc-accent hover:opacity-90 rounded-md shadow-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-white"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button
            onClick={() => {
              const element = document.getElementById('features');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-inter-tight font-medium text-white border-2 border-white hover:bg-white/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-white"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
