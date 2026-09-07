import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { FeatureStrip } from './FeatureStrip';
import { ParticleBackground } from './ParticleBackground';
import { DemoWorkspaceModal } from './DemoWorkspaceModal';
import type { NavigationTab, CaseOption } from '../types';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Home');
  const [modalMode, setModalMode] = useState<'investigation' | 'demo' | null>(null);

  const cases: CaseOption[] = [
    { id: 'case-001', title: 'Case #001', status: 'Active Scene', date: '2026.09.07' },
    { id: 'case-002', title: 'Case #002', status: 'Archived', date: '2026.08.14' },
    { id: 'case-003', title: 'Case #003', status: 'In Review', date: '2026.08.01' },
  ];

  const [selectedCase, setSelectedCase] = useState<CaseOption>(cases[0]);

  const handleStartInvestigation = () => {
    setModalMode('investigation');
  };

  const handleExploreDemo = () => {
    setModalMode('demo');
  };

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab !== 'Home') {
      setModalMode('investigation');
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      background: 'radial-gradient(ellipse at 50% 30%, #06152e 0%, #030814 65%, #01040a 100%)',
      overflow: 'hidden',
    }}>
      {/* 1. Flowing Cyber Particle Wave Background */}
      <ParticleBackground />

      {/* 2. Top Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        selectedCase={selectedCase}
        onSelectCase={setSelectedCase}
        cases={cases}
        onOpenSettings={() => alert('Forensic System Configuration: 3D Shader Quality: Ultra, Point Cloud Density: High, Telemetry Grid: Active.')}
        onOpenProfile={() => alert('Agent ID: 867-B-FORENSIC\nClearance Level: Tier 1 CSI Investigator')}
      />

      {/* 3. Hero Section (Left Typography + Right 3D Floating Scene) */}
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

        {/* 4. Bottom Feature Strip */}
        <div style={{ padding: '0 48px', marginBottom: '8px' }}>
          <FeatureStrip onSelectFeature={(idx) => {
            console.log('Feature clicked:', idx);
          }} />
        </div>
      </main>

      {/* 5. Navigation / Exploration Modal */}
      <DemoWorkspaceModal
        isOpen={modalMode !== null}
        mode={modalMode || 'demo'}
        selectedCase={selectedCase}
        onClose={() => setModalMode(null)}
      />
    </div>
  );
};
