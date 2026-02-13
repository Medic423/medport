import React from 'react';

const SECTION_BG = '#e6f0f8';
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

const WhoTracIsForSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative py-16 md:py-24 overflow-hidden"
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
        {/* Section title – only "Who" in orange, "TRACC is for" in dark blue */}
        <div className="mb-12 md:mb-16">
          <h2 className="font-serifa text-[2.5rem] sm:text-5xl md:text-[3.5rem] leading-tight">
            <span style={{ color: '#ff5700' }}>Who</span>{' '}
            <span style={{ color: '#001872' }}>TRACC is for</span>
          </h2>
        </div>

        {/* Connector: L-shaped brackets with horizontal line and 3 nodes – design uses lighter blue #006ac6 */}
        <div className="relative w-full max-w-4xl mx-auto mb-10" aria-hidden>
          <svg
            viewBox="0 0 400 70"
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: 'block' }}
          >
            {/* Left L: vertical down, then horizontal right to first node */}
            <path
              d="M 24 0 L 24 28 L 67 28"
              stroke="#006ac6"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Horizontal through three nodes */}
            <path
              d="M 67 28 L 200 28 L 333 28"
              stroke="#006ac6"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Right L: from third node down, then left (inverted bracket) */}
            <path
              d="M 333 28 L 333 56 L 290 56"
              stroke="#006ac6"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Three circular nodes */}
            <circle cx="67" cy="28" r="6" fill="#006ac6" />
            <circle cx="200" cy="28" r="6" fill="#006ac6" />
            <circle cx="333" cy="28" r="6" fill="#006ac6" />
          </svg>
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {audiences.map((audience, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-5">
                <img
                  src={audience.icon}
                  alt=""
                  className="w-16 h-16 object-contain"
                  aria-hidden
                />
              </div>
              <h3 className="font-inter-tight font-semibold text-xl md:text-2xl mb-3" style={{ color: '#001872' }}>
                {audience.title}
              </h3>
              <p className="font-inter-tight text-base md:text-lg leading-relaxed max-w-sm mx-auto" style={{ color: '#5d5d5d' }}>
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
