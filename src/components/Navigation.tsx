import React, { useState } from 'react';
import { ChevronDown, Settings, User, Check, Box } from 'lucide-react';
import type { NavigationTab, CaseOption } from '../types';

interface NavigationProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  selectedCase: CaseOption;
  onSelectCase: (caseItem: CaseOption) => void;
  cases: CaseOption[];
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  selectedCase,
  onSelectCase,
  cases,
  onOpenSettings,
  onOpenProfile,
}) => {
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);

  const tabs: NavigationTab[] = [
    'Home',
    'Investigation',
    'Scenarios',
    'Timeline',
    'Evidence',
    'Reports',
  ];

  return (
    <header style={{
      width: '100%',
      height: '74px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      position: 'relative',
      zIndex: 40,
      borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
      background: 'linear-gradient(180deg, rgba(2, 6, 18, 0.85) 0%, rgba(2, 6, 18, 0.4) 100%)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Left Logo */}
      <div 
        onClick={() => onSelectTab('Home')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.25) 0%, rgba(2, 6, 20, 0.9) 80%)',
          border: '1.5px solid #00f0ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(0, 240, 255, 0.6), inset 0 0 8px rgba(0, 240, 255, 0.3)',
          position: 'relative',
        }}>
          {/* Glowing 3D Cube Icon matching photo */}
          <Box size={20} color="#00f0ff" strokeWidth={2.2} />
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '19px',
          fontWeight: 800,
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{
            color: '#00f0ff',
            textShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
          }}>AI</span>
          <span style={{
            color: '#ffffff',
            letterSpacing: '1.2px',
          }}>FORENSIC</span>
          <span style={{
            color: '#00f0ff',
            textShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
          }}>3D</span>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontSize: '14.5px',
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                padding: '8px 4px',
                position: 'relative',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <span style={{
                textShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.6)' : 'none',
                color: isActive ? '#00f0ff' : 'inherit',
              }}>
                {tab}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  width: '26px',
                  height: '2.5px',
                  background: '#00f0ff',
                  borderRadius: '3px',
                  boxShadow: '0 0 10px #00f0ff, 0 0 20px rgba(0, 240, 255, 0.8)',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        position: 'relative',
      }}>
        {/* Case Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCaseMenuOpen(!caseMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(6, 18, 40, 0.8)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: '20px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.6)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.25)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.4)';
            }}
          >
            <span style={{ color: '#00f0ff', fontSize: '11px' }}>●</span>
            <span>{selectedCase.title}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {/* Case Dropdown Menu */}
          {caseMenuOpen && (
            <div 
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                borderRadius: '12px',
                padding: '8px',
                zIndex: 50,
                border: '1px solid rgba(0, 240, 255, 0.3)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.2)',
              }}
            >
              <div style={{
                padding: '6px 10px 8px 10px',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#64748b',
                fontFamily: 'var(--font-mono)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: '4px',
              }}>
                Select Active Investigation
              </div>

              {cases.map((c) => {
                const isCurrent = c.id === selectedCase.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c);
                      setCaseMenuOpen(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isCurrent ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isCurrent ? '#00f0ff' : '#ffffff',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {c.title}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        marginTop: '2px',
                      }}>
                        {c.status} • {c.date}
                      </div>
                    </div>
                    {isCurrent && <Check size={16} color="#00f0ff" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Investigation System Settings"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(6, 18, 40, 0.6)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94a3b8',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00f0ff';
            e.currentTarget.style.color = '#00f0ff';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)';
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Settings size={17} />
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenProfile}
          title="Forensic Investigator Profile"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(6, 18, 40, 0.9) 100%)',
            border: '1.5px solid rgba(0, 240, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#e2e8f0',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00f0ff';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <User size={18} />
        </button>
      </div>
    </header>
  );
};
