import React from 'react';
import Navigation from './landing/Navigation';
import HeroSection from './landing/HeroSection';
import WhoTracIsForSection from './landing/WhoTracIsForSection';
import ProcessSection from './landing/ProcessSection';
import ReadyToGetStartedSection from './landing/ReadyToGetStartedSection';
import Footer from './landing/Footer';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'SYSTEM_ADMIN' | 'HEALTHCARE_ORGANIZATION_USER' | 'EMS_ORGANIZATION_USER';
}

interface LandingPageProps {
  onLogin: (user: User, token: string, legacyToken: string) => void;
  onShowRegistration: () => void;
}

/**
 * Landing page structure per design: Hero → Who TRACC is for → How TRACC works → Ready to Get Started → Footer
 */
const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onShowRegistration }) => {
  return (
    <div className="min-h-screen bg-white overflow-x-visible">
      <Navigation />
      <main className="overflow-x-visible">
        <HeroSection onLogin={onLogin} onShowRegistration={onShowRegistration} />
        <WhoTracIsForSection />
        <ProcessSection />
        <ReadyToGetStartedSection onShowRegistration={onShowRegistration} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
