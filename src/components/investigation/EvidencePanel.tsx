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
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Cpu,
  Info,
  ChevronRight,
} from 'lucide-react';
import type {
  DetectedEntity,
  DetectedObjectCategory,
  EvidenceUploadType,
  EvidenceItem,
  EvidenceUploadProgress,
} from '../../types/investigation';
import type { SceneAnalysisResult } from '../../services/api';

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
  // AI Scene Understanding props
  onAnalyzeEvidence?: (item: EvidenceItem) => Promise<void>;
  analyzingEvidenceId?: string | null;
  analysisError?: string | null;
  onClearAnalysisError?: () => void;
  activeAnalysisEvidenceId?: string | null;
  onSelectAnalysisEvidence?: (id: string) => void;
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
  onAnalyzeEvidence,
  analyzingEvidenceId,
  analysisError,
  onClearAnalysisError,
  activeAnalysisEvidenceId,
  onSelectAnalysisEvidence,
}) => {
  const [activeCategory, setActiveCategory] = useState<DetectedObjectCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  // AI Scene Understanding View Mode & Subtab States
  const [understandingViewMode, setUnderstandingViewMode] = useState<'ai_analysis' | '3d_objects'>('ai_analysis');
  const [aiSubTab, setAiSubTab] = useState<'objects' | 'relations' | 'observations' | 'leads'>('objects');
  const [aiObjectCategoryFilter, setAiObjectCategoryFilter] = useState<string>('ALL');

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
                  {ev.analysis?.status === 'COMPLETED' && (
                    <span style={{
                      fontSize: '8px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: '#00f0ff',
                      background: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: 700,
                    }}>
                      <Sparkles size={8} /> AI READY
                    </span>
                  )}
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

              {/* Action Buttons: AI Analyze, View & Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {(ev.type === 'image' || ev.type === '360-image') && (
                  <button
                    onClick={() => {
                      onSelectAnalysisEvidence?.(ev.id);
                      setUnderstandingViewMode('ai_analysis');
                      if (ev.analysis?.status !== 'COMPLETED' && analyzingEvidenceId !== ev.id) {
                        onAnalyzeEvidence?.(ev);
                      }
                    }}
                    title={
                      analyzingEvidenceId === ev.id
                        ? 'AI Vision Analysis running...'
                        : ev.analysis?.status === 'COMPLETED'
                        ? 'View AI Scene Understanding Findings'
                        : ev.analysis?.status === 'FAILED'
                        ? 'Retry AI Scene Understanding'
                        : 'Run AI Scene Understanding on Image'
                    }
                    style={{
                      height: '24px',
                      padding: '0 6px',
                      borderRadius: '4px',
                      background:
                        analyzingEvidenceId === ev.id
                          ? 'rgba(0, 240, 255, 0.2)'
                          : ev.analysis?.status === 'COMPLETED'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : ev.analysis?.status === 'FAILED'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(0, 240, 255, 0.08)',
                      border:
                        analyzingEvidenceId === ev.id
                          ? '1px solid #00f0ff'
                          : ev.analysis?.status === 'COMPLETED'
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : ev.analysis?.status === 'FAILED'
                          ? '1px solid rgba(239, 68, 68, 0.4)'
                          : '1px solid rgba(0, 240, 255, 0.25)',
                      color:
                        analyzingEvidenceId === ev.id
                          ? '#00f0ff'
                          : ev.analysis?.status === 'COMPLETED'
                          ? '#34d399'
                          : ev.analysis?.status === 'FAILED'
                          ? '#f87171'
                          : '#00f0ff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '9.5px',
                      fontWeight: 700,
                    }}
                  >
                    {analyzingEvidenceId === ev.id ? (
                      <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : ev.analysis?.status === 'COMPLETED' ? (
                      <CheckCircle2 size={11} />
                    ) : ev.analysis?.status === 'FAILED' ? (
                      <AlertCircle size={11} />
                    ) : (
                      <Sparkles size={11} />
                    )}
                    <span>
                      {analyzingEvidenceId === ev.id
                        ? 'ANALYZING'
                        : ev.analysis?.status === 'COMPLETED'
                        ? 'AI VIEW'
                        : ev.analysis?.status === 'FAILED'
                        ? 'RETRY'
                        : 'ANALYZE'}
                    </span>
                  </button>
                )}

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

      {/* 3. AI SCENE UNDERSTANDING HEADER & MODE SWITCHER */}
      <div style={{
        padding: '10px 16px 8px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderBottom: '1px solid rgba(0, 240, 255, 0.12)',
        background: 'rgba(3, 8, 22, 0.98)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.2px',
            color: '#e2e8f0',
          }}>
            <Sparkles size={13} color="#00f0ff" />
            <span>AI SCENE UNDERSTANDING</span>
          </div>

          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            padding: '2px',
            gap: '2px',
          }}>
            <button
              onClick={() => setUnderstandingViewMode('ai_analysis')}
              style={{
                padding: '2px 8px',
                borderRadius: '3px',
                background: understandingViewMode === 'ai_analysis' ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
                border: 'none',
                color: understandingViewMode === 'ai_analysis' ? '#00f0ff' : '#64748b',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9.5px',
                fontWeight: understandingViewMode === 'ai_analysis' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              AI VISION
            </button>
            <button
              onClick={() => setUnderstandingViewMode('3d_objects')}
              style={{
                padding: '2px 8px',
                borderRadius: '3px',
                background: understandingViewMode === '3d_objects' ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
                border: 'none',
                color: understandingViewMode === '3d_objects' ? '#00f0ff' : '#64748b',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9.5px',
                fontWeight: understandingViewMode === '3d_objects' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              3D SCENE ({detectedEntities.length})
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONTENT AREA: DUAL-MODE (AI VISION OR 3D SCENE) */}
      {understandingViewMode === 'ai_analysis' ? (
        (() => {
          const imageEvidenceList = caseEvidence.filter(
            (e) => e.type === 'image' || e.type === '360-image'
          );
          const activeAnalysisEvidence =
            imageEvidenceList.find((e) => e.id === activeAnalysisEvidenceId) ||
            imageEvidenceList.find((e) => e.analysis?.status === 'COMPLETED') ||
            imageEvidenceList[0] ||
            null;

          const currentAnalyzing = Boolean(
            activeAnalysisEvidence && analyzingEvidenceId === activeAnalysisEvidence.id
          );
          const currentAnalysisResult: SceneAnalysisResult | null =
            activeAnalysisEvidence?.analysis?.result || null;
          const currentAnalysisError =
            activeAnalysisEvidence?.analysis?.error_message ||
            (activeAnalysisEvidence?.id === activeAnalysisEvidenceId ? analysisError : null);

          return (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 12px 16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {/* Evidence Photo Selector Pills if multiple */}
              {imageEvidenceList.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none',
                }}>
                  {imageEvidenceList.map((img) => {
                    const isSelected = activeAnalysisEvidence?.id === img.id;
                    const hasCompleted = img.analysis?.status === 'COMPLETED';
                    const isAnal = analyzingEvidenceId === img.id;
                    return (
                      <button
                        key={img.id}
                        onClick={() => onSelectAnalysisEvidence?.(img.id)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: isSelected ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '9.5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        <ImageIcon size={10} color={isSelected ? '#00f0ff' : '#64748b'} />
                        <span>{img.id}</span>
                        {hasCompleted && <CheckCircle2 size={10} color="#34d399" />}
                        {isAnal && <RefreshCw size={10} color="#00f0ff" style={{ animation: 'spin 1s linear infinite' }} />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No images uploaded */}
              {imageEvidenceList.length === 0 && (
                <div style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderRadius: '6px',
                  border: '1px dashed rgba(255, 255, 255, 0.08)',
                  margin: '8px 4px',
                }}>
                  <ImageIcon size={26} color="#00f0ff" style={{ opacity: 0.35, margin: '0 auto 8px' }} />
                  <div style={{ color: '#cbd5e1', fontWeight: 600 }}>NO EVIDENCE PHOTOS YET</div>
                  <div style={{ fontSize: '9.5px', marginTop: '4px', color: '#64748b', lineHeight: 1.4 }}>
                    Upload crime scene photos or 360° captures above to activate AI Scene Understanding.
                  </div>
                </div>
              )}

              {/* In Progress Analyzing Scanner */}
              {currentAnalyzing && (
                <div style={{
                  padding: '16px 12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(6, 18, 42, 0.95) 100%)',
                  border: '1px solid rgba(0, 240, 255, 0.45)',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '10px',
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1.5px solid #00f0ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RefreshCw size={20} color="#00f0ff" style={{ animation: 'spin 1.2s linear infinite' }} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#00f0ff',
                      letterSpacing: '0.8px',
                    }}>
                      AI FORENSIC SCANNING
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '10px',
                      color: '#ffffff',
                      marginTop: '4px',
                    }}>
                      Analyzing {activeAnalysisEvidence?.filename}...
                    </div>
                    <div style={{
                      fontSize: '9px',
                      color: '#94a3b8',
                      marginTop: '4px',
                      lineHeight: 1.35,
                    }}>
                      Extracting spatial geometry, room classification, detected objects & evidentiary anomalies.
                    </div>
                  </div>
                </div>
              )}

              {/* Error or Missing API Key Message */}
              {!currentAnalyzing && currentAnalysisError && !currentAnalysisResult && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', fontWeight: 700 }}>
                    <AlertTriangle size={13} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>AI VISION UNAVAILABLE</span>
                  </div>

                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#fca5a5', lineHeight: 1.35 }}>
                    {currentAnalysisError}
                  </div>

                  {/* Environment Configuration Guide */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.55)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '9.5px',
                    color: '#cbd5e1',
                    lineHeight: 1.45,
                  }}>
                    <div style={{ color: '#00f0ff', fontWeight: 700, marginBottom: '4px' }}>
                      CONFIGURATION REQUIRED:
                    </div>
                    <div>1. Open <span style={{ color: '#fef08a' }}>backend/.env</span></div>
                    <div>2. Add your OpenRouter (or OpenAI / Gemini) key:</div>
                    <div style={{
                      color: '#38bdf8',
                      background: 'rgba(0, 240, 255, 0.08)',
                      padding: '3px 6px',
                      borderRadius: '3px',
                      marginTop: '3px',
                      wordBreak: 'break-all',
                    }}>
                      OPENROUTER_API_KEY=sk-or-v1-...
                    </div>
                    <div style={{ color: '#64748b', fontSize: '8.5px', marginTop: '2px' }}>
                      # Optional: AI_MODEL=anthropic/claude-3.5-sonnet
                    </div>
                    <div style={{ marginTop: '4px' }}>3. Click Retry below to run live analysis</div>
                  </div>

                  {activeAnalysisEvidence && (
                    <button
                      onClick={() => onAnalyzeEvidence?.(activeAnalysisEvidence)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '5px',
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '1px solid rgba(0, 240, 255, 0.4)',
                        color: '#00f0ff',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <RefreshCw size={11} />
                      <span>RETRY SCENE ANALYSIS</span>
                    </button>
                  )}
                </div>
              )}

              {/* Ready to Analyze State (Image exists, not analyzed yet) */}
              {!currentAnalyzing && !currentAnalysisResult && !currentAnalysisError && activeAnalysisEvidence && (
                <div style={{
                  padding: '16px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(0, 240, 255, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '10px',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={16} color="#00f0ff" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>
                      READY FOR AI EXTRACTION
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
                      {activeAnalysisEvidence.id}: {activeAnalysisEvidence.filename}
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', lineHeight: 1.35 }}>
                      Run multimodal AI vision analysis to extract classified objects, physical relationships, and forensic markers.
                    </div>
                  </div>

                  <button
                    onClick={() => onAnalyzeEvidence?.(activeAnalysisEvidence)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '5px',
                      background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.2) 0%, rgba(30, 64, 175, 0.35) 100%)',
                      border: '1px solid rgba(0, 240, 255, 0.45)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sparkles size={13} color="#00f0ff" />
                    <span>ANALYZE SCENE WITH AI</span>
                  </button>
                </div>
              )}

              {/* Real AI Analysis Results View */}
              {currentAnalysisResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Scene Overview Card */}
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.08) 0%, rgba(6, 18, 42, 0.8) 100%)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: '#00f0ff',
                        background: 'rgba(0, 240, 255, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                      }}>
                        {currentAnalysisResult.scene_type || 'CLASSIFIED SCENE'}
                      </span>
                      <span style={{
                        fontSize: '8.5px',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#64748b',
                      }}>
                        {activeAnalysisEvidence?.analysis?.model || 'AI VISION'}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '10.5px',
                      color: '#cbd5e1',
                      lineHeight: 1.45,
                      fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      {currentAnalysisResult.overall_description}
                    </div>
                  </div>

                  {/* Sub-tab Navigation */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '3px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '2px',
                    borderRadius: '5px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}>
                    {[
                      { id: 'objects' as const, label: `OBJS (${currentAnalysisResult.objects.length})` },
                      { id: 'relations' as const, label: `REL (${currentAnalysisResult.relationships.length})` },
                      { id: 'observations' as const, label: `OBS (${currentAnalysisResult.observations.length})` },
                      { id: 'leads' as const, label: `LEADS (${currentAnalysisResult.possible_evidence.length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setAiSubTab(tab.id)}
                        style={{
                          padding: '4px 2px',
                          borderRadius: '3px',
                          background: aiSubTab === tab.id ? 'rgba(0, 240, 255, 0.22)' : 'transparent',
                          border: aiSubTab === tab.id ? '1px solid rgba(0, 240, 255, 0.4)' : 'none',
                          color: aiSubTab === tab.id ? '#00f0ff' : '#64748b',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '9px',
                          fontWeight: aiSubTab === tab.id ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 1. OBJECTS SUB-TAB */}
                  {aiSubTab === 'objects' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Category filter for detected objects */}
                      <div style={{
                        display: 'flex',
                        gap: '4px',
                        overflowX: 'auto',
                        paddingBottom: '2px',
                        scrollbarWidth: 'none',
                      }}>
                        {['ALL', ...Array.from(new Set(currentAnalysisResult.objects.map((o) => o.category)))].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setAiObjectCategoryFilter(cat)}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '3px',
                              background: aiObjectCategoryFilter === cat ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                              border: aiObjectCategoryFilter === cat ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                              color: aiObjectCategoryFilter === cat ? '#00f0ff' : '#94a3b8',
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '9px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {currentAnalysisResult.objects
                        .filter((obj) => aiObjectCategoryFilter === 'ALL' || obj.category === aiObjectCategoryFilter)
                        .map((obj) => (
                          <div
                            key={obj.id}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.025)',
                              border: '1px solid rgba(0, 240, 255, 0.15)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  fontSize: '9px',
                                  fontFamily: 'var(--font-mono, monospace)',
                                  color: '#00f0ff',
                                  fontWeight: 700,
                                }}>
                                  {obj.id}
                                </span>
                                <span style={{
                                  fontSize: '11px',
                                  fontFamily: 'var(--font-mono, monospace)',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                }}>
                                  {obj.name}
                                </span>
                              </div>
                              <span style={{
                                fontSize: '8.5px',
                                fontFamily: 'var(--font-mono, monospace)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                fontWeight: 700,
                              }}>
                                {(obj.confidence * 100).toFixed(0)}% CONF
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '9px',
                              fontFamily: 'var(--font-mono, monospace)',
                              color: '#64748b',
                            }}>
                              <span>CATEGORY: {obj.category}</span>
                              {obj.state && <span>• STATE: {obj.state}</span>}
                            </div>
                            {obj.observation && (
                              <div style={{
                                fontSize: '9.5px',
                                fontFamily: 'var(--font-mono, monospace)',
                                color: '#94a3b8',
                                lineHeight: 1.35,
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                paddingTop: '4px',
                                marginTop: '2px',
                              }}>
                                {obj.observation}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* 2. SPATIAL RELATIONSHIPS SUB-TAB */}
                  {aiSubTab === 'relations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {currentAnalysisResult.relationships.map((rel, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '10px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ color: '#ffffff', fontWeight: 600 }}>{rel.subject}</span>
                              <span style={{
                                color: '#00f0ff',
                                background: 'rgba(0, 240, 255, 0.12)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontSize: '8.5px',
                                fontWeight: 700,
                              }}>
                                {rel.relation}
                              </span>
                              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{rel.object}</span>
                            </div>
                            <span style={{ color: '#64748b', fontSize: '9px' }}>
                              {(rel.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. OBSERVATIONS SUB-TAB */}
                  {aiSubTab === 'observations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {currentAnalysisResult.observations.map((obs, idx) => {
                        const isObserved = obs.state === 'observed';
                        const stateColor = isObserved ? '#34d399' : '#38bdf8';
                        const stateBg = isObserved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)';
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.025)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono, monospace)',
                                fontSize: '8.5px',
                                fontWeight: 700,
                                color: stateColor,
                                background: stateBg,
                                padding: '1px 5px',
                                borderRadius: '3px',
                                textTransform: 'uppercase',
                              }}>
                                {obs.state || 'OBSERVED'}
                              </span>
                              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
                                #{String(idx + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <div style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '10px',
                              color: '#cbd5e1',
                              lineHeight: 1.4,
                            }}>
                              {obs.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 4. LEADS & UNCERTAINTIES SUB-TAB */}
                  {aiSubTab === 'leads' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Possible Evidence Leads */}
                      <div style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0, 240, 255, 0.04)',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: '#00f0ff',
                          marginBottom: '6px',
                        }}>
                          POSSIBLE EVIDENCE LEADS ({currentAnalysisResult.possible_evidence.length})
                        </div>
                        <ul style={{
                          margin: 0,
                          paddingLeft: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono, monospace)',
                          color: '#cbd5e1',
                          lineHeight: 1.35,
                        }}>
                          {currentAnalysisResult.possible_evidence.map((lead, idx) => (
                            <li key={idx}>{lead}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Uncertainties & Caveats */}
                      {currentAnalysisResult.uncertainties.length > 0 && (
                        <div style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          background: 'rgba(234, 179, 8, 0.05)',
                          border: '1px solid rgba(234, 179, 8, 0.25)',
                        }}>
                          <div style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            color: '#fbbf24',
                            marginBottom: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}>
                            <AlertTriangle size={11} />
                            <span>UNCERTAINTIES & OCCLUSIONS</span>
                          </div>
                          <ul style={{
                            margin: 0,
                            paddingLeft: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            fontSize: '9.5px',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: '#94a3b8',
                            lineHeight: 1.35,
                          }}>
                            {currentAnalysisResult.uncertainties.map((unc, idx) => (
                              <li key={idx}>{unc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        /* 3D SCENE ENTITIES VIEW MODE (PRESERVED 100% INTERACTIVITY) */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Demonstration disclaimer */}
          <div style={{
            margin: '8px 16px 4px 16px',
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
              SCENE OBJECTS: Telemetry reflects baseline reconstructed 3D room. Select objects to inspect or modify spatial coordinates.
            </span>
          </div>

          {/* Search input */}
          <div style={{ padding: '4px 16px 6px 16px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={12} color="#64748b" style={{ position: 'absolute', left: '26px' }} />
            <input
              type="text"
              placeholder="Filter 3D scene objects..."
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
            padding: '0 16px 6px 16px',
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

          {/* 3D Entity List */}
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
        </div>
      )}
    </aside>
  );
};
