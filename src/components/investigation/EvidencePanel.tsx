import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Layers,
  Video,
  Compass,
  FileText,
  Ruler,
  PlusCircle,
  Eye,
  EyeOff,
  Crosshair,
  AlertTriangle,
  Sparkles,
  Search,
  Trash2,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Clock,
  X,
} from 'lucide-react';
import type {
  DetectedEntity,
  DetectedObjectCategory,
  EvidenceUploadType,
  EvidenceItem,
  EvidenceUploadProgress,
} from '../../types/investigation';

interface EvidencePanelProps {
  currentCaseId: string;
  caseEvidence: EvidenceItem[];
  detectedEntities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
  onToggleEntityVisibility: (id: string) => void;
  onUploadFiles: (files: FileList | File[], type: EvidenceUploadType) => void;
  onOpenAddMarker: () => void;
  onViewEvidence: (item: EvidenceItem) => void;
  onDeleteEvidence: (item: EvidenceItem) => void;
  uploadProgress: EvidenceUploadProgress | null;
  uploadError: string | null;
  onClearUploadError: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  currentCaseId,
  caseEvidence,
  detectedEntities,
  selectedEntityId,
  onSelectEntity,
  onToggleEntityVisibility,
  onUploadFiles,
  onOpenAddMarker,
  onViewEvidence,
  onDeleteEvidence,
  uploadProgress,
  uploadError,
  onClearUploadError,
}) => {
  const [activeCategory, setActiveCategory] = useState<DetectedObjectCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Hidden file input refs for each specific evidence type
  const singleImageInputRef = useRef<HTMLInputElement | null>(null);
  const multiImageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const panoramicInputRef = useRef<HTMLInputElement | null>(null);
  const reportInputRef = useRef<HTMLInputElement | null>(null);
  const measurementInputRef = useRef<HTMLInputElement | null>(null);

  const categories: DetectedObjectCategory[] = [
    'People',
    'Objects',
    'Furniture',
    'Doors / Windows',
    'Evidence',
    'Environment',
  ];

  const triggerPicker = (type: EvidenceUploadType) => {
    onClearUploadError();
    switch (type) {
      case 'image':
        singleImageInputRef.current?.click();
        break;
      case 'multi-image':
        multiImageInputRef.current?.click();
        break;
      case 'video':
        videoInputRef.current?.click();
        break;
      case '360-image':
        panoramicInputRef.current?.click();
        break;
      case 'report':
        reportInputRef.current?.click();
        break;
      case 'measurements':
        measurementInputRef.current?.click();
        break;
      case 'add-evidence':
        onOpenAddMarker();
        break;
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: EvidenceUploadType
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files, type);
      e.target.value = ''; // reset so same file can be re-uploaded if desired
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onClearUploadError();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files;
      const first = files[0];
      let inferredType: EvidenceUploadType = 'report';
      if (files.length > 1) {
        inferredType = 'multi-image';
      } else if (first.type.startsWith('image/')) {
        inferredType = 'image';
      } else if (first.type.startsWith('video/')) {
        inferredType = 'video';
      } else if (first.name.endsWith('.csv') || first.name.endsWith('.las') || first.name.endsWith('.xyz')) {
        inferredType = 'measurements';
      }
      onUploadFiles(files, inferredType);
    }
  };

  const getEvidenceIcon = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'image':
      case '360-image':
        return <ImageIcon size={13} color="#00f0ff" />;
      case 'video':
        return <Video size={13} color="#00f0ff" />;
      case 'report':
        return <FileText size={13} color="#00f0ff" />;
      case 'measurements':
        return <Ruler size={13} color="#00f0ff" />;
      default:
        return <FileText size={13} color="#00f0ff" />;
    }
  };

  const filteredEntities = detectedEntities.filter((entity) => {
    const matchesCat = activeCategory === 'ALL' || entity.category === activeCategory;
    const matchesSearch =
      entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <aside style={{
      width: '330px',
      height: '100%',
      background: 'rgba(3, 8, 22, 0.95)',
      borderRight: '1px solid rgba(0, 240, 255, 0.16)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      userSelect: 'none',
      zIndex: 20,
      position: 'relative',
    }}>
      {/* Hidden Native File Inputs with Exact Extensions */}
      <input
        type="file"
        ref={singleImageInputRef}
        style={{ display: 'none' }}
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        onChange={(e) => handleFileInputChange(e, 'image')}
      />
      <input
        type="file"
        ref={multiImageInputRef}
        style={{ display: 'none' }}
        multiple
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        onChange={(e) => handleFileInputChange(e, 'multi-image')}
      />
      <input
        type="file"
        ref={videoInputRef}
        style={{ display: 'none' }}
        accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
        onChange={(e) => handleFileInputChange(e, 'video')}
      />
      <input
        type="file"
        ref={panoramicInputRef}
        style={{ display: 'none' }}
        accept=".png,.jpg,.jpeg,.webp,.exr,.hdr"
        onChange={(e) => handleFileInputChange(e, '360-image')}
      />
      <input
        type="file"
        ref={reportInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.docx,.doc,.txt,.json,application/pdf"
        onChange={(e) => handleFileInputChange(e, 'report')}
      />
      <input
        type="file"
        ref={measurementInputRef}
        style={{ display: 'none' }}
        accept=".csv,.json,.txt,.las,.laz,.e57,.xyz"
        onChange={(e) => handleFileInputChange(e, 'measurements')}
      />

      {/* 1. INPUT EVIDENCE SECTION & DRAG-AND-DROP */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(0, 240, 255, 0.12)',
          background: isDragOver
            ? 'linear-gradient(180deg, rgba(0, 240, 255, 0.15) 0%, rgba(6, 18, 42, 0.9) 100%)'
            : 'linear-gradient(180deg, rgba(6, 18, 42, 0.6) 0%, transparent 100%)',
          transition: 'background 0.2s ease',
          position: 'relative',
        }}
      >
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
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '1.2px',
            color: '#00f0ff',
          }}>
            <UploadCloud size={15} />
            <span>INPUT EVIDENCE</span>
          </div>
          <span style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#64748b',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}>
            DRAG & DROP READY
          </span>
        </div>

        {/* 6 Ingest Buttons Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
        }}>
          {[
            { label: 'Upload Image', type: 'image' as EvidenceUploadType, icon: <ImageIcon size={13} /> },
            { label: 'Upload Multiple Images', type: 'multi-image' as EvidenceUploadType, icon: <Layers size={13} /> },
            { label: 'Upload Video', type: 'video' as EvidenceUploadType, icon: <Video size={13} /> },
            { label: 'Upload 360° Image', type: '360-image' as EvidenceUploadType, icon: <Compass size={13} /> },
            { label: 'Upload Report', type: 'report' as EvidenceUploadType, icon: <FileText size={13} /> },
            { label: 'Upload Measurements', type: 'measurements' as EvidenceUploadType, icon: <Ruler size={13} /> },
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={() => triggerPicker(btn.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 8px',
                borderRadius: '5px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                color: '#cbd5e1',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '10.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00f0ff';
                e.currentTarget.style.color = '#00f0ff';
                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.15)';
                e.currentTarget.style.color = '#cbd5e1';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <span style={{ color: '#00f0ff' }}>{btn.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {btn.label}
              </span>
            </button>
          ))}
        </div>

        {/* 7th Action: Add Evidence Marker */}
        <button
          onClick={onOpenAddMarker}
          style={{
            marginTop: '8px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '5px',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.15) 0%, rgba(30, 64, 175, 0.25) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            color: '#ffffff',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 14px rgba(0, 240, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <PlusCircle size={14} color="#00f0ff" />
          <span>ADD EVIDENCE MARKER</span>
        </button>

        {/* Upload Progress Bar */}
        {uploadProgress && (
          <div style={{
            marginTop: '10px',
            padding: '8px 10px',
            borderRadius: '6px',
            background: 'rgba(6, 18, 42, 0.9)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              color: '#00f0ff',
              marginBottom: '4px',
            }}>
              <span>{uploadProgress.statusText}</span>
              <span>{uploadProgress.progress}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${uploadProgress.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00f0ff, #38bdf8)',
                transition: 'width 0.2s ease',
              }} />
            </div>
          </div>
        )}

        {/* Upload Error Alert */}
        {uploadError && (
          <div style={{
            marginTop: '10px',
            padding: '8px 10px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10.5px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={13} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{uploadError}</span>
            </div>
            <button
              onClick={onClearUploadError}
              style={{
                background: 'none',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* 2. CASE EVIDENCE REPOSITORY LIST (Associated strictly with current case) */}
      <div style={{
        maxHeight: '220px',
        borderBottom: '1px solid rgba(0, 240, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(2, 6, 18, 0.7)',
      }}>
        {/* Header */}
        <div style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(6, 18, 42, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#38bdf8',
            letterSpacing: '0.8px',
          }}>
            CASE EVIDENCE ({caseEvidence.length})
          </div>
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
            {currentCaseId.toUpperCase()}
          </span>
        </div>

        {/* Evidence List */}
        <div style={{
          overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          {caseEvidence.map((ev) => (
            <div
              key={ev.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '5px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(0, 240, 255, 0.12)',
                gap: '8px',
              }}
            >
              {/* Thumbnail / Icon */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {ev.preview && (ev.type === 'image' || ev.type === '360-image') ? (
                  <img
                    src={ev.preview}
                    alt={ev.filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getEvidenceIcon(ev.type)
                )}
              </div>

              {/* Metadata details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#00f0ff',
                  }}>
                    {ev.id}
                  </span>
                  <span style={{
                    fontSize: '8.5px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#4ade80',
                    background: 'rgba(34, 197, 94, 0.1)',
                    padding: '1px 4px',
                    borderRadius: '2px',
                  }}>
                    {ev.status.toUpperCase()}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: 'var(--font-mono, monospace)',
                }}>
                  {ev.filename}
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                  {ev.fileSizeFormatted} • {ev.type.toUpperCase()}
                </div>
              </div>

              {/* Action Buttons: View & Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => onViewEvidence(ev)}
                  title="View Evidence Preview & Metadata"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    color: '#00f0ff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Eye size={12} />
                </button>

                <button
                  onClick={() => onDeleteEvidence(ev)}
                  title="Delete Evidence"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {caseEvidence.length === 0 && (
            <div style={{
              padding: '18px 10px',
              textAlign: 'center',
              color: '#64748b',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10.5px',
            }}>
              No evidence artifacts registered in this case repository yet.
            </div>
          )}
        </div>
      </div>

      {/* 3. AI SCENE UNDERSTANDING SECTION */}
      <div style={{
        padding: '12px 16px 8px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '1.2px',
            color: '#e2e8f0',
          }}>
            <Sparkles size={13} color="#00f0ff" />
            <span>AI SCENE UNDERSTANDING</span>
          </div>
        </div>

        {/* Demonstration disclaimer */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '7px',
          padding: '6px 8px',
          borderRadius: '5px',
          background: 'rgba(234, 179, 8, 0.08)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '9.5px',
          color: '#fbbf24',
          lineHeight: 1.35,
        }}>
          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            DEMONSTRATION DATA: Telemetry reflects baseline synthetic scene. Uploaded evidence is queued for next AI extraction stage.
          </span>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={12} color="#64748b" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Filter entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 10px 5px 28px',
              borderRadius: '5px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10.5px',
              outline: 'none',
            }}
          />
        </div>

        {/* Categories Pills */}
        <div style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setActiveCategory('ALL')}
            style={{
              padding: '3px 8px',
              borderRadius: '3px',
              background: activeCategory === 'ALL' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: activeCategory === 'ALL' ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
              color: activeCategory === 'ALL' ? '#00f0ff' : '#94a3b8',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ALL ({detectedEntities.length})
          </button>
          {categories.map((cat) => {
            const count = detectedEntities.filter((e) => e.category === cat).length;
            const isCatActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '3px',
                  background: isCatActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isCatActive ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isCatActive ? '#00f0ff' : '#94a3b8',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Entity List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '6px 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        {filteredEntities.map((entity) => {
          const isSelected = selectedEntityId === entity.id;
          return (
            <div
              key={entity.id}
              onClick={() => onSelectEntity(entity.id)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: isSelected
                  ? 'rgba(0, 240, 255, 0.12)'
                  : 'rgba(255, 255, 255, 0.025)',
                border: isSelected
                  ? '1px solid #00f0ff'
                  : '1px solid rgba(255, 255, 255, 0.07)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Crosshair
                    size={12}
                    color={isSelected ? '#00f0ff' : '#64748b'}
                  />
                  <span style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                  }}>
                    {entity.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: '#00f0ff',
                  }}>
                    {(entity.confidence * 100).toFixed(1)}%
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleEntityVisibility(entity.id);
                    }}
                    title={entity.visible ? 'Hide from 3D Viewport' : 'Show in 3D Viewport'}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: entity.visible ? '#38bdf8' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {entity.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '9.5px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#64748b',
              }}>
                <span>{entity.category}</span>
                <span>
                  [{entity.position[0]}, {entity.position[1]}, {entity.position[2]}]
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
