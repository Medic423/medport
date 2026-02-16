/**
 * Demo page to preview the two connector shapes from the Figma design.
 * Route: /connector-demo
 *
 * Connector 1 (Image 1): Vertical bar with dot at bottom-right – "[" shape
 *   Vector 3: 89×373, 20px stroke, #006AC6
 *   Ellipse 1: 45.5×49 at bottom-right, #006AC6
 *
 * Connector 2 (Image 2): Horizontal bar with dot at right – "lollipop" shape
 *   Vector 5: 182×20 horizontal, 20px stroke, #006AC6
 *   Ellipse 2: 45.5×49 at right end, #006AC6
 */

import React from 'react';

const CONNECTOR_COLOR = '#006AC6';
const GRID_URL = '/landing/patterns/TRACC_Grid_Tile.svg';

/** Connector 1: Full bracket "[" shape – rounded corners where horizontal meets vertical, ellipse merged with bottom bar */
const Connector1Bracket: React.FC = () => (
  <svg
    viewBox="0 0 230 420"
    className="w-[230px] h-[420px]"
    aria-hidden
  >
    {/* Top: horizontal bar with rounded left corner (merges into vertical) */}
    <path d="M 20 0 L 102 0 L 102 20 L 0 20 Q 0 0 20 0 Z" fill={CONNECTOR_COLOR} />
    {/* Vertical bar – original length */}
    <rect x="0" y="20" width="20" height="333" fill={CONNECTOR_COLOR} />
    {/* Bottom: horizontal bar – square corner */}
    <rect x="0" y="353" width="182" height="20" fill={CONNECTOR_COLOR} />
    {/* Ellipse – shifted left a few px to merge with bottom bar */}
    <ellipse cx="198" cy="363" rx="23" ry="24" fill={CONNECTOR_COLOR} />
  </svg>
);

/** Connector 2: Horizontal bar with rounded left end + dot at right (lollipop shape) */
const Connector2HorizontalWithDot: React.FC = () => (
  <svg
    viewBox="0 0 250 80"
    className="w-[250px] h-[80px]"
    aria-hidden
  >
    {/* Horizontal bar: 182px long, 20px thick, rounded left end. Figma Vector 5: 182×0, border 20px */}
    <rect
      x="0"
      y="30"
      width="182"
      height="20"
      rx="10"
      fill={CONNECTOR_COLOR}
    />
    {/* Ellipse at right end – shifted left to merge with bar */}
    <ellipse
      cx="198"
      cy="40"
      rx="23"
      ry="24"
      fill={CONNECTOR_COLOR}
    />
  </svg>
);

const ConnectorDemo: React.FC = () => {
  return (
    <div
      className="min-h-screen py-12 px-8"
      style={{ backgroundColor: '#F0F3FF' }}
    >
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url(${GRID_URL})`,
          backgroundSize: '40px 40px',
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8" style={{ color: '#001872' }}>
          Connector Demo – Figma Shapes
        </h1>
        <p className="mb-12 text-gray-600">
          Two connector elements from landing_page_figma_settings.md (Vector 3 + Ellipse 1, Vector 5 + Ellipse 2)
        </p>

        <div className="flex flex-col md:flex-row gap-16 items-start">
          {/* Connector 1 */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium mb-4" style={{ color: '#001872' }}>
              Connector 1: Full bracket (top bar + vertical + Connector 2 at bottom)
            </p>
            <div className="p-8 rounded-lg bg-white/60">
              <Connector1Bracket />
            </div>
          </div>

          {/* Connector 2 */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium mb-4" style={{ color: '#001872' }}>
              Connector 2: Horizontal bar + dot (lollipop shape)
            </p>
            <div className="p-8 rounded-lg bg-white/60">
              <Connector2HorizontalWithDot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectorDemo;
