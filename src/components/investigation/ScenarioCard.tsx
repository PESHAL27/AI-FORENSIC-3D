import React from 'react';
import { ChevronRight, Target, ShieldCheck, AlertCircle } from 'lucide-react';
import type { ScenarioItem } from '../../types/investigation';

interface ScenarioCardProps {
  scenario: ScenarioItem;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isSelected,
  onSelect,
  onViewDetails,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00f0ff';
    if (score >= 70) return '#38bdf8';
    return '#f59e0b';
  };

  const scoreColor = getScoreColor(scenario.consistencyScore);

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '12px 14px',
        borderRadius: '8px',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(6, 18, 42, 0.85) 100%)'
          : 'rgba(255, 255, 255, 0.025)',
        border: isSelected
          ? '1.5px solid #00f0ff'
          : '1px solid rgba(0, 240, 255, 0.14)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.14)';
      }}
    >
      {/* Header: Code + Title + Consistency Score */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#00f0ff',
            marginBottom: '2px',
          }}>
            <Target size={12} />
            <span>SCENARIO {scenario.code}</span>
            <span style={{
              fontSize: '9px',
              color: '#64748b',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1px 5px',
              borderRadius: '3px',
            }}>
              {scenario.badge}
            </span>
          </div>
          <h4 style={{
            fontFamily: 'var(--font-display, "Inter", sans-serif)',
            fontSize: '13px',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}>
            {scenario.title}
          </h4>
        </div>

        {/* Consistency Score Badge */}
        <div style={{
          textAlign: 'right',
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '15px',
            fontWeight: 800,
            color: scoreColor,
            lineHeight: 1,
          }}>
            {scenario.consistencyScore.toFixed(1)}%
          </div>
          <div style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
            CONSISTENCY
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '3px',
        borderRadius: '2px',
        background: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${scenario.consistencyScore}%`,
          height: '100%',
          background: `linear-gradient(90deg, #1e40af 0%, ${scoreColor} 100%)`,
          borderRadius: '2px',
        }} />
      </div>

      {/* Description */}
      <p style={{
        fontSize: '11.5px',
        color: '#94a3b8',
        lineHeight: 1.45,
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {scenario.description}
      </p>

      {/* Visual Preview (Schematic Mini Vector) */}
      <div style={{
        height: '42px',
        borderRadius: '5px',
        background: 'rgba(2, 6, 18, 0.6)',
        border: '1px dashed rgba(0, 240, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 240 42" fill="none">
          {/* Wall reference line */}
          <line x1="20" y1="21" x2="220" y2="21" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
          {/* Trajectory vector */}
          <line
            x1="20"
            y1={scenario.code === 'A' ? 32 : scenario.code === 'B' ? 12 : 36}
            x2="160"
            y2={scenario.code === 'A' ? 16 : scenario.code === 'B' ? 24 : 14}
            stroke={scoreColor}
            strokeWidth="1.8"
          />
          {/* Impact Node */}
          <circle
            cx="160"
            cy={scenario.code === 'A' ? 16 : scenario.code === 'B' ? 24 : 14}
            r="4"
            fill={scoreColor}
          />
          {/* Subject Node */}
          <circle cx="190" cy="21" r="5" fill="rgba(0, 240, 255, 0.3)" stroke="#00f0ff" strokeWidth="1.2" />
        </svg>

        <span style={{
          position: 'absolute',
          right: '8px',
          bottom: '3px',
          fontSize: '8.5px',
          fontFamily: 'var(--font-mono, monospace)',
          color: '#64748b',
        }}>
          ORIGIN: {scenario.originPoint}
        </span>
      </div>

      {/* Bottom Actions: View Details */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: '#00f0ff',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10.5px',
            cursor: 'pointer',
            padding: '2px 0',
          }}
        >
          <span>VIEW RECONSTRUCTION DETAILS</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};
