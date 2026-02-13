import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const id = href.slice(1);
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  return (
    <footer
      id="contact"
      className="py-12"
      style={{ backgroundColor: '#e6f0f8' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          {/* Brand + tagline – design: logo, "Connecting healthcare and transport providers." */}
          <div>
            <div className="mb-4">
              <img
                src="/landing/logos/TRACC_Logo_FullColor.svg"
                alt="TRACC – Medical transport coordination"
                className="h-8 w-auto"
              />
            </div>
            <p className="font-inter-tight font-semibold text-tracc-primary text-xl max-w-xs">
              Connecting healthcare and transport providers.
            </p>
          </div>

          {/* Links – stacked on right: About, Contact, Privacy Policy, Terms, Pricing */}
          <nav className="flex flex-col items-end gap-2" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link.href)}
                className="font-inter-tight text-sm font-medium text-tracc-primary hover:underline focus:outline-none focus:ring-2 focus:ring-tracc-primary rounded"
              >
                {link.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-tracc-primary/20">
          <p className="font-inter-tight text-sm text-tracc-gray">
            © {new Date().getFullYear()} TraccEMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
