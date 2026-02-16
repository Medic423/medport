import React from 'react';

const SECTION_BG = '#F0F3FF';
const GRID_URL = '/landing/patterns/TRACC_Grid_Tile.svg';
const CONNECTOR_COLOR = '#006AC6';

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

/** Straight horizontal connector bar with three dots – same as Who TRACC is for section */
const ConnectorBar: React.FC = () => (
  <div
    className="relative h-2 flex justify-between items-center max-w-4xl mx-auto mb-10 px-4"
    aria-hidden
  >
    <div
      className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1.5 rounded-full"
      style={{ backgroundColor: CONNECTOR_COLOR }}
    />
    {steps.map((step) => (
      <div
        key={step.number}
        className="relative z-10 w-10 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: CONNECTOR_COLOR }}
        aria-hidden
      />
    ))}
  </div>
);

const ProcessSection: React.FC = () => {
  return (
    <section
      id="quick-start"
      className="relative pt-10 pb-16 md:pt-10 md:pb-24 overflow-hidden"
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title: "How" #FF5700, "TRACC works" #001872; Serifa 80px, line-height 131px; aligned right */}
        <div className="text-right mb-12 md:mb-16 pr-4 md:pr-8">
          <h2
            className="font-serifa font-medium"
            style={{
              fontSize: 'clamp(2rem, 5vw, 80px)',
              lineHeight: '131px',
            }}
          >
            <span style={{ color: '#FF5700' }}>How</span>{' '}
            <span style={{ color: '#001872' }}>TRACC works</span>
          </h2>
        </div>

        {/* Connector: same straight bar with three dots as Who TRACC is for */}
        <ConnectorBar />

        {/* Three steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              {/* Step titles: BC Novatica CYR 36px Medium #001872 */}
              <h3
                className="font-novatica font-medium mb-3"
                style={{ fontSize: '36px', color: '#001872' }}
              >
                {step.number}. {step.title}
              </h3>
              {/* Step descriptions: Inter Tight 24px, line-height 31px, #001872 99% */}
              <p
                className="font-inter-tight max-w-sm mx-auto"
                style={{
                  fontSize: '24px',
                  lineHeight: '31px',
                  color: 'rgba(0, 24, 114, 0.99)',
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
