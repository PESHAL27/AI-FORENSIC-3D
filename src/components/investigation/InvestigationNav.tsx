import React, { useState } from 'react';
import {
  ShieldAlert,
  ChevronDown,
  Settings,
  User,
  ExternalLink,
  Layers,
  Sparkles,
  Home,
  CheckCircle2,
} from 'lucide-react';
import type { NavigationTab } from '../../types/investigation';

interface InvestigationNavProps {
  activeNavTab: NavigationTab;
  onSelectNavTab: (tab: NavigationTab) => void;
  onReturnHome: () => void;
  caseId: string;
  onOpenUploadModal: () => void;
}

export const InvestigationNav: React.FC<InvestigationNavProps> = ({
  activeNavTab,
  onSelectNavTab,
  onReturnHome,
  caseId,
}) => {
  const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState(false);
  const [profileNotice, setProfileNotice] = useState(false);

  const cases = [
    { id: '2026-FR-0941', name: 'Downtown Office Incident', date: '2026.09.08', status: 'ACTIVE' },
    { id: '2026-FR-0883', name: 'Substation Perimeter Breach', date: '2026.08.22', status: 'ARCHIVED' },
    { id: '2026-FR-0714', name: 'Harbor Vault Egress', date: '2026.07.19', status: 'CLOSED' },
  ];

  const currentCase = cases.find((c) => c.id === caseId) || cases[0];
  const navItems: NavigationTab[] = ['Investigation', 'Scenarios', 'Timeline', 'Evidence', 'Reports'];

  return (
    <header style={{
      height: '56px',
      background: 'rgba(2, 6, 18, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0, 240, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'relative',
      zIndex: 50,
      userSelect: 'none',
    }}>
      {/* Left: Brand + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Logo */}
        <div 
          onClick={onReturnHome}
          title="Return to Home Overview"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(30, 64, 175, 0.4) 100%)',
            border: '1.2px solid rgba(0, 240, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.25)',
          }}>
            <ShieldAlert size={18} color="#00f0ff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--font-display, "Inter", sans-serif)',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              color: '#ffffff',
              lineHeight: 1.1,
            }}>
              AI FORENSIC <span style={{ color: '#00f0ff' }}>3D</span>
            </span>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '9.5px',
              color: '#64748b',
              letterSpacing: '0.8px',
            }}>
              SCIENTIFIC RECONSTRUCTION SUITE
            </span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '22px', background: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Home Quick Jump Button */}
        <button
          onClick={onReturnHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            padding: '4px 10px',
            color: '#94a3b8',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00f0ff';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <Home size={12} />
          <span>PORTAL HOME</span>
        </button>
      </div>

      {/* Center: Main Primary Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {navItems.map((tab) => {
          const isActive = activeNavTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectNavTab(tab)}
              style={{
                position: 'relative',
                background: isActive ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #00f0ff' : '2px solid transparent',
                padding: '16px 14px 14px 14px',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12.5px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#94a3b8';
              }}
            >
              {tab === 'Investigation' && <Layers size={13} color={isActive ? '#00f0ff' : '#64748b'} />}
              <span>{tab.toUpperCase()}</span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#00f0ff',
                  boxShadow: '0 0 6px #00f0ff',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Side: Case Selector, Settings, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Demo Telemetry Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '4px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10.5px',
          color: '#38bdf8',
        }}>
          <Sparkles size={11} />
          <span>DEMO DATA ACTIVE</span>
        </div>

        {/* Case Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCaseDropdownOpen(!caseDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              background: 'rgba(6, 18, 42, 0.8)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: '6px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.8px' }}>
                ACTIVE CASE FILE
              </div>
              <div style={{ fontWeight: 700, color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>#{currentCase.id}</span>
                <span style={{ color: '#cbd5e1', fontWeight: 500, fontSize: '11px' }}>
                  ({currentCase.name})
                </span>
              </div>
            </div>
            <ChevronDown size={14} color="#00f0ff" />
          </button>

          {/* Case Dropdown Menu */}
          {caseDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '320px',
              background: 'rgba(3, 10, 28, 0.98)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '8px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,240,255,0.1)',
              padding: '8px',
              zIndex: 100,
            }}>
              <div style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#64748b',
                padding: '4px 8px 8px 8px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '4px',
              }}>
                SELECT INVESTIGATION REPOSITORY
              </div>
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCaseDropdownOpen(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: c.id === currentCase.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (c.id !== currentCase.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (c.id !== currentCase.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: c.id === currentCase.id ? '#00f0ff' : '#ffffff',
                    }}>
                      Case #{c.id}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: c.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                      color: c.status === 'ACTIVE' ? '#4ade80' : '#94a3b8',
                      border: c.status === 'ACTIVE' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                    }}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          title="Viewport & Reconstruction Settings"
          onClick={() => setSettingsNotice(true)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00f0ff';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }}
        >
          <Settings size={17} />
        </button>

        {/* User Profile Button */}
        <div style={{ position: 'relative' }}>
          <button
            title="Lead Investigator Profile"
            onClick={() => setProfileNotice(true)}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11.5px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f0ff, #1e40af)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={12} color="#020612" />
            </div>
            <span>INV. PESHAL (LEAD)</span>
          </button>
        </div>
      </div>

      {/* Settings Modal Toast */}
      {settingsNotice && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '24px',
          background: 'rgba(6, 18, 42, 0.96)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '8px',
          padding: '16px 20px',
          color: '#ffffff',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f0ff', marginBottom: '6px' }}>
            <Settings size={14} />
            <span style={{ fontWeight: 700 }}>ENGINE PREFERENCES</span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '11px', lineHeight: 1.5 }}>
            • WebGL Render Pipeline: ACES Filmic Tone Mapping<br />
            • Point Cloud Sub-sampling: 1.2M points active<br />
            • Precision Tolerance: 0.05mm
          </p>
          <button
            onClick={() => setSettingsNotice(false)}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid #00f0ff',
              color: '#00f0ff',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Profile Modal Toast */}
      {profileNotice && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '24px',
          background: 'rgba(6, 18, 42, 0.96)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '8px',
          padding: '16px 20px',
          color: '#ffffff',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f0ff', marginBottom: '6px' }}>
            <User size={14} />
            <span style={{ fontWeight: 700 }}>INVESTIGATOR CLEARANCE</span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '11px', lineHeight: 1.5 }}>
            • Clearance: Tier-1 CSI Special Agent<br />
            • Badge: #892-FORENSIC-CR<br />
            • Cryptographic Session: SHA256-VERIFIED
          </p>
          <button
            onClick={() => setProfileNotice(false)}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid #00f0ff',
              color: '#00f0ff',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            CLOSE
          </button>
        </div>
      )}
    </header>
  );
};
