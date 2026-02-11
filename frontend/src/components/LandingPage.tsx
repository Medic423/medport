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
  userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
}

interface LandingPageProps {
  onLogin: (user: User, token: string) => void;
  onShowRegistration: () => void;
}

/**
 * Landing page structure per design: Hero → Who TRACC is for → How TRACC works → Ready to Get Started → Footer
 */
const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onShowRegistration }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation onShowRegistration={onShowRegistration} />
      <main>
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
