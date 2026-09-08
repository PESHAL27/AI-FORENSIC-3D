import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileCheck,
  Image,
  Video,
  Layers,
  Compass,
  FileText,
  Ruler,
  PlusCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import type { EvidenceUploadType } from '../../types/investigation';

interface UploadEvidenceModalProps {
  isOpen: boolean;
  uploadType: EvidenceUploadType | null;
  onClose: () => void;
  onConfirmUpload: (data: { title: string; category: string; description: string }) => void;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  uploadType,
  onClose,
  onConfirmUpload,
}) => {
  if (!isOpen || !uploadType) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Evidence');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getModalMeta = () => {
    switch (uploadType) {
      case 'image':
        return { title: 'Upload Crime Scene Photograph', icon: <Image size={18} color="#00f0ff" />, accept: '.jpg, .png, .tiff, .raw' };
      case 'multi-image':
        return { title: 'Upload Multiple Photogrammetry Images', icon: <Layers size={18} color="#00f0ff" />, accept: '.zip, .jpg, .png' };
      case 'video':
        return { title: 'Upload Surveillance / Bodycam Video', icon: <Video size={18} color="#00f0ff" />, accept: '.mp4, .mov, .mkv' };
      case '360-image':
        return { title: 'Upload 360° Spherical Panoramic Capture', icon: <Compass size={18} color="#00f0ff" />, accept: '.exr, .hdr, .jpg' };
      case 'report':
        return { title: 'Upload Coroner / Ballistic Forensic Report', icon: <FileText size={18} color="#00f0ff" />, accept: '.pdf, .docx, .json' };
      case 'measurements':
        return { title: 'Upload Laser LiDAR Point Coordinates', icon: <Ruler size={18} color="#00f0ff" />, accept: '.las, .laz, .e57, .xyz, .csv' };
      case 'add-evidence':
        return { title: 'Manual Physical Evidence Placement', icon: <PlusCircle size={18} color="#00f0ff" />, accept: 'All types' };
      default:
        return { title: 'Ingest Forensic Data', icon: <UploadCloud size={18} color="#00f0ff" />, accept: '*.*' };
    }
  };

  const meta = getModalMeta();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmUpload({
        title: title || `Ingested Evidence Item (${uploadType})`,
        category,
        description: description || 'Ingested raw forensic artifact for spatial point-cloud calibration.',
      });
      onClose();
    }, 700);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(2, 6, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'linear-gradient(135deg, rgba(6, 18, 42, 0.98) 0%, rgba(3, 8, 22, 0.99) 100%)',
        border: '1.5px solid rgba(0, 240, 255, 0.35)',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0, 240, 255, 0.15)',
        padding: '28px',
        position: 'relative',
        color: '#ffffff',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {meta.icon}
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display, "Inter", sans-serif)',
              fontSize: '18px',
              fontWeight: 700,
              margin: 0,
            }}>
              {meta.title}
            </h3>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
              ACCEPTED FORMATS: {meta.accept}
            </span>
          </div>
        </div>

        {/* Demonstration Disclaimer */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '6px',
          background: 'rgba(234, 179, 8, 0.08)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10.5px',
          color: '#fbbf24',
          margin: '14px 0',
          lineHeight: 1.4,
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            FRONTEND INGESTION ARCHITECTURE: Uploaded assets will be registered with SHA-256 Chain of Custody. Actual computer vision depth estimation will execute once AI server is connected.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* File Dropzone Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            style={{
              border: dragActive ? '2px dashed #00f0ff' : '1.5px dashed rgba(0, 240, 255, 0.25)',
              borderRadius: '8px',
              padding: '24px 16px',
              textAlign: 'center',
              background: dragActive ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <UploadCloud size={28} color="#00f0ff" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>
              DRAG & DROP FORENSIC FILE HERE
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              or click to browse local investigator workstation
            </div>
          </div>

          {/* Evidence Name */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '4px' }}>
              EVIDENCE LABEL / CATALOG ID
            </label>
            <input
              type="text"
              placeholder="e.g. Item #05: Glass Scatter Near East Threshold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', marginBottom: '4px' }}>
              AI UNDERSTANDING CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(6, 18, 42, 0.95)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12px',
                outline: 'none',
              }}
            >
              <option value="Evidence">Evidence</option>
              <option value="Objects">Objects</option>
              <option value="Furniture">Furniture</option>
              <option value="People">People</option>
              <option value="Doors / Windows">Doors / Windows</option>
              <option value="Environment">Environment</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isProcessing}
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
              {isProcessing ? 'INGESTING...' : 'REGISTER & INGEST EVIDENCE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
