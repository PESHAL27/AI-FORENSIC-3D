import React from 'react';
import { Box, Network, Search, SlidersHorizontal, Target } from 'lucide-react';

interface FeatureStripProps {
  onSelectFeature?: (index: number) => void;
}

export const FeatureStrip: React.FC<FeatureStripProps> = ({ onSelectFeature }) => {
  const features = [
    {
      icon: Box,
      title: 'AI Reconstruction',
      subtitle: 'From raw evidence to 3D',
    },
    {
      icon: Network,
      title: 'Multiple Scenarios',
      subtitle: 'Explore every possibility',
    },
    {
      icon: Search,
      title: 'Evidence Analysis',
      subtitle: 'Find what matters',
    },
    {
      icon: SlidersHorizontal,
      title: 'Interactive Simulation',
      subtitle: 'Test your hypotheses',
    },
    {
      icon: Target,
      title: 'Counterfactual Reasoning',
      subtitle: 'What if?',
    },
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: '1280px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 20,
    }}>
      <div 
        className="glass-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          borderRadius: '16px',
          padding: '18px 28px',
          background: 'rgba(4, 12, 28, 0.75)',
          border: '1px solid rgba(0, 240, 255, 0.22)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(0, 240, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top cyan line sheen */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.6) 50%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {features.map((item, index) => {
          const Icon = item.icon;
          const isNotLast = index < features.length - 1;

          return (
            <div
              key={item.title}
              onClick={() => onSelectFeature && onSelectFeature(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4px 18px',
                borderRight: isNotLast ? '1px solid rgba(0, 240, 255, 0.12)' : 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              {/* Icon Container */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <div style={{
                  color: '#00f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.6))',
                }}>
                  <Icon size={19} strokeWidth={2} />
                </div>
              </div>

              {/* Title */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.3px',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
              }}>
                {item.title}
              </div>

              {/* Subtitle */}
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11.5px',
                color: '#94a3b8',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}>
                {item.subtitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
