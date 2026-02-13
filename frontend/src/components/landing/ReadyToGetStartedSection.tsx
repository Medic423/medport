import React from 'react';
import { ArrowRight, Download } from 'lucide-react';

interface ReadyToGetStartedSectionProps {
  onShowRegistration: () => void;
}

const ReadyToGetStartedSection: React.FC<ReadyToGetStartedSectionProps> = ({
  onShowRegistration,
}) => {
  const handleDownloadGuide = () => {
    window.open('/docs/user-guides/get_started_quick_start.md', '_blank');
  };

  const ctaBgUrl = '/landing/images/02%20Images/TRACC_CTABanner_Background.png';

  return (
    <section
      id="ready-to-get-started"
      className="relative py-16 md:py-20 overflow-hidden bg-tracc-primary"
      style={{
        backgroundColor: '#001872',
        backgroundImage: `url(${ctaBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serifa text-3xl sm:text-4xl font-medium text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="font-inter-tight text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Create your account or explore the Quick Start guide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onShowRegistration}
            style={{ backgroundColor: '#ff5700' }}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-inter-tight font-medium text-white hover:opacity-90 rounded-md shadow-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-tracc-accent"
          >
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button
            onClick={handleDownloadGuide}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-inter-tight font-medium text-tracc-primary bg-white border-2 border-tracc-primary-light hover:bg-tracc-neutral rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-white"
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
