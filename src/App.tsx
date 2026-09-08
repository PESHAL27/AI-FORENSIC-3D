import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { InvestigationPage } from './components/investigation/InvestigationPage';
import type { NavigationTab, CaseOption } from './types';
import './index.css';

const DEFAULT_CASES: CaseOption[] = [
  { id: 'case-001', title: 'Case #2026-FR-0941', status: 'Active Scene', date: '2026.09.08' },
  { id: 'case-002', title: 'Case #2026-FR-0883', status: 'Archived', date: '2026.08.22' },
  { id: 'case-003', title: 'Case #2026-FR-0714', status: 'In Review', date: '2026.08.01' },
];

function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Home');
  const [cases] = useState<CaseOption[]>(DEFAULT_CASES);
  const [selectedCase, setSelectedCase] = useState<CaseOption>(DEFAULT_CASES[0]);

  const handleOpenSettings = () => {
    alert(
      'SYSTEM CONFIGURATION // AI FORENSIC 3D\n\n' +
      '• Render Pipeline: WebGL ACES Filmic Tone Mapping (High-DPI)\n' +
      '• Spatial Telemetry: 0.05mm calibrated LiDAR grid\n' +
      '• Shaders: Soft Shadow PCF with Volumetric Light Scattering\n' +
      '• Point Cloud Density: 18,000 active nodes\n' +
      '• Cryptographic Custody: SHA-256 Enabled'
    );
  };

  const handleOpenProfile = () => {
    alert(
      'INVESTIGATOR CLEARANCE DOSSIER\n\n' +
      '• Lead Investigator: Agent Peshal\n' +
      '• Clearance Level: Tier-1 Forensic Specialist\n' +
      '• Assigned Case: #2026-FR-0941 (Downtown Office Kinetic Event)\n' +
      '• Department: Forensic 3D Crime Scene Reconstruction Unit'
    );
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#020612',
      color: '#ffffff',
      overflow: 'hidden',
    }}>
      {/* 
        STATIC UNIFIED TOP NAVIGATION:
        Remains permanently static, identical in symbol, height, and controls across all views.
      */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        selectedCase={selectedCase}
        onSelectCase={(c) => setSelectedCase(c)}
        cases={cases}
        onOpenSettings={handleOpenSettings}
        onOpenProfile={handleOpenProfile}
      />

      {/* 
        DYNAMIC WORKSPACE CONTENT:
        Navigates strictly to the respective view when the user clicks Home, Investigation, Timeline, etc.
      */}
      <div style={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {activeTab === 'Home' ? (
          <HomePage
            onEnterWorkspace={() => setActiveTab('Investigation')}
            selectedCase={selectedCase}
          />
        ) : (
          <InvestigationPage
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            selectedCase={selectedCase}
          />
        )}
      </div>
    </div>
  );
}

export default App;
