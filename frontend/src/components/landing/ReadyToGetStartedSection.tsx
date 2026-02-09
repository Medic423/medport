import React from 'react';
import { ArrowRight, Download } from 'lucide-react';

interface ReadyToGetStartedSectionProps {
  onShowRegistration: () => void;
}

const ReadyToGetStartedSection: React.FC<ReadyToGetStartedSectionProps> = ({ onShowRegistration }) => {
  const handleDownloadGuide = () => {
    // Open the quick start guide markdown file
    // The file is served from public/docs/user-guides/
    // Later, this can be converted to PDF download
    window.open('/docs/user-guides/get_started_quick_start.md', '_blank');
  };

  return (
    <section id="ready-to-get-started" className="py-20 bg-blue-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Create your account or explore the Quick Start guide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onShowRegistration}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-blue-600 bg-white hover:bg-gray-50 rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button
            onClick={handleDownloadGuide}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white border-2 border-white hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Quick Start Guide
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReadyToGetStartedSection;
