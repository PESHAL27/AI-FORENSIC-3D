import React from 'react';

interface HeroActionsProps {
  onStartInvestigation: () => void;
  onExploreDemo: () => void;
}

export const HeroActions: React.FC<HeroActionsProps> = ({
  onStartInvestigation,
  onExploreDemo,
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginTop: '34px',
      flexWrap: 'wrap',
    }}>
      {/* 1. START INVESTIGATION - Exact Chamfered Cyber Neon Button */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Intense Neon Underglow Bloom (matching reference image) */}
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '10px',
          right: '10px',
          height: '24px',
          background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.85) 0%, rgba(0, 200, 255, 0.4) 45%, transparent 75%)',
          filter: 'blur(8px)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        <button
          onClick={onStartInvestigation}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '238px',
            height: '52px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0px)';
          }}
        >
          {/* SVG Chamfered Cyber Frame */}
          <svg
            width="238"
            height="52"
            viewBox="0 0 238 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'visible',
            }}
          >
            <defs>
              <filter id="cyanNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur1" />
                <feGaussianBlur stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing outer neon halo path */}
            <path
              d="M 16 2 L 222 2 L 236 16 L 236 36 L 222 50 L 16 50 L 2 36 L 2 16 Z"
              stroke="#00f0ff"
              strokeWidth="2.5"
              fill="rgba(2, 6, 18, 0.94)"
              filter="url(#cyanNeonGlow)"
            />

            {/* Inner crisp stroke */}
            <path
              d="M 16 2 L 222 2 L 236 16 L 236 36 L 222 50 L 16 50 L 2 36 L 2 16 Z"
              stroke="#00f0ff"
              strokeWidth="1.8"
              fill="none"
            />

            {/* Accent Corner Notches / Tech Tabs */}
            {/* Top-left chamfer tab */}
            <path d="M 2 16 L 16 2 L 28 2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            {/* Bottom-left corner accent block */}
            <path d="M 2 36 L 16 50 L 30 50" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
            {/* Bottom edge neon highlight bar */}
            <line x1="60" y1="50" x2="178" y2="50" stroke="#00f0ff" strokeWidth="2.5" />
            {/* Top edge accent notch */}
            <line x1="160" y1="2" x2="210" y2="2" stroke="#00f0ff" strokeWidth="2.5" />
          </svg>

          {/* Button Content */}
          <div style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14.5px',
            fontWeight: 700,
            letterSpacing: '1.4px',
            color: '#ffffff',
            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
          }}>
            {/* Thin Cyan Arrow */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
              <path d="M 1 6 L 16 6" stroke="#00f0ff" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 11 1 L 16 6 L 11 11" stroke="#00f0ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>START INVESTIGATION</span>
          </div>
        </button>
      </div>

      {/* 2. EXPLORE DEMO - Exact Chamfered Dark Glass Button */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={onExploreDemo}
          style={{
            position: 'relative',
            width: '185px',
            height: '52px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0px)';
          }}
        >
          {/* SVG Chamfered Frame */}
          <svg
            width="185"
            height="52"
            viewBox="0 0 185 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            {/* Base Chamfered Path */}
            <path
              d="M 14 2 L 171 2 L 183 14 L 183 38 L 171 50 L 14 50 L 2 38 L 2 14 Z"
              stroke="rgba(0, 240, 255, 0.4)"
              strokeWidth="1.6"
              fill="rgba(6, 16, 36, 0.6)"
            />
          </svg>

          {/* Button Content */}
          <div style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '1.4px',
            color: '#e2e8f0',
          }}>
            {/* Thin Play Outline Triangle */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M 3 2 L 12 7 L 3 12 Z" stroke="#38bdf8" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
            </svg>
            <span>EXPLORE DEMO</span>
          </div>
        </button>
      </div>
    </div>
  );
};
