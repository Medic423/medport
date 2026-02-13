import React from 'react';

const SECTION_BG = '#e6f0f8';
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

const ProcessSection: React.FC = () => {
  return (
    <section
      id="quick-start"
      className="relative pt-10 pb-16 md:pt-10 md:pb-24 overflow-hidden"
      style={{ backgroundColor: SECTION_BG }}
    >
      {/* Grid pattern – square tileable grid for uniform vertical + horizontal lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${GRID_URL})`,
          backgroundSize: '40px 40px',
          backgroundRepeat: 'repeat',
          opacity: 0.22,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title – design: "How" accent, "TRACC works" primary; title aligned right */}
        <div className="text-right mb-12 md:mb-16 pr-4 md:pr-8">
          <h2 className="font-serifa text-[2.5rem] sm:text-5xl md:text-[3.5rem] leading-tight">
            <span style={{ color: '#ff5700' }}>How</span>{' '}
            <span className="text-tracc-primary">TRACC works</span>
          </h2>
        </div>

        {/* Blue path: horizontal line with three nodes (no numbers in circles) */}
        <div className="relative h-2 flex justify-between items-center max-w-4xl mx-auto mb-10 px-4">
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1.5 bg-tracc-primary rounded-full" />
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative z-10 w-10 h-10 rounded-full bg-tracc-primary flex-shrink-0"
              aria-hidden
            />
          ))}
        </div>

        {/* Three steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <h3 className="font-inter-tight font-semibold text-tracc-primary text-xl md:text-2xl mb-3">
                {step.number}. {step.title}
              </h3>
              <p className="font-inter-tight text-tracc-gray text-base md:text-lg leading-relaxed max-w-sm mx-auto">
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
