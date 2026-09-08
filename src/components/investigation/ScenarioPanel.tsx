import React from 'react';
import { GitBranch, Sparkles } from 'lucide-react';
import { ScenarioCard } from './ScenarioCard';
import type { ScenarioItem } from '../../types/investigation';

interface ScenarioPanelProps {
  scenarios: ScenarioItem[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onViewDetails: (scenario: ScenarioItem) => void;
}

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onViewDetails,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
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
          <GitBranch size={14} />
          <span>GENERATED SCENARIOS</span>
        </div>

        <span style={{
          fontSize: '9.5px',
          fontFamily: 'var(--font-mono, monospace)',
          color: '#38bdf8',
          background: 'rgba(56, 189, 248, 0.1)',
          padding: '2px 6px',
          borderRadius: '3px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}>
          3 BRANCHES
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scenarios.map((scen) => (
          <ScenarioCard
            key={scen.id}
            scenario={scen}
            isSelected={scen.id === selectedScenarioId}
            onSelect={() => onSelectScenario(scen.id)}
            onViewDetails={() => onViewDetails(scen)}
          />
        ))}
      </div>
    </div>
  );
};
