import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

interface NavigationProps {
  onShowRegistration: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onShowRegistration }) => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 shadow-sm"
      style={{ backgroundColor: '#001872' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo – white on dark blue */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-tracc-primary rounded"
              aria-label="TRACC Home"
            >
              <img
                src="/landing/logos/TRACC_Logo_White.svg"
                alt="TRACC – Medical transport coordination"
                className="h-8 w-auto"
              />
            </button>
          </div>

          {/* Desktop Navigation Links – white */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <button
              onClick={() => scrollToSection('about')}
              className="font-inter-tight font-medium text-white hover:text-tracc-tertiary px-3 py-2 text-sm transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('quick-start')}
              className="font-inter-tight font-medium text-white hover:text-tracc-tertiary px-3 py-2 text-sm transition-colors"
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection('quick-start')}
              className="font-inter-tight font-medium text-white hover:text-tracc-tertiary px-3 py-2 text-sm transition-colors"
            >
              Quick Start
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="font-inter-tight font-medium text-white hover:text-tracc-tertiary px-3 py-2 text-sm transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLoginClick}
              className="hidden sm:flex items-center px-4 py-2 text-sm font-inter-tight font-medium text-white hover:text-tracc-tertiary transition-colors"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </button>
            <button
              onClick={onShowRegistration}
              className="flex items-center px-4 py-2 text-sm font-inter-tight font-medium text-white bg-tracc-accent hover:opacity-90 rounded-md transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-tracc-accent"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Sign Up</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
