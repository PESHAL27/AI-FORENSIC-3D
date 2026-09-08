import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';

interface ResetConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmDialog: React.FC<ResetConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 220,
      background: 'rgba(2, 6, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'linear-gradient(135deg, rgba(6, 18, 42, 0.98) 0%, rgba(2, 6, 20, 0.99) 100%)',
        border: '1.5px solid rgba(0, 240, 255, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0, 240, 255, 0.2)',
        padding: '24px',
        color: '#ffffff',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '28px',
            height: '28px',
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
          <X size={14} />
        </button>

        {/* Header with Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <RotateCcw size={20} color="#00f0ff" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display, "Inter", sans-serif)',
              fontSize: '16px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
            }}>
              RESET 3D INVESTIGATION SCENE
            </h3>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8' }}>
              RESTORE DEMONSTRATION BASELINE TELEMETRY
            </span>
          </div>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#cbd5e1',
          lineHeight: 1.5,
          marginBottom: '16px',
        }}>
          Are you sure you want to reset the current 3D forensic environment?
          This will restore:
        </p>

        <ul style={{
          fontSize: '11px',
          color: '#94a3b8',
          fontFamily: 'var(--font-mono, monospace)',
          paddingLeft: '18px',
          margin: '0 0 20px 0',
          lineHeight: 1.6,
        }}>
          <li>Baseline positions and rotations of all furniture and entities</li>
          <li>Original 4 NIST evidence markers</li>
          <li>Baseline forensic measurements and trajectory vectors</li>
          <li>Simulation clock to T-10.00s initial state</li>
          <li>Camera to default isometric crime scene elevation</li>
        </ul>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
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
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
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
            <RotateCcw size={13} color="#00f0ff" />
            <span>CONFIRM SCENE RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
