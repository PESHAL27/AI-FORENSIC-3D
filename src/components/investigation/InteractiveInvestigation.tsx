import React from 'react';
import {
  Move,
  RotateCw,
  PlusCircle,
  Trash2,
  Sliders,
  Sun,
  Grid,
  CheckCircle2,
} from 'lucide-react';
import type { DetectedEntity } from '../../types/investigation';

interface InteractiveInvestigationProps {
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
  onUpdateEntityPosition: (id: string, delta: [number, number, number]) => void;
  onUpdateEntityRotation: (id: string, rotY: number) => void;
  onToggleVisibility: (id: string) => void;
  onAddEvidenceAtCursor: () => void;
}

export const InteractiveInvestigation: React.FC<InteractiveInvestigationProps> = ({
  entities,
  selectedEntityId,
  onSelectEntity,
  onUpdateEntityPosition,
  onUpdateEntityRotation,
  onToggleVisibility,
  onAddEvidenceAtCursor,
}) => {
  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr 280px',
      gap: '16px',
      height: '100%',
      color: '#ffffff',
    }}>
      {/* 1. Entity Selector Column */}
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
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#00f0ff',
          letterSpacing: '0.8px',
        }}>
          SELECT ENTITY TO MANIPULATE
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {entities.slice(0, 7).map((ent) => {
            const isSel = ent.id === selectedEntity?.id;
            return (
              <button
                key={ent.id}
                onClick={() => onSelectEntity(ent.id)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '5px',
                  background: isSel ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSel ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: isSel ? '#ffffff' : '#94a3b8',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ent.name}
                </span>
                <span style={{ fontSize: '9px', color: '#64748b' }}>{ent.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Center: Spatial Coordinate & Rotation Manipulation Sliders */}
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#00f0ff',
            }}>
              <Sliders size={14} />
              <span>SPATIAL TRANSFORM CONTROLS // {selectedEntity.name.toUpperCase()}</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              color: '#38bdf8',
            }}>
              STATUS: {selectedEntity.visible ? 'VISIBLE IN VIEWPORT' : 'HIDDEN'}
            </span>
          </div>

          {/* Coordinate Sliders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* X Slider */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              borderRadius: '6px',
              padding: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '6px' }}>
                <span style={{ color: '#f87171' }}>TRANSLATE X</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{selectedEntity.position[0].toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min="-3.5"
                max="3.5"
                step="0.05"
                value={selectedEntity.position[0]}
                onChange={(e) => {
                  const newX = parseFloat(e.target.value);
                  onUpdateEntityPosition(selectedEntity.id, [newX, selectedEntity.position[1], selectedEntity.position[2]]);
                }}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* Y Slider */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              borderRadius: '6px',
              padding: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '6px' }}>
                <span style={{ color: '#4ade80' }}>TRANSLATE Y (ELEV)</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{selectedEntity.position[1].toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.05"
                value={selectedEntity.position[1]}
                onChange={(e) => {
                  const newY = parseFloat(e.target.value);
                  onUpdateEntityPosition(selectedEntity.id, [selectedEntity.position[0], newY, selectedEntity.position[2]]);
                }}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* Z Slider */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              borderRadius: '6px',
              padding: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '6px' }}>
                <span style={{ color: '#60a5fa' }}>TRANSLATE Z</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{selectedEntity.position[2].toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.05"
                value={selectedEntity.position[2]}
                onChange={(e) => {
                  const newZ = parseFloat(e.target.value);
                  onUpdateEntityPosition(selectedEntity.id, [selectedEntity.position[0], selectedEntity.position[1], newZ]);
                }}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Rotation Row */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RotateCw size={12} color="#00f0ff" />
                <span>HEADING / ROTATION Y AXIS</span>
              </span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>
                {((selectedEntity.rotation[1] * 180) / Math.PI).toFixed(1)}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6.28"
              step="0.05"
              value={selectedEntity.rotation[1]}
              onChange={(e) => {
                onUpdateEntityRotation(selectedEntity.id, parseFloat(e.target.value));
              }}
              style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Action Controls Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '12px',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onToggleVisibility(selectedEntity.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '5px',
                background: selectedEntity.visible ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                border: selectedEntity.visible ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                color: selectedEntity.visible ? '#f87171' : '#4ade80',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
              <span>{selectedEntity.visible ? 'HIDE ENTITY' : 'RESTORE ENTITY'}</span>
            </button>

            <button
              onClick={onAddEvidenceAtCursor}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '5px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#00f0ff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <PlusCircle size={12} />
              <span>SPAWN EVIDENCE MARKER AT POSITION</span>
            </button>
          </div>

          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
            LIVE 3D SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* 3. Right: Environment & Calibration Controls */}
      <div style={{
        background: 'rgba(3, 10, 26, 0.75)',
        border: '1px solid rgba(0, 240, 255, 0.16)',
        borderRadius: '8px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#00f0ff',
          letterSpacing: '0.8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Sun size={13} />
          <span>ENVIRONMENT CALIBRATION</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#cbd5e1',
          }}>
            <span>Forensic Luminescence</span>
            <span style={{ color: '#00f0ff' }}>1.40 lux</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#cbd5e1',
          }}>
            <span>Spatial Grid Density</span>
            <span style={{ color: '#00f0ff' }}>0.50m (Fine)</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#cbd5e1',
          }}>
            <span>Depth Shadow Map</span>
            <span style={{ color: '#4ade80' }}>PCFSoft ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
