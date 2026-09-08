import React from 'react';
import { X, FileText, Download, ShieldCheck, CheckCircle2, AlertTriangle, Printer } from 'lucide-react';
import type { ScenarioItem, EvidenceMarkerItem } from '../../types/investigation';

interface ForensicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseTitle: string;
  scenario: ScenarioItem;
  markers: EvidenceMarkerItem[];
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  isOpen,
  onClose,
  caseTitle,
  scenario,
  markers,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(2, 6, 18, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '740px',
        maxHeight: '90vh',
        background: 'linear-gradient(135deg, rgba(6, 18, 42, 0.98) 0%, rgba(2, 6, 20, 0.99) 100%)',
        border: '1.5px solid rgba(0, 240, 255, 0.35)',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 240, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#ffffff',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(3, 10, 28, 0.8)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={18} color="#00f0ff" />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display, "Inter", sans-serif)',
                fontSize: '17px',
                fontWeight: 700,
                margin: 0,
              }}>
                FORENSIC RECONSTRUCTION REPORT // {caseTitle}
              </h3>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
                DIGITAL FORENSIC CASE ID: 2026-FR-0941 • SHA-256: 8f9b2c...a4e1
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Report Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Executive Summary Card */}
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            background: 'rgba(0, 240, 255, 0.05)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#00f0ff', fontWeight: 700 }}>
                PRIMARY HYPOTHESIS: SCENARIO {scenario.code} ({scenario.title})
              </span>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '14px',
                fontWeight: 800,
                color: '#00f0ff',
              }}>
                {scenario.consistencyScore.toFixed(1)}% CONSISTENCY
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              {scenario.description}
            </p>
          </div>

          {/* Ballistic & Trajectory Vector Telemetry */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            <div style={{
              padding: '12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>ORIGIN ANGLE</div>
              <div style={{ fontSize: '16px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#ffffff' }}>
                42.4° Azimuth
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>East Glazing Perimeter</div>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>IMPACT FORCE</div>
              <div style={{ fontSize: '16px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#ffffff' }}>
                480 Joules
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Glass Deflection Pattern</div>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>DISPERSION AREA</div>
              <div style={{ fontSize: '16px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#ffffff' }}>
                1.42 m² Cone
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Floor Coordinate [-0.4, 1.3]</div>
            </div>
          </div>

          {/* Evidence Markers Catalog Table */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#00f0ff',
              marginBottom: '8px',
            }}>
              NIST REGISTERED PHYSICAL EVIDENCE CATALOG
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {markers.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '11.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 800,
                      color: '#00f0ff',
                      background: 'rgba(0, 240, 255, 0.12)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      #{m.number}
                    </span>
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{m.label}</span>
                    <span style={{ color: '#64748b', fontSize: '10.5px' }}>({m.type})</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', fontSize: '11px' }}>
                    [{m.coordinates.join(', ')}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(3, 10, 28, 0.9)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', color: '#4ade80' }}>
            <ShieldCheck size={14} />
            <span>CRYPTOGRAPHIC CHAIN OF CUSTODY VERIFIED</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <Printer size={13} />
              <span>PRINT REPORT</span>
            </button>

            <button
              onClick={() => alert('Exporting Forensic Reconstruction Report (JSON & Signed PDF)...')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '6px',
                background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.2) 0%, rgba(30, 64, 175, 0.4) 100%)',
                border: '1.5px solid #00f0ff',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={13} color="#00f0ff" />
              <span>EXPORT CERTIFIED REPORT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
