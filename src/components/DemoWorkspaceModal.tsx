import React from 'react';
import { X, ArrowRight, ShieldCheck, Database, Layers, Sparkles } from 'lucide-react';
import type { CaseOption } from '../types';

interface DemoWorkspaceModalProps {
  isOpen: boolean;
  mode: 'investigation' | 'demo';
  selectedCase: CaseOption;
  onClose: () => void;
}

export const DemoWorkspaceModal: React.FC<DemoWorkspaceModalProps> = ({
  isOpen,
  mode,
  selectedCase,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(2, 6, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          borderRadius: '20px',
          border: '1.5px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.2)',
          padding: '32px',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(6, 18, 42, 0.95) 0%, rgba(3, 8, 20, 0.98) 100%)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00f0ff';
            e.currentTarget.style.color = '#00f0ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <X size={18} />
        </button>

        {/* Header Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          color: '#00f0ff',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          letterSpacing: '1px',
          marginBottom: '16px',
        }}>
          <Sparkles size={13} />
          <span>{mode === 'demo' ? 'PRELOADED DEMONSTRATION' : 'INVESTIGATION WORKSPACE'}</span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '10px',
        }}>
          {mode === 'demo' ? 'Ready to Explore: ' + selectedCase.title : 'Initiate New Investigation'}
        </h2>

        <p style={{
          color: '#94a3b8',
          fontSize: '14.5px',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}>
          {mode === 'demo'
            ? 'A complete indoor crime scene is preloaded with 4 evidence markers, spatial trajectory meshes, and point-cloud telemetry. No evidence upload is required.'
            : 'Access the dedicated 3D forensic reconstruction workbench to ingest photogrammetry scans, calibrate spatial point-clouds, and generate counterfactual outcomes.'}
        </p>

        {/* Feature Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          marginBottom: '28px',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            borderRadius: '12px',
            padding: '14px',
          }}>
            <Database size={18} color="#00f0ff" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              Raw Point Cloud
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Calibrated laser LiDAR telemetry
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            borderRadius: '12px',
            padding: '14px',
          }}>
            <Layers size={18} color="#00f0ff" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              3D Mesh Scene
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Textured room with forensic markers
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            borderRadius: '12px',
            padding: '14px',
          }}>
            <ShieldCheck size={18} color="#00f0ff" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              Chain of Custody
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Cryptographic evidence logs
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
            }}
          >
            RETURN TO HOME
          </button>

          <button
            onClick={() => {
              alert(`Navigating to ${mode === 'demo' ? 'Preloaded Demo' : 'Investigation Workspace'} (${selectedCase.title}).`);
              onClose();
            }}
            className="btn-primary-glow"
            style={{
              padding: '10px 24px',
              borderRadius: '20px',
              fontSize: '13.5px',
            }}
          >
            <span>PROCEED TO WORKSPACE</span>
            <ArrowRight size={16} color="#00f0ff" />
          </button>
        </div>
      </div>
    </div>
  );
};
