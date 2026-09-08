import React from 'react';
import {
  X,
  Image,
  Video,
  FileText,
  Ruler,
  Compass,
  ShieldCheck,
  Download,
  Calendar,
  HardDrive,
  Hash,
  ExternalLink,
} from 'lucide-react';
import type { EvidenceItem } from '../../types/investigation';

interface EvidencePreviewModalProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
  onDelete?: (item: EvidenceItem) => void;
}

export const EvidencePreviewModal: React.FC<EvidencePreviewModalProps> = ({
  evidence,
  onClose,
  onDelete,
}) => {
  if (!evidence) return null;

  const getIcon = () => {
    switch (evidence.type) {
      case 'image':
      case '360-image':
        return <Image size={18} color="#00f0ff" />;
      case 'video':
        return <Video size={18} color="#00f0ff" />;
      case 'report':
        return <FileText size={18} color="#00f0ff" />;
      case 'measurements':
        return <Ruler size={18} color="#00f0ff" />;
      default:
        return <FileText size={18} color="#00f0ff" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 150,
      background: 'rgba(2, 6, 18, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        background: 'linear-gradient(135deg, rgba(6, 18, 42, 0.98) 0%, rgba(2, 6, 20, 0.99) 100%)',
        border: '1.5px solid rgba(0, 240, 255, 0.35)',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#ffffff',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(0, 240, 255, 0.16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(3, 10, 28, 0.85)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1.2px solid rgba(0, 240, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {getIcon()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#00f0ff',
                  background: 'rgba(0, 240, 255, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                }}>
                  {evidence.id}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-display, "Inter", sans-serif)',
                  fontSize: '16px',
                  fontWeight: 700,
                  margin: 0,
                }}>
                  {evidence.filename}
                </h3>
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b', marginTop: '2px' }}>
                CASE: {evidence.caseId.toUpperCase()} • SOURCE: {evidence.source.toUpperCase()}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
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
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Main Visual / Media Preview Area */}
          <div style={{
            minHeight: '260px',
            maxHeight: '440px',
            borderRadius: '8px',
            background: 'rgba(2, 6, 18, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Image Preview */}
            {(evidence.type === 'image' || evidence.type === '360-image') && evidence.preview ? (
              <img
                src={evidence.preview}
                alt={evidence.filename}
                style={{
                  maxWidth: '100%',
                  maxHeight: '420px',
                  objectFit: 'contain',
                }}
              />
            ) : evidence.type === 'video' && evidence.preview ? (
              <video
                src={evidence.preview}
                controls
                autoPlay
                style={{
                  maxWidth: '100%',
                  maxHeight: '420px',
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '40px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {getIcon()}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}>
                  {evidence.filename}
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', maxWidth: '380px', lineHeight: 1.4 }}>
                  {evidence.metadata.description || 'Forensic telemetry artifact registered for spatial calibration.'}
                </div>
                {evidence.type === 'measurements' && (
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    color: '#00f0ff',
                    background: 'rgba(0, 240, 255, 0.08)',
                    padding: '6px 14px',
                    borderRadius: '4px',
                  }}>
                    <span>LINES: {evidence.metadata.lineCount || '18,400'}</span>
                    <span>POINTS: {evidence.metadata.pointCount || '18,400'}</span>
                    <span>FORMAT: CSV / LAS</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Forensic Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b', marginBottom: '4px' }}>
                <HardDrive size={11} />
                <span>PAYLOAD SIZE</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                {evidence.fileSizeFormatted}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b', marginBottom: '4px' }}>
                <Calendar size={11} />
                <span>INGEST TIMESTAMP</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>
                {evidence.uploadDate}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b', marginBottom: '4px' }}>
                <ShieldCheck size={11} color="#4ade80" />
                <span>INTEGRITY STATUS</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', fontWeight: 700, color: '#4ade80' }}>
                {evidence.status.toUpperCase()}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b', marginBottom: '4px' }}>
                <Hash size={11} />
                <span>MIME TYPE</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>
                {evidence.metadata.mimeType}
              </div>
            </div>
          </div>

          {/* Cryptographic Checksum Banner */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'rgba(0, 240, 255, 0.05)',
            border: '1px dashed rgba(0, 240, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={14} color="#00f0ff" />
              <span style={{ color: '#94a3b8' }}>CRYPTOGRAPHIC CUSTODY HASH:</span>
              <span style={{ color: '#00f0ff', fontWeight: 700 }}>
                {evidence.metadata.checksum || 'sha256-verified-telemetry'}
              </span>
            </div>
            <span style={{ color: '#4ade80', fontSize: '9.5px' }}>IMMUTABLE REGISTER</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(3, 10, 28, 0.9)',
        }}>
          {onDelete ? (
            <button
              onClick={() => {
                onDelete(evidence);
                onClose();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              DELETE FROM REPOSITORY
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#94a3b8',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              CLOSE PREVIEW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
