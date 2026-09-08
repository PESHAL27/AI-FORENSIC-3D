import React, { useState } from 'react';
import {
  HelpCircle,
  ArrowRight,
  PlayCircle,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import type { CounterfactualBranch } from '../../types/investigation';

interface CounterfactualPanelProps {
  branches: CounterfactualBranch[];
  onApplyCounterfactual: (branch: CounterfactualBranch) => void;
}

export const CounterfactualPanel: React.FC<CounterfactualPanelProps> = ({
  branches,
  onApplyCounterfactual,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationCompleted(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationCompleted(true);
      onApplyCounterfactual(currentBranch);
    }, 1200);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '16px',
      height: '100%',
      color: '#ffffff',
    }}>
      {/* 1. Left: Counterfactual Branches List */}
      <div style={{
        background: 'rgba(3, 10, 26, 0.75)',
        border: '1px solid rgba(0, 240, 255, 0.16)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#00f0ff',
          letterSpacing: '0.8px',
        }}>
          <HelpCircle size={14} />
          <span>"WHAT IF?" HYPOTHESIS BRANCHES</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
          {branches.map((b) => {
            const isSel = b.id === currentBranch.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBranchId(b.id);
                  setSimulationCompleted(false);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: isSel ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSel ? '1.5px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  lineHeight: 1.35,
                }}
              >
                <div style={{ color: isSel ? '#00f0ff' : '#cbd5e1', fontWeight: 700, marginBottom: '3px' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  {b.question}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Right: Side-by-Side Comparison & Simulation Trigger */}
      <div style={{
        background: 'rgba(3, 10, 26, 0.75)',
        border: '1px solid rgba(0, 240, 255, 0.16)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '10px',
                color: '#64748b',
                letterSpacing: '0.8px',
              }}>
                COUNTERFACTUAL ANALYSIS // {currentBranch.targetObject.toUpperCase()}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display, "Inter", sans-serif)',
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                margin: '2px 0 0 0',
              }}>
                {currentBranch.question}
              </h3>
            </div>

            {/* Simulated consistency comparison badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>ORIGINAL</div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: '#4ade80' }}>
                  {currentBranch.originalConsistency.toFixed(1)}%
                </div>
              </div>
              <ArrowRight size={14} color="#64748b" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono, monospace)', color: '#f87171' }}>COUNTERFACTUAL</div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: '#f87171' }}>
                  {currentBranch.projectedConsistency.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side: Original Scene vs Modified Scene */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            {/* Original Scene Box */}
            <div style={{
              background: 'rgba(6, 18, 42, 0.8)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '6px',
              padding: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#38bdf8',
                marginBottom: '8px',
              }}>
                <span>ORIGINAL SCENE STATE</span>
                <span style={{ fontSize: '9px', color: '#64748b' }}>BASELINE</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginBottom: '8px' }}>
                Parameter: <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono, monospace)' }}>{currentBranch.parameterChanged}</span>
              </div>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                background: 'rgba(0,0,0,0.4)',
                padding: '6px 8px',
                borderRadius: '4px',
                color: '#93c5fd',
              }}>
                Value: {currentBranch.originalValue}
              </div>
            </div>

            {/* Modified Scene Box */}
            <div style={{
              background: 'rgba(6, 18, 42, 0.8)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#f87171',
                marginBottom: '8px',
              }}>
                <span>MODIFIED SCENE STATE</span>
                <span style={{ fontSize: '9px', color: '#f87171' }}>PERTURBATION</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginBottom: '8px' }}>
                Outcome: <span style={{ color: '#ffffff', fontWeight: 600 }}>{currentBranch.ballisticOutcome}</span>
              </div>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                background: 'rgba(0,0,0,0.4)',
                padding: '6px 8px',
                borderRadius: '4px',
                color: '#fca5a5',
              }}>
                Value: {currentBranch.modifiedValue}
              </div>
            </div>
          </div>

          {/* Impact Analysis Explanation */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px',
            color: '#cbd5e1',
            lineHeight: 1.5,
          }}>
            <strong style={{ color: '#00f0ff' }}>PHYSICAL INFERENCE: </strong>
            {currentBranch.impactSummary}
          </div>
        </div>

        {/* Footer: Run Simulation Button + Disclaimer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '12px',
          marginTop: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10px',
            color: '#fbbf24',
          }}>
            <AlertTriangle size={12} />
            <span>DEMO ARCHITECTURE: Real physics and AI reasoning engine will be connected in future stage.</span>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '6px',
              background: isSimulating
                ? 'rgba(0, 240, 255, 0.1)'
                : 'linear-gradient(90deg, rgba(0, 240, 255, 0.25) 0%, rgba(30, 64, 175, 0.45) 100%)',
              border: '1.5px solid #00f0ff',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: isSimulating ? 'wait' : 'pointer',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            {isSimulating ? (
              <>
                <RefreshCw size={13} className="spin-animation" />
                <span>COMPUTING COUNTERFACTUAL...</span>
              </>
            ) : simulationCompleted ? (
              <>
                <CheckCircle2 size={13} color="#4ade80" />
                <span>SIMULATION APPLIED</span>
              </>
            ) : (
              <>
                <PlayCircle size={14} color="#00f0ff" />
                <span>RUN SIMULATION</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
