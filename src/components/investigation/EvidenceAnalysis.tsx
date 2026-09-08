import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Sparkles,
} from 'lucide-react';
import type { ScenarioItem } from '../../types/investigation';

interface EvidenceAnalysisProps {
  currentScenario: ScenarioItem;
}

export const EvidenceAnalysis: React.FC<EvidenceAnalysisProps> = ({ currentScenario }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '14px',
      borderRadius: '8px',
      background: 'rgba(3, 10, 26, 0.75)',
      border: '1px solid rgba(0, 240, 255, 0.18)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          color: '#00f0ff',
        }}>
          <Scale size={15} />
          <span>EVIDENCE CONSISTENCY ANALYSIS</span>
        </div>
      </div>

      {/* Demonstration Data Warning Label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 8px',
        borderRadius: '4px',
        background: 'rgba(234, 179, 8, 0.08)',
        border: '1px solid rgba(234, 179, 8, 0.25)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '9.5px',
        color: '#fbbf24',
      }}>
        <AlertTriangle size={12} />
        <span>DEMONSTRATION DATA // SYNTHETIC CORRELATION MATRIX</span>
      </div>

      {/* Consistency Score Header Card */}
      <div style={{
        padding: '10px 12px',
        borderRadius: '6px',
        background: 'rgba(0, 240, 255, 0.05)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
            CORRELATED SCENARIO: {currentScenario.code}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            {currentScenario.title}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '18px',
            fontWeight: 800,
            color: currentScenario.consistencyScore >= 80 ? '#00f0ff' : '#f59e0b',
          }}>
            {currentScenario.consistencyScore.toFixed(1)}%
          </div>
          <div style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
            CONFIDENCE
          </div>
        </div>
      </div>

      {/* 1. Supporting Evidence */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#4ade80',
          marginBottom: '6px',
        }}>
          <CheckCircle2 size={13} />
          <span>SUPPORTING EVIDENCE ({currentScenario.supportingEvidence.length})</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {currentScenario.supportingEvidence.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '4px',
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
                fontSize: '11px',
                color: '#cbd5e1',
                lineHeight: 1.35,
              }}
            >
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#4ade80',
                marginTop: '6px',
                flexShrink: 0,
              }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Contradictions */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#f87171',
          marginBottom: '6px',
        }}>
          <XCircle size={13} />
          <span>CONTRADICTIONS / ANOMALIES ({currentScenario.contradictions.length})</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {currentScenario.contradictions.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                fontSize: '11px',
                color: '#cbd5e1',
                lineHeight: 1.35,
              }}
            >
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#f87171',
                marginTop: '6px',
                flexShrink: 0,
              }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
