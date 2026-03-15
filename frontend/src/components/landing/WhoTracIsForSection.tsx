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

/** Mirror bracket – vertical on right, ellipse at bottom left; top of bar aligns with left ellipse X */
export const BracketConnectorMirror: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 230 670"
    className={`flex-shrink-0 w-16 md:w-24 h-auto ${className}`}
    aria-hidden
  >
    <g transform="translate(230, 0) scale(-1, 1)">
      <path d="M 20 0 L 182 0 L 182 20 L 0 20 Q 0 0 20 0 Z" fill="#006AC6" />
      <rect x="0" y="20" width="20" height="583" fill="#006AC6" />
      <rect x="0" y="603" width="182" height="20" fill="#006AC6" />
      <ellipse cx="198" cy="613" rx="23" ry="24" fill="#006AC6" />
    </g>
  </svg>
);

/** Connector 2: Horizontal bar + dot (lollipop) – between columns */
const LollipopConnector: React.FC = () => (
  <svg
    viewBox="0 0 250 80"
    className="flex-shrink-0 w-20 md:w-28 h-auto"
    aria-hidden
  >
    <rect x="0" y="30" width="182" height="20" rx="10" fill="#006AC6" />
    <ellipse cx="198" cy="40" rx="23" ry="24" fill="#006AC6" />
  </svg>
);

const WhoTracIsForSection: React.FC = () => {
  return (
    <section
      id="who-tracc-is-for"
      className="relative pt-1 pb-10 md:pt-9 md:pb-10 overflow-visible"
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

      {/* Section title with brackets */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-0 flex items-start gap-4">
          <BracketConnector />
          <h2
            className="font-serifa font-medium flex-1 min-w-0 pr-20 md:pr-24"
            style={{
              fontSize: 'clamp(2rem, 5vw, 80px)',
              lineHeight: '131px',
            }}
          >
            <span style={{ color: '#FF5700' }}>Who</span>{' '}
            <span style={{ color: '#001872' }}>TRACC is for</span>
          </h2>
        </div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8">
        {/* Three columns with Connector 2 (lollipop) between them; Connector 3 on right, top bar aligned with lollipops */}
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-start gap-4 lg:gap-5 -mt-28 md:-mt-32 md:ml-8">
          {audiences.map((audience, index) => (
            <React.Fragment key={index}>
              <div className="text-center flex-1 min-w-0">
                <div className="flex justify-center mb-2">
                  <img
                    src={audience.icon}
                    alt=""
                    className="w-14 h-14 md:w-16 md:h-16 object-contain"
                    aria-hidden
                  />
                </div>
                <h3
                  className="font-novatica font-medium mb-1"
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
              {index < audiences.length - 1 && (
                <div className="flex justify-center items-center min-w-[80px] md:min-w-[112px] shrink-0">
                  <LollipopConnector />
                </div>
              )}
            </React.Fragment>
          ))}
          {/* Connector 3: right side, same padding as Connector 1; top bar aligned with Connector 2 (lollipop) row */}
          <div
            className="absolute right-4 sm:right-6 lg:right-8 top-[calc(50%-10px)] z-10 hidden md:block translate-x-[120px]"
            aria-hidden
          >
            <BracketConnectorMirror />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoTracIsForSection;
