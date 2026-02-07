import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onShowRegistration: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onShowRegistration }) => {
  return (
    <section className="pt-16 pb-20 sm:pt-24 sm:pb-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline Medical Transport
              <span className="block text-blue-600 mt-2">Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Connect healthcare facilities with EMS providers seamlessly. 
              Manage transport requests, optimize routes, and improve patient care coordination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onShowRegistration}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('features');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 hover:border-blue-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Learn More
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Trusted by healthcare facilities and EMS providers</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-semibold">24/7</span>
                  <span className="ml-2">Support</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">HIPAA</span>
                  <span className="ml-2">Compliant</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">Secure</span>
                  <span className="ml-2">Platform</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-lg shadow-2xl p-8">
              {/* Placeholder for hero image - replace with actual image from Figma */}
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-400 text-sm">Hero Image Placeholder</p>
                <p className="text-gray-300 text-xs mt-2">Replace with design asset</p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -top-4 -left-4 w-48 h-48 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
