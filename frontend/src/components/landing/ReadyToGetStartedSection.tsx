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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <h2
          className="font-serifa font-medium text-white mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 78px)', lineHeight: '131px' }}
        >
          Ready to Get Started?
        </h2>
        <p
          className="font-novatica font-medium text-white/90 mb-8 max-w-2xl"
          style={{ fontSize: '30px', lineHeight: '100%' }}
        >
          Create your account or explore the Quick Start guide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-start">
          <button
            onClick={onShowRegistration}
            style={{ backgroundColor: '#ff5700', fontSize: '23px' }}
            className="inline-flex items-center justify-center px-8 py-3 font-inter-tight font-normal text-white hover:opacity-90 rounded-[15px] shadow-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-tracc-accent"
          >
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button
            onClick={handleDownloadGuide}
            style={{ fontSize: '23px' }}
            className="inline-flex items-center justify-center px-8 py-3 font-inter-tight font-normal text-tracc-primary bg-white border-[1.5px] border-[#F0F3FF] hover:bg-tracc-neutral rounded-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-white"
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
