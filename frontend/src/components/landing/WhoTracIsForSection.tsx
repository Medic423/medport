import React from 'react';

const SECTION_BG = '#F0F3FF';
const GRID_URL = '/landing/patterns/TRACC_Grid_Tile.svg';
const ICON_BASE = '/landing/images/03%20Icons';

const audiences = [
  {
    icon: `${ICON_BASE}/icon-hospital.svg`,
    title: 'Hospitals & Health Systems',
    description: 'We help optimize ER facilities and spaces for a better work flow.',
  },
  {
    icon: `${ICON_BASE}/icon-ambulance.svg`,
    title: 'EMS & Transport Providers',
    description: 'There are no roundabouts here, just straightforward routes for your team.',
  },
  {
    icon: `${ICON_BASE}/icon-coordinator.svg`,
    title: 'Coordinators & Dispatch',
    description: 'We reduce transfer delays and coordinate transports in real time.',
  },
];

/** Bracket connector – lengthened vertical to reach icons; ellipse aligns with column titles */
const BracketConnector: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 230 480"
    className="flex-shrink-0 w-16 md:w-24 h-auto mt-[65px]"
    aria-hidden
  >
    <path d="M 20 0 L 102 0 L 102 20 L 0 20 Q 0 0 20 0 Z" fill="#006AC6" />
    <rect x="0" y="20" width="20" height="393" fill="#006AC6" />
    <rect x="0" y="413" width="182" height="20" fill="#006AC6" />
    <ellipse cx="198" cy="423" rx="23" ry="24" fill="#006AC6" />
  </svg>
);

const WhoTracIsForSection: React.FC = () => {
  return (
    <section
      id="who-tracc-is-for"
      className="relative pt-1 pb-10 md:pt-9 md:pb-10 overflow-hidden"
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
        {/* Section title with bracket on left – bracket top aligned to center of "W" */}
        <div className="mb-0 flex items-start gap-4">
          <BracketConnector />
          <h2
            className="font-serifa font-medium flex-1"
            style={{
              fontSize: 'clamp(2rem, 5vw, 80px)',
              lineHeight: '131px',
            }}
          >
            <span style={{ color: '#FF5700' }}>Who</span>{' '}
            <span style={{ color: '#001872' }}>TRACC is for</span>
          </h2>
        </div>

        {/* Three columns – icons at top of each text block; shifted right and up ~1 grid square */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 -mt-28 md:-mt-32 ml-[100px]">
          {audiences.map((audience, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <img
                  src={audience.icon}
                  alt=""
                  className="w-14 h-14 md:w-16 md:h-16 object-contain"
                  aria-hidden
                />
              </div>
              <h3
                className="font-novatica font-medium mb-2"
                style={{ fontSize: '24px', color: '#001872' }}
              >
                {audience.title}
              </h3>
              <p
                className="font-inter-tight max-w-sm mx-auto"
                style={{
                  fontSize: '18px',
                  lineHeight: '26px',
                  color: 'rgba(0, 24, 114, 0.95)',
                }}
              >
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoTracIsForSection;
