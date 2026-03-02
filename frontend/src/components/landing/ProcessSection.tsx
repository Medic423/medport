import React from 'react';

const SECTION_BG = '#F0F3FF';
const GRID_URL = '/landing/patterns/TRACC_Grid_Tile.svg';

const steps = [
  {
    number: '1',
    title: 'Request',
    description:
      'Clinicians or coordinators submit a transport request within the TRACC portal.',
  },
  {
    number: '2',
    title: 'Match',
    description:
      'TRACC identifies the best available transport provider based on location and needs.',
  },
  {
    number: '3',
    title: 'Transport',
    description:
      'Your teams receive clear instructions and updates for the patient move.',
  },
];

/** Connector 1: Bracket – left of "How TRACC works"; top bar ends at Y-axis of Connector 2 ellipse. Responsive width so it scales with viewport and doesn't overlap text on resize. */
const BracketConnector: React.FC = () => (
  <svg
    viewBox="0 0 1004 420"
    preserveAspectRatio="xMinYMin meet"
    className="flex-shrink-0 h-auto"
    style={{ width: 'min(100%, clamp(280px, 35vw, 576px))' }}
    aria-hidden
  >
    <path d="M 20 0 L 820 0 L 820 20 L 0 20 Q 0 0 20 0 Z" fill="#006AC6" />
    <rect x="0" y="20" width="20" height="333" fill="#006AC6" />
    <rect x="0" y="353" width="91" height="20" fill="#006AC6" />
    <ellipse cx="68" cy="363" rx="23" ry="24" fill="#006AC6" />
  </svg>
);

/** Connector 2: Horizontal bar + dot (lollipop) – between steps. Responsive sizing. */
const Connector2: React.FC = () => (
  <svg
    viewBox="0 0 250 80"
    className="flex-shrink-0 h-auto"
    style={{ width: 'clamp(80px, 10vw, 112px)' }}
    aria-hidden
  >
    <rect x="0" y="30" width="182" height="20" rx="10" fill="#006AC6" />
    <ellipse cx="198" cy="40" rx="23" ry="24" fill="#006AC6" />
  </svg>
);

const ProcessSection: React.FC = () => {
  return (
    <section
      id="quick-start"
      className="relative pt-10 pb-16 md:pt-10 md:pb-24 overflow-visible"
      style={{ backgroundColor: SECTION_BG }}
    >
      {/* Grid pattern – opacity 0.38 per figma */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${GRID_URL})`,
          backgroundSize: '40px 40px',
          backgroundRepeat: 'repeat',
          opacity: 0.38,
        }}
      />

      {/* Section title – bracket is in content row so it flows with layout */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mb-0">
        <h2
          className="font-serifa font-medium text-right"
          style={{
            fontSize: 'clamp(2rem, 5vw, 80px)',
            lineHeight: '131px',
          }}
        >
          <span style={{ color: '#FF5700' }}>How</span>{' '}
          <span style={{ color: '#001872' }}>TRACC works</span>
        </h2>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 md:-mt-8">
        {/* Left bracket + three steps + Connector 2 – all in one flex row so connectors respect resize */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6 lg:gap-8">
          {/* Connector 1: left bracket – first flex item so it flows with content */}
          <div className="hidden md:block flex-shrink-0 self-start pt-8" aria-hidden>
            <BracketConnector />
          </div>
          {steps.map((step) => (
            <React.Fragment key={step.number}>
              <div className="text-center flex-1 min-w-0">
                {/* Step titles: match Who section – BC Novatica 24px */}
                <h3
                  className="font-novatica font-medium mb-1"
                  style={{ fontSize: '24px', color: '#001872' }}
                >
                  {step.number}. {step.title}
                </h3>
                {/* Step descriptions: match Who section – Inter Tight 18px, line-height 26px */}
                <p
                  className="font-inter-tight max-w-sm mx-auto"
                  style={{
                    fontSize: '18px',
                    lineHeight: '26px',
                    color: 'rgba(0, 24, 114, 0.95)',
                  }}
                >
                  {step.description}
                </p>
              </div>
              {step.number !== '3' && (
                <div className="flex justify-center items-center min-w-[80px] md:min-w-[112px] shrink-0">
                  <Connector2 />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
