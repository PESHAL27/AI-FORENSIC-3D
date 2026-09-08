import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { EvidenceItem } from '../../types/investigation';

interface DeleteEvidenceDialogProps {
  isOpen: boolean;
  evidence: EvidenceItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteEvidenceDialog: React.FC<DeleteEvidenceDialogProps> = ({
  isOpen,
  evidence,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !evidence) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
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
        background: 'linear-gradient(135deg, rgba(20, 8, 16, 0.98) 0%, rgba(10, 4, 12, 0.99) 100%)',
        border: '1.5px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 30px rgba(239, 68, 68, 0.2)',
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

        {/* Header with Alert Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AlertTriangle size={20} color="#f87171" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display, "Inter", sans-serif)',
              fontSize: '16px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
            }}>
              CONFIRM EVIDENCE EXPUNCTION
            </h3>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8' }}>
              CHAIN OF CUSTODY LOGGING RECORD
            </span>
          </div>
        </div>

        {/* Evidence Details Card */}
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', fontWeight: 800, color: '#f87171' }}>
              {evidence.id}
            </span>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
              {evidence.fileSizeFormatted}
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', wordBreak: 'break-all' }}>
            {evidence.filename}
          </div>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#cbd5e1',
          lineHeight: 1.5,
          marginBottom: '20px',
        }}>
          Are you sure you wish to remove this evidence item from the current case repository?
          This action will disassociate the artifact and prepare the backend storage object for removal.
        </p>

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
              background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.5) 100%)',
              border: '1.5px solid #ef4444',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={13} />
            <span>CONFIRM DELETE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
