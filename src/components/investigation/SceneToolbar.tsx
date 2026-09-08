import React from 'react';
import {
  MousePointer,
  Move,
  RotateCw,
  Ruler,
  Flag,
  RefreshCw,
} from 'lucide-react';
import type { ViewportTool } from '../../types/investigation';

interface SceneToolbarProps {
  activeTool: ViewportTool;
  onSelectTool: (tool: ViewportTool) => void;
  onResetScene: () => void;
}

export const SceneToolbar: React.FC<SceneToolbarProps> = ({
  activeTool,
  onSelectTool,
  onResetScene,
}) => {
  const tools: { id: ViewportTool; label: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Select Object (Raycast)', icon: <MousePointer size={16} /> },
    { id: 'move', label: 'Move / Translate Entity', icon: <Move size={16} /> },
    { id: 'rotate', label: 'Rotate Entity Axis', icon: <RotateCw size={16} /> },
    { id: 'measure', label: 'Measure Point-to-Point', icon: <Ruler size={16} /> },
    { id: 'evidence', label: 'Place Evidence Marker', icon: <Flag size={16} /> },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: '16px',
      top: '56px',
      zIndex: 25,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      background: 'rgba(3, 10, 26, 0.88)',
      backdropFilter: 'blur(12px)',
      padding: '6px',
      borderRadius: '8px',
      border: '1px solid rgba(0, 240, 255, 0.25)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    }}>
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            title={tool.label}
            onClick={() => onSelectTool(tool.id)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: isActive ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: isActive ? '1.5px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
              color: isActive ? '#00f0ff' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }
            }}
          >
            {tool.icon}
          </button>
        );
      })}

      <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.12)', margin: '2px 0' }} />

      {/* Reset Tool */}
      <button
        title="Reset Scene to Initial Baseline (Requires Confirmation)"
        onClick={onResetScene}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#38bdf8';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#94a3b8';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        <RefreshCw size={15} />
      </button>
    </div>
  );
};
