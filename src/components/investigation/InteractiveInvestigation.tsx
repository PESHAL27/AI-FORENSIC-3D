import React from 'react';
import {
  RotateCcw,
  RotateCw,
  PlusCircle,
  Eye,
  EyeOff,
  Sun,
  MousePointer,
  Compass,
  Layers,
  ArrowUpDown,
  Move,
} from 'lucide-react';
import type { DetectedEntity } from '../../types/investigation';

interface InteractiveInvestigationProps {
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
  onUpdateEntityPosition: (id: string, newPos: [number, number, number]) => void;
  onUpdateEntityRotation: (id: string, rotY: number) => void;
  onToggleVisibility: (id: string) => void;
  onAddEvidenceAtCursor: () => void;
  onRestoreOriginalEntity?: (id: string) => void;
}

export const InteractiveInvestigation: React.FC<InteractiveInvestigationProps> = ({
  entities,
  selectedEntityId,
  onSelectEntity,
  onUpdateEntityRotation,
  onToggleVisibility,
  onAddEvidenceAtCursor,
  onRestoreOriginalEntity,
}) => {
  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  const origPos = selectedEntity?.originalPosition || selectedEntity?.position || [0, 0, 0];
  const currPos = selectedEntity?.position || [0, 0, 0];
  const isPosModified =
    Math.abs(currPos[0] - origPos[0]) > 0.02 ||
    Math.abs(currPos[1] - origPos[1]) > 0.02 ||
    Math.abs(currPos[2] - origPos[2]) > 0.02;

  const handleQuickRotate = (angleDegrees: number) => {
    if (!selectedEntity) return;
    const rad = (angleDegrees * Math.PI) / 180;
    const newY = (selectedEntity.rotation[1] + rad) % (Math.PI * 2);
    onUpdateEntityRotation(selectedEntity.id, newY);
  };

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
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Layers size={12} />
          <span>RECONSTRUCTION ENTITIES</span>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {entities.map((ent) => {
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
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                  {ent.name}
                </span>
                <span style={{ fontSize: '9px', color: isSel ? '#00f0ff' : '#64748b' }}>{ent.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Center: Compact Selected Entity Card + Natural 3D Viewport Interaction Guide */}
      <div style={{
        background: 'rgba(3, 10, 26, 0.75)',
        border: '1px solid rgba(0, 240, 255, 0.16)',
        borderRadius: '8px',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {selectedEntity ? (
          <div>
            {/* Header: Name, Type, and Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '10px',
                  color: '#38bdf8',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  marginBottom: '2px',
                }}>
                  SELECTED ENTITY // FORENSIC TELEMETRY
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}>
                  {selectedEntity.name}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: selectedEntity.visible ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: selectedEntity.visible ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: selectedEntity.visible ? '#4ade80' : '#f87171',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '9.5px',
                  fontWeight: 600,
                }}>
                  {selectedEntity.visible ? 'VISIBLE' : 'HIDDEN'}
                </span>

                {isPosModified && (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    color: '#facc15',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '9.5px',
                    fontWeight: 600,
                  }}>
                    MODIFIED FROM BASELINE
                  </span>
                )}
              </div>
            </div>

            {/* Position Telemetry & RESTORE ORIGINAL Action */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr auto',
              gap: '12px',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '10px',
            }}>
              <div>
                <div style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
                  CURRENT 3D POSITION
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: '#00f0ff', fontWeight: 700 }}>
                  [{currPos.map((n) => n.toFixed(2)).join(', ')}]
                </div>
              </div>

              <div>
                <div style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
                  ORIGINAL CALIBRATED BASELINE
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8' }}>
                  [{origPos.map((n) => n.toFixed(2)).join(', ')}]
                </div>
              </div>

              {/* RESTORE ORIGINAL BUTTON */}
              <button
                onClick={() => onRestoreOriginalEntity?.(selectedEntity.id)}
                title="Return only this entity to its original calibrated position and rotation"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '5px',
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)';
                }}
              >
                <RotateCcw size={12} />
                <span>RESTORE ORIGINAL</span>
              </button>
            </div>

            {/* Natural Viewport Manipulation Guide & Quick Pivots */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '12px',
              alignItems: 'center',
              background: 'rgba(6, 18, 42, 0.6)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              borderRadius: '6px',
              padding: '8px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MousePointer size={14} color="#00f0ff" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 600 }}>
                    Direct Natural Viewport Manipulation
                  </div>
                  <div style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
                    Click & drag directly in 3D scene across floor • Hold Shift for vertical elevation
                  </div>
                </div>
              </div>

              {/* Quick Rotation Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
                  PIVOT:
                </span>
                <button
                  onClick={() => handleQuickRotate(-45)}
                  title="Rotate -45°"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#cbd5e1',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                    cursor: 'pointer',
                  }}
                >
                  -45°
                </button>
                <button
                  onClick={() => handleQuickRotate(45)}
                  title="Rotate +45°"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#cbd5e1',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                    cursor: 'pointer',
                  }}
                >
                  +45°
                </button>
                <button
                  onClick={() => handleQuickRotate(180)}
                  title="Rotate 180°"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#cbd5e1',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                    cursor: 'pointer',
                  }}
                >
                  180°
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#64748b', fontSize: '12px', fontFamily: 'var(--font-mono, monospace)' }}>
            Select an entity in the viewport or left list to inspect and reposition.
          </div>
        )}

        {/* Action Controls Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '8px',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => selectedEntity && onToggleVisibility(selectedEntity.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '5px',
                background: selectedEntity?.visible ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                border: selectedEntity?.visible ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                color: selectedEntity?.visible ? '#f87171' : '#4ade80',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '10.5px',
                cursor: 'pointer',
              }}
            >
              {selectedEntity?.visible ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{selectedEntity?.visible ? 'HIDE ENTITY' : 'SHOW ENTITY'}</span>
            </button>

            <button
              onClick={onAddEvidenceAtCursor}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '5px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#00f0ff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '10.5px',
                cursor: 'pointer',
              }}
            >
              <PlusCircle size={12} />
              <span>TAG EVIDENCE MARKER</span>
            </button>
          </div>

          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
            CENTRALIZED SCENE STATE ACTIVE
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
        gap: '10px',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#cbd5e1',
          }}>
            <span>Forensic Luminescence</span>
            <span style={{ color: '#00f0ff' }}>2.0 lux (Calibrated)</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#cbd5e1',
          }}>
            <span>Spatial Grid Density</span>
            <span style={{ color: '#00f0ff' }}>0.50m (LiDAR)</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#cbd5e1',
          }}>
            <span>Depth Shadow Mapping</span>
            <span style={{ color: '#4ade80' }}>PCFSoft ACTIVE</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#cbd5e1',
          }}>
            <span>Ground Constraint</span>
            <span style={{ color: '#38bdf8' }}>Floor Locked (Y=0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
