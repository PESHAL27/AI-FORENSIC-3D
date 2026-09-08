import React, { useState } from 'react';
import {
  Glasses,
  Headphones,
  Eye,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const VRPanel: React.FC = () => {
  const [ipd, setIpd] = useState(64);
  const [fov, setFov] = useState(110);
  const [stereoMode, setStereoMode] = useState(false);
  const [spatialAudio, setSpatialAudio] = useState(true);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      gap: '16px',
      height: '100%',
      color: '#ffffff',
    }}>
      {/* 1. Left: Stereoscopic Dual Viewport Simulation */}
      <div style={{
        background: 'rgba(3, 10, 26, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#00f0ff',
          }}>
            <Glasses size={14} />
            <span>IMMERSIVE STEREOSCOPIC 3D / VR TELEMETRY</span>
          </div>

          <span style={{
            fontSize: '9.5px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#4ade80',
            background: 'rgba(34, 197, 94, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(34, 197, 94, 0.25)',
          }}>
            WEBXR PIPELINE READY
          </span>
        </div>

        {/* Dual Eye Split View */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: '#01040a',
          borderRadius: '6px',
          padding: '8px',
          border: '1px solid rgba(0, 240, 255, 0.15)',
        }}>
          {/* Left Eye */}
          <div style={{
            borderRadius: '6px',
            background: 'radial-gradient(circle at 48% 50%, #061e40 0%, #010612 80%)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute',
              top: '8px',
              left: '10px',
              fontSize: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              color: '#38bdf8',
            }}>
              LEFT EYE (CAM-L) // PARALLAX -0.032m
            </span>
            <Glasses size={32} color="rgba(0, 240, 255, 0.3)" />
            <span style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
              PRIMARY FORENSIC PERSPECTIVE
            </span>
          </div>

          {/* Right Eye */}
          <div style={{
            borderRadius: '6px',
            background: 'radial-gradient(circle at 52% 50%, #061e40 0%, #010612 80%)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute',
              top: '8px',
              left: '10px',
              fontSize: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              color: '#38bdf8',
            }}>
              RIGHT EYE (CAM-R) // PARALLAX +0.032m
            </span>
            <Glasses size={32} color="rgba(0, 240, 255, 0.3)" />
            <span style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
              DEPTH PARALLAX SYNCHRONIZED
            </span>
          </div>
        </div>
      </div>

      {/* 2. Right: VR Calibration & Hardware Controls */}
      <div style={{
        background: 'rgba(3, 10, 26, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#00f0ff',
            marginBottom: '14px',
            letterSpacing: '0.8px',
          }}>
            VR HARDWARE & OPTICS CALIBRATION
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* IPD Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '6px' }}>
                <span>Interpupillary Distance (IPD)</span>
                <span style={{ color: '#00f0ff', fontWeight: 700 }}>{ipd} mm</span>
              </div>
              <input
                type="range"
                min="56"
                max="74"
                value={ipd}
                onChange={(e) => setIpd(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* FOV Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '6px' }}>
                <span>Field of View (FOV)</span>
                <span style={{ color: '#00f0ff', fontWeight: 700 }}>{fov}°</span>
              </div>
              <input
                type="range"
                min="80"
                max="130"
                value={fov}
                onChange={(e) => setFov(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* Spatial Audio Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Headphones size={13} color="#38bdf8" />
                <span>3D Spatial Audio Trajectory</span>
              </div>
              <button
                onClick={() => setSpatialAudio(!spatialAudio)}
                style={{
                  background: spatialAudio ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: spatialAudio ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: spatialAudio ? '#00f0ff' : '#64748b',
                  fontSize: '10px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                }}
              >
                {spatialAudio ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        {/* Enter VR Action Button */}
        <div>
          <button
            onClick={() => alert('WebXR Headset Initialization:\nSearching for OpenXR / Meta Quest / Apple Vision Pro runtime... (Demonstration mode active)')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '6px',
              background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.25) 0%, rgba(30, 64, 175, 0.45) 100%)',
              border: '1.5px solid #00f0ff',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)',
            }}
          >
            <Glasses size={15} color="#00f0ff" />
            <span>LAUNCH IMMERSIVE VR SESSION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
