import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { FeatureStrip } from './FeatureStrip';
import { ParticleBackground } from './ParticleBackground';
import { DemoWorkspaceModal } from './DemoWorkspaceModal';
import type { CaseOption } from '../types';

interface HomePageProps {
  onEnterWorkspace: () => void;
  selectedCase: CaseOption;
}

export const HomePage: React.FC<HomePageProps> = ({ onEnterWorkspace, selectedCase }) => {
  const [modalMode, setModalMode] = useState<'investigation' | 'demo' | null>(null);

  const handleStartInvestigation = () => {
    setModalMode('investigation');
  };

  const handleExploreDemo = () => {
    setModalMode('demo');
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      background: 'radial-gradient(ellipse at 50% 30%, #06152e 0%, #030814 65%, #01040a 100%)',
      overflow: 'hidden',
    }}>
      {/* 1. Flowing Cyber Particle Wave Background */}
      <ParticleBackground />

      {/* 2. Hero Section (Left Typography + Right 3D Floating Scene) */}
      <main style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        position: 'relative',
        zIndex: 10,
      }}>
        <HeroSection
          onStartInvestigation={handleStartInvestigation}
          onExploreDemo={handleExploreDemo}
        />

        {/* 3. Bottom Feature Strip */}
        <div style={{ padding: '0 48px', marginBottom: '8px' }}>
          <FeatureStrip onSelectFeature={() => onEnterWorkspace()} />
        </div>
      </main>

      {/* 4. Navigation / Exploration Modal */}
      <DemoWorkspaceModal
        isOpen={modalMode !== null}
        mode={modalMode || 'demo'}
        selectedCase={selectedCase}
        onClose={() => setModalMode(null)}
        onEnterWorkspace={onEnterWorkspace}
      />
    </div>
  );
};
