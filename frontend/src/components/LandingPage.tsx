import React from 'react';
import Navigation from './landing/Navigation';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import BenefitsSection from './landing/BenefitsSection';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';

interface LandingPageProps {
  onShowRegistration: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onShowRegistration }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation onShowRegistration={onShowRegistration} />
      <main>
        <HeroSection onShowRegistration={onShowRegistration} />
        <FeaturesSection />
        <BenefitsSection />
        <CTASection onShowRegistration={onShowRegistration} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
