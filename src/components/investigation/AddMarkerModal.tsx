import React, { useState } from 'react';
import {
  X,
  Flag,
  Crosshair,
  Layers,
  MapPin,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import type {
  EvidenceItem,
  EvidenceMarkerItem,
  MarkerCategoryType,
} from '../../types/investigation';

interface AddMarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseEvidence: EvidenceItem[];
  initialCoordinates?: [number, number, number] | null;
  onAddMarker: (markerData: {
    markerType: MarkerCategoryType;
    label: string;
    description: string;
    coordinates: [number, number, number];
    linkedEvidenceId?: string;
  }) => void;
}

export const AddMarkerModal: React.FC<AddMarkerModalProps> = ({
  isOpen,
  onClose,
  caseEvidence,
  initialCoordinates,
  onAddMarker,
}) => {
  if (!isOpen) return null;

  const markerTypes: MarkerCategoryType[] = [
    'Evidence',
    'Person',
    'Object',
    'Damage',
    'Measurement',
    'Unknown',
  ];

  const [markerType, setMarkerType] = useState<MarkerCategoryType>('Evidence');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [linkedEvidenceId, setLinkedEvidenceId] = useState<string>('');
  const [coordX, setCoordX] = useState<number>(initialCoordinates ? initialCoordinates[0] : 0.0);
  const [coordY, setCoordY] = useState<number>(initialCoordinates ? initialCoordinates[1] : 0.25);
  const [coordZ, setCoordZ] = useState<number>(initialCoordinates ? initialCoordinates[2] : 0.0);

  React.useEffect(() => {
    if (initialCoordinates) {
      setCoordX(parseFloat(initialCoordinates[0].toFixed(2)));
      setCoordY(parseFloat(initialCoordinates[1].toFixed(2)));
      setCoordZ(parseFloat(initialCoordinates[2].toFixed(2)));
    }
  }, [initialCoordinates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMarker({
      markerType,
      label: label.trim() || `Marker: ${markerType}`,
      description: description.trim() || `Spatial trace registered under ${markerType} category.`,
      coordinates: [coordX, coordY, coordZ],
      linkedEvidenceId: linkedEvidenceId || undefined,
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 160,
      background: 'rgba(2, 6, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'linear-gradient(135deg, rgba(6, 18, 42, 0.98) 0%, rgba(3, 8, 22, 0.99) 100%)',
        border: '1.5px solid rgba(0, 240, 255, 0.35)',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0, 240, 255, 0.15)',
        padding: '26px',
        position: 'relative',
        color: '#ffffff',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '30px',
            height: '30px',
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
          <X size={15} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1.2px solid rgba(0, 240, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Flag size={18} color="#00f0ff" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display, "Inter", sans-serif)',
              fontSize: '17px',
              fontWeight: 700,
              margin: 0,
            }}>
              ADD 3D EVIDENCE MARKER
            </h3>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
              SPATIAL CALIBRATION & EVIDENCE CORRELATION
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Marker Category Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '6px' }}>
              SELECT MARKER TYPE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {markerTypes.map((type) => {
                const isSel = markerType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMarkerType(type)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '5px',
                      background: isSel ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSel ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSel ? '#00f0ff' : '#94a3b8',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px',
                      fontWeight: isSel ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Marker Label */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '4px' }}>
              MARKER LABEL / DESIGNATION
            </label>
            <input
              type="text"
              placeholder={`e.g. Marker: Latent Ridge Impression / Point Alpha`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          {/* Link to Uploaded Evidence (Optional) */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '4px' }}>
              CORRELATE WITH UPLOADED EVIDENCE (OPTIONAL)
            </label>
            <select
              value={linkedEvidenceId}
              onChange={(e) => setLinkedEvidenceId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(6, 18, 42, 0.95)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11.5px',
                outline: 'none',
              }}
            >
              <option value="">-- No Linked Evidence --</option>
              {caseEvidence.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.id}: {ev.filename} ({ev.type})
                </option>
              ))}
            </select>
          </div>

          {/* 3D Coordinates Position */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '4px' }}>
              INITIAL 3D COORDINATES [X, Y, Z] (METERS)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono, monospace)', color: '#f87171' }}>X (LATERAL)</span>
                <input
                  type="number"
                  step="0.1"
                  value={coordX}
                  onChange={(e) => setCoordX(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11.5px',
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono, monospace)', color: '#4ade80' }}>Y (HEIGHT)</span>
                <input
                  type="number"
                  step="0.05"
                  value={coordY}
                  onChange={(e) => setCoordY(parseFloat(e.target.value) || 0.25)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11.5px',
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono, monospace)', color: '#60a5fa' }}>Z (DEPTH)</span>
                <input
                  type="number"
                  step="0.1"
                  value={coordZ}
                  onChange={(e) => setCoordZ(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11.5px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '4px' }}>
              FORENSIC TRACE DESCRIPTION
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Micro-dispersion glass pattern verified with 98.4% origin confidence."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#94a3b8',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.25) 0%, rgba(30, 64, 175, 0.45) 100%)',
                border: '1.5px solid #00f0ff',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              PLACE MARKER IN 3D SCENE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
