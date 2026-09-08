import React from 'react';
import { MapPin, Maximize2, Compass, Ruler } from 'lucide-react';
import type { DetectedEntity, EvidenceMarkerItem, MeasurementItem } from '../../types/investigation';

interface EvidenceDiagramProps {
  entities: DetectedEntity[];
  markers: EvidenceMarkerItem[];
  measurements: MeasurementItem[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
}

export const EvidenceDiagram: React.FC<EvidenceDiagramProps> = ({
  entities,
  markers,
  measurements,
  selectedEntityId,
  onSelectEntity,
}) => {
  // Room coordinates: width 7.0m, height 6.2m
  // Map 3D coordinates [x, y, z] to 2D SVG canvas [svgX, svgY]
  // In Three.js: X is left/right (-3.5 to 3.5), Z is front/back (-3.1 to 3.1)
  const toSvgCoords = (x: number, z: number) => {
    const svgX = 350 + (x / 3.5) * 280;
    const svgY = 160 + (z / 3.1) * 110;
    return { x: svgX, y: svgY };
  };

  const person = entities.find((e) => e.type === 'person');
  const chair = entities.find((e) => e.type === 'chair');
  const table = entities.find((e) => e.type === 'table');
  const glass = entities.find((e) => e.type === 'glass');

  const personCoords = person ? toSvgCoords(person.position[0], person.position[2]) : { x: 360, y: 170 };
  const chairCoords = chair ? toSvgCoords(chair.position[0], chair.position[2]) : { x: 200, y: 170 };
  const tableCoords = table ? toSvgCoords(table.position[0], table.position[2]) : { x: 350, y: 140 };
  const glassCoords = glass ? toSvgCoords(glass.position[0], glass.position[2]) : { x: 320, y: 210 };
  const windowBreachCoords = toSvgCoords(-3.0, 0.2);
  const doorCoords = toSvgCoords(2.8, -2.2);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(3, 10, 26, 0.75)',
      border: '1px solid rgba(0, 240, 255, 0.16)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#ffffff',
      userSelect: 'none',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#00f0ff',
          letterSpacing: '0.8px',
        }}>
          <Compass size={14} />
          <span>2D TOP-DOWN EVIDENCE DIAGRAM // ORTHOGRAPHIC PROJECTION</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '10px',
          fontFamily: 'var(--font-mono, monospace)',
          color: '#64748b',
        }}>
          <span>SCALE: 1:50</span>
          <span>GRID: 1.0m SQUARES</span>
          <span style={{ color: '#38bdf8' }}>SYNCED WITH 3D VIEWPORT</span>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div style={{
        flex: 1,
        background: 'rgba(2, 6, 18, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '6px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 700 280">
          <defs>
            <pattern id="diagramGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="0.8" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff3366" />
            </marker>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#diagramGrid)" />

          {/* Room Boundary Walls */}
          <rect
            x="60"
            y="30"
            width="580"
            height="220"
            fill="rgba(6, 18, 42, 0.4)"
            stroke="#00f0ff"
            strokeWidth="2"
            strokeDasharray="none"
          />

          {/* Breached Window Indicator (West / Left Wall) */}
          <line x1="60" y1="120" x2="60" y2="170" stroke="#ef4444" strokeWidth="5" />
          <text x="68" y="148" fill="#f87171" fontSize="9" fontFamily="var(--font-mono, monospace)">
            BREACHED WINDOW (-3.0m)
          </text>

          {/* North Door Indicator (Top-Right Wall) */}
          <line x1="480" y1="30" x2="550" y2="30" stroke="#4ade80" strokeWidth="5" />
          <text x="485" y="44" fill="#4ade80" fontSize="9" fontFamily="var(--font-mono, monospace)">
            EGRESS DOOR (+2.8m)
          </text>

          {/* Trajectory Laser Line (Window to Glass Impact) */}
          <line
            x1={windowBreachCoords.x}
            y1={windowBreachCoords.y}
            x2={glassCoords.x}
            y2={glassCoords.y}
            stroke="#ff3366"
            strokeWidth="2"
            strokeDasharray="4 3"
            markerEnd="url(#arrow)"
          />
          <text
            x={(windowBreachCoords.x + glassCoords.x) / 2 - 40}
            y={(windowBreachCoords.y + glassCoords.y) / 2 - 8}
            fill="#fca5a5"
            fontSize="9"
            fontFamily="var(--font-mono, monospace)"
          >
            AZIMUTH 42.4°
          </text>

          {/* Table / Conference Desk */}
          <rect
            x={tableCoords.x - 70}
            y={tableCoords.y - 30}
            width="140"
            height="60"
            fill="rgba(30, 64, 175, 0.35)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            rx="3"
            onClick={() => table && onSelectEntity(table.id)}
            style={{ cursor: 'pointer' }}
          />
          <text
            x={tableCoords.x}
            y={tableCoords.y + 4}
            fill="#ffffff"
            fontSize="10"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="var(--font-mono, monospace)"
          >
            CONFERENCE DESK
          </text>

          {/* Overturned Chair */}
          <g
            transform={`translate(${chairCoords.x}, ${chairCoords.y})`}
            onClick={() => chair && onSelectEntity(chair.id)}
            style={{ cursor: 'pointer' }}
          >
            <circle r="16" fill="rgba(239, 68, 68, 0.25)" stroke="#f87171" strokeWidth="1.5" />
            <line x1="-12" y1="-12" x2="12" y2="12" stroke="#f87171" strokeWidth="1.5" />
            <line x1="-12" y1="12" x2="12" y2="-12" stroke="#f87171" strokeWidth="1.5" />
            <text x="0" y="24" fill="#f87171" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono, monospace)">
              CHAIR (OVERTURNED)
            </text>
          </g>

          {/* Person Silhouette */}
          <g
            transform={`translate(${personCoords.x}, ${personCoords.y})`}
            onClick={() => person && onSelectEntity(person.id)}
            style={{ cursor: 'pointer' }}
          >
            <circle r="18" fill="rgba(0, 240, 255, 0.25)" stroke="#00f0ff" strokeWidth="2" />
            <circle r="7" fill="#00f0ff" />
            <line x1="0" y1="0" x2="22" y2="-8" stroke="#00f0ff" strokeWidth="2" />
            <text x="0" y="-22" fill="#00f0ff" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono, monospace)">
              SUBJECT ALPHA
            </text>
          </g>

          {/* Glass Dispersion Scatter Points */}
          <circle cx={glassCoords.x} cy={glassCoords.y} r="22" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.4)" strokeDasharray="2 2" />
          <text x={glassCoords.x} y={glassCoords.y + 4} fill="#38bdf8" fontSize="8.5" textAnchor="middle" fontFamily="var(--font-mono, monospace)">
            GLASS DISPERSION
          </text>

          {/* Measurement Lines */}
          {measurements.map((m) => {
            const fromP = toSvgCoords(m.fromCoord[0], m.fromCoord[2]);
            const toP = toSvgCoords(m.toCoord[0], m.toCoord[2]);
            return (
              <g key={m.id}>
                <line
                  x1={fromP.x}
                  y1={fromP.y}
                  x2={toP.x}
                  y2={toP.y}
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle cx={fromP.x} cy={fromP.y} r="2.5" fill="#fbbf24" />
                <circle cx={toP.x} cy={toP.y} r="2.5" fill="#fbbf24" />
                <rect
                  x={(fromP.x + toP.x) / 2 - 24}
                  y={(fromP.y + toP.y) / 2 - 7}
                  width="48"
                  height="14"
                  fill="rgba(2, 6, 18, 0.85)"
                  stroke="#fbbf24"
                  strokeWidth="0.8"
                  rx="2"
                />
                <text
                  x={(fromP.x + toP.x) / 2}
                  y={(fromP.y + toP.y) / 2 + 3}
                  fill="#fbbf24"
                  fontSize="8.5"
                  textAnchor="middle"
                  fontFamily="var(--font-mono, monospace)"
                >
                  {m.distanceMeters.toFixed(2)}m
                </text>
              </g>
            );
          })}

          {/* Evidence Marker Flags (01 - 04) */}
          {markers.map((m) => {
            const pos = toSvgCoords(m.coordinates[0], m.coordinates[2]);
            return (
              <g key={m.id} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r="8" fill="#00f0ff" stroke="#ffffff" strokeWidth="1" />
                <text x="0" y="3" fill="#020612" fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono, monospace)">
                  {m.number}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
