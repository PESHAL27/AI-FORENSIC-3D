import React from 'react';
import { HeroActions } from './HeroActions';
import { HeroScene } from './HeroScene';

interface HeroSectionProps {
  onStartInvestigation: () => void;
  onExploreDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartInvestigation,
  onExploreDemo,
}) => {
  return (
    <section style={{
      width: '100%',
      maxWidth: '1480px',
      margin: '0 auto',
      padding: '4px 48px 0 48px',
      display: 'grid',
      gridTemplateColumns: 'minmax(460px, 1fr) minmax(540px, 1.35fr)',
      alignItems: 'center',
      flex: 1,
      minHeight: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Left Column: Typography & CTAs */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingRight: '20px',
        zIndex: 15,
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12.5px',
          fontWeight: 600,
          fontStyle: 'italic',
          letterSpacing: '3.5px',
          color: '#38bdf8',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textShadow: '0 0 10px rgba(56, 189, 248, 0.4)',
        }}>
          <span>RECONSTRUCT</span>
          <span style={{ color: 'rgba(0, 240, 255, 0.5)' }}>/</span>
          <span>ANALYZE</span>
          <span style={{ color: 'rgba(0, 240, 255, 0.5)' }}>/</span>
          <span>EXPLORE</span>
        </div>

        {/* Main Heading 1: AI FORENSIC 3D */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 4.4vw, 62px)',
          fontWeight: 900,
          letterSpacing: '-0.5px',
          lineHeight: 1.05,
          marginBottom: '14px',
        }}>
          <span className="text-cyan-brand" style={{ marginRight: '14px' }}>AI</span>
          <span style={{ color: '#ffffff', marginRight: '14px' }}>FORENSIC</span>
          <span className="text-cyan-brand">3D</span>
        </h1>

        {/* Subheading: From Evidence to Possibilities. */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(30px, 3.2vw, 46px)',
          fontWeight: 700,
          lineHeight: 1.15,
          color: '#ffffff',
          marginBottom: '20px',
          letterSpacing: '-0.3px',
        }}>
          <div>From Evidence to</div>
          <div>Possibilities.</div>
        </div>

        {/* Description paragraph */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          lineHeight: 1.6,
          color: '#94a3b8',
          maxWidth: '460px',
          marginBottom: '4px',
        }}>
          Reconstruct real-world scenes, explore possible scenarios, and interact
          with alternative outcomes inside an intelligent 3D environment.
        </p>

        {/* Primary Action Buttons */}
        <HeroActions
          onStartInvestigation={onStartInvestigation}
          onExploreDemo={onExploreDemo}
        />
      </div>

      {/* Right Column: Floating 3D Reconstructed Environment */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Soft cyan atmospheric radial glow behind the floating 3D scene */}
        <div style={{
          position: 'absolute',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 160, 255, 0.22) 0%, rgba(2, 6, 18, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        <HeroScene />
      </div>
    </section>
  );
};
