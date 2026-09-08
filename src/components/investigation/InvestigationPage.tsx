import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sliders,
  Sparkles,
  GitCompare,
  Compass,
  Glasses,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { EvidencePanel } from './EvidencePanel';
import { SceneViewer } from './SceneViewer';
import { SceneToolbar } from './SceneToolbar';
import { ScenarioPanel } from './ScenarioPanel';
import { EvidenceAnalysis } from './EvidenceAnalysis';
import { Timeline } from './Timeline';
import { AIAssistant } from './AIAssistant';
import { InteractiveInvestigation } from './InteractiveInvestigation';
import { CounterfactualPanel } from './CounterfactualPanel';
import { EvidenceDiagram } from './EvidenceDiagram';
import { VRPanel } from './VRPanel';
import { ForensicReportModal } from './ForensicReportModal';
import { EvidencePreviewModal } from './EvidencePreviewModal';
import { DeleteEvidenceDialog } from './DeleteEvidenceDialog';
import { AddMarkerModal } from './AddMarkerModal';
import { ResetConfirmDialog } from './ResetConfirmDialog';

import { evidenceService } from '../../services/evidenceService';
import { validateEvidenceFile } from '../../utils/fileValidation';

import {
  INITIAL_DETECTED_ENTITIES,
  INITIAL_EVIDENCE_MARKERS,
  INITIAL_MEASUREMENTS,
  DEMO_SCENARIOS,
  DEMO_TIMELINE_EVENTS,
  DEMO_COUNTERFACTUALS,
  INITIAL_AI_MESSAGES,
} from '../../data/demonstrationData';

import type {
  NavigationTab,
  ViewportTool,
  ViewportTab,
  LowerWorkspaceTab,
  EvidenceUploadType,
  DetectedEntity,
  EvidenceMarkerItem,
  MeasurementItem,
  ScenarioItem,
  TimelineEventItem,
  CounterfactualBranch,
  AIMessageItem,
  EvidenceItem,
  EvidenceUploadProgress,
  MarkerCategoryType,
} from '../../types/investigation';
import type { CaseOption } from '../../types';

interface InvestigationPageProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  selectedCase: CaseOption;
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({
  activeTab,
  onSelectTab,
  selectedCase,
}) => {
  const caseId = selectedCase.id;

  // 1. Evidence Management State
  const [caseEvidence, setCaseEvidence] = useState<EvidenceItem[]>([]);
  const [previewEvidenceItem, setPreviewEvidenceItem] = useState<EvidenceItem | null>(null);
  const [evidenceToDelete, setEvidenceToDelete] = useState<EvidenceItem | null>(null);
  const [isAddMarkerModalOpen, setIsAddMarkerModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<EvidenceUploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // 2. Scene & Entities State (Centralized Scene State Architecture)
  const [detectedEntities, setDetectedEntities] = useState<DetectedEntity[]>(INITIAL_DETECTED_ENTITIES);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>('ent-furn-chair');
  const [markers, setMarkers] = useState<EvidenceMarkerItem[]>(INITIAL_EVIDENCE_MARKERS);
  const [measurements, setMeasurements] = useState<MeasurementItem[]>(INITIAL_MEASUREMENTS);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pendingMarkerCoords, setPendingMarkerCoords] = useState<[number, number, number] | null>(null);

  // 3. Viewport & Tool State
  const [activeTool, setActiveTool] = useState<ViewportTool>('select');
  const [activeViewportTab, setActiveViewportTab] = useState<ViewportTab>('3D View');
  const [resetSignal, setResetSignal] = useState(0);

  // 4. Scenarios State
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(DEMO_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen-a');

  // 5. Timeline & Simulation State
  const [timelineEvents] = useState<TimelineEventItem[]>(DEMO_TIMELINE_EVENTS);
  const [currentTime, setCurrentTime] = useState<number>(-4.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 6. Lower Workspace State
  const [activeLowerTab, setActiveLowerTab] = useState<LowerWorkspaceTab>('interactive');
  const [isLowerExpanded, setIsLowerExpanded] = useState<boolean>(true);

  // 7. Counterfactual Branches State
  const [counterfactuals] = useState<CounterfactualBranch[]>(DEMO_COUNTERFACTUALS);

  // 8. AI Assistant State
  const [aiMessages, setAiMessages] = useState<AIMessageItem[]>(INITIAL_AI_MESSAGES);

  // Current selected scenario object
  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Load evidence for the active case from evidenceService
  useEffect(() => {
    let isMounted = true;
    evidenceService.getCaseEvidence(caseId).then((items) => {
      if (isMounted) {
        setCaseEvidence(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [caseId]);

  // Simulation Playback Loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 3.0) {
            setIsPlaying(false);
            return 3.0;
          }
          return parseFloat((prev + 0.2).toFixed(2));
        });
      }, 120);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Sync timeline events to 3D object positions
  useEffect(() => {
    setDetectedEntities((prev) =>
      prev.map((ent) => {
        if (ent.id === 'ent-furn-chair') {
          const t = Math.max(-2, Math.min(2, currentTime));
          const factor = (t + 2) / 4;
          return {
            ...ent,
            position: [-1.9 - factor * 0.4, 0.35 - factor * 0.05, 0.3 + factor * 0.2],
            rotation: [1.4 + factor * 0.2, 0.3, 0.6],
          };
        }
        if (ent.id === 'ent-person-01') {
          const t = Math.max(-10, Math.min(0, currentTime));
          const walkFactor = (t + 10) / 10;
          return {
            ...ent,
            position: [0.1 + (1 - walkFactor) * 1.8, 0.0, 0.3 - (1 - walkFactor) * 1.5],
          };
        }
        return ent;
      })
    );
  }, [currentTime]);

  // Synchronize top navigation tab with lower workspace modules
  useEffect(() => {
    if (activeTab === 'Scenarios') {
      setActiveLowerTab('simulation');
      setIsLowerExpanded(true);
    } else if (activeTab === 'Timeline') {
      setIsLowerExpanded(true);
      setIsPlaying(true);
    } else if (activeTab === 'Evidence') {
      setActiveLowerTab('diagram');
      setIsLowerExpanded(true);
    } else if (activeTab === 'Reports') {
      setIsReportModalOpen(true);
    } else if (activeTab === 'Investigation') {
      setActiveLowerTab('interactive');
    }
  }, [activeTab]);

  // Centralized Scene & Interaction Handlers
  const handleSelectEntity = (id: string | null) => {
    setSelectedEntityId(id);
    if (id) {
      setActiveLowerTab('interactive');
      setIsLowerExpanded(true);
    }
  };

  const handleToggleEntityVisibility = (id: string) => {
    setDetectedEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e))
    );
  };

  const handleUpdateEntityPosition = (id: string, newPos: [number, number, number]) => {
    setDetectedEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, position: newPos } : e))
    );
  };

  const handleUpdateEntityRotation = (id: string, rotY: number, fullRotation?: [number, number, number]) => {
    setDetectedEntities((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              rotation: fullRotation || [e.rotation[0], rotY, e.rotation[2]],
            }
          : e
      )
    );
  };

  const handleAddMeasurement = (newMeas: MeasurementItem) => {
    setMeasurements((prev) => [...prev, newMeas]);
    const logMsg: AIMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `VECTOR MEASUREMENT RECORDED: Distance between ${newMeas.fromName} and ${newMeas.toName} is ${newMeas.distanceMeters.toFixed(2)} m. Vector registered to scene state.`,
    };
    setAiMessages((prev) => [...prev, logMsg]);
  };

  const handleOpenEvidencePlacement = (coords: [number, number, number]) => {
    setPendingMarkerCoords(coords);
    setIsAddMarkerModalOpen(true);
  };

  const handleConfirmResetScene = () => {
    setDetectedEntities(INITIAL_DETECTED_ENTITIES);
    setMarkers(INITIAL_EVIDENCE_MARKERS);
    setMeasurements(INITIAL_MEASUREMENTS);
    setSelectedEntityId(null);
    setCurrentTime(-10.0);
    setIsPlaying(false);
    setActiveTool('select');
    setActiveViewportTab('3D View');
    setResetSignal((s) => s + 1);
    setIsResetConfirmOpen(false);

    const logMsg: AIMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `DEMONSTRATION SCENE RESTORED: All object positions, rotations, markers, and measurements reset to initial calibrated forensic baseline.`,
    };
    setAiMessages((prev) => [...prev, logMsg]);
  };

  const handleSelectViewportTab = (tab: ViewportTab) => {
    setActiveViewportTab(tab);
    if (tab === 'Measurements') {
      setActiveTool('measure');
    }
  };

  const handleResetCamera = () => {
    setResetSignal((s) => s + 1);
  };

  const handleApplyCounterfactual = (branch: CounterfactualBranch) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === selectedScenarioId
          ? {
              ...s,
              consistencyScore: branch.projectedConsistency,
              description: `[Counterfactual Applied: ${branch.title}] ${s.description}`,
            }
          : s
      )
    );

    if (branch.targetObject === 'Ergonomic Task Chair') {
      handleUpdateEntityPosition('ent-furn-chair', [-2.9, 0.35, 0.3]);
    }

    const newMsg: AIMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `COUNTERFACTUAL COMPUTED: Applied perturbation (${branch.question}). Projected physical hypothesis consistency dropped from ${branch.originalConsistency}% to ${branch.projectedConsistency}%. Outcome: ${branch.ballisticOutcome}.`,
    };
    setAiMessages((prev) => [...prev, newMsg]);
  };

  const handleSendMessage = (text: string) => {
    const userMsg: AIMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text,
    };
    setAiMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const assistantMsg: AIMessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `[FORENSIC ENGINE SIMULATION]: Telemetry parsed for query: "${text}". Corridor point cloud registers no secondary micro-impacts. Physical consistency remains aligned with Scenario ${currentScenario.code} (${currentScenario.consistencyScore.toFixed(1)}%). Once backend AI reasoning server is active, real LLM reasoning will validate this step.`,
      };
      setAiMessages((prev) => [...prev, assistantMsg]);
    }, 600);
  };

  const handleAITriggerAction = (action: string) => {
    if (action === 'run_simulation') {
      setIsPlaying(true);
      setCurrentTime(-10);
    } else if (action === 'try_counterfactual') {
      setActiveLowerTab('counterfactual');
      setIsLowerExpanded(true);
    } else if (action === 'compare_scenarios') {
      setActiveLowerTab('simulation');
      setIsLowerExpanded(true);
    } else {
      handleSendMessage('What is the angular variance of Marker 01 glass dispersion compared to breach origin?');
    }
  };

  // EVIDENCE UPLOAD HANDLER WITH MULTIPLE FILES & VALIDATION
  const handleUploadFiles = async (
    files: FileList | File[],
    uploadType: EvidenceUploadType
  ) => {
    setUploadError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const existingNames = caseEvidence.map((e) => e.filename);
    const uploadedBatch: EvidenceItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      // Validate each file
      const validation = validateEvidenceFile(file, uploadType, existingNames);
      if (!validation.valid) {
        setUploadError(validation.error || 'Forensic validation failed.');
        setUploadProgress(null);
        return;
      }

      // Ingest through service
      try {
        setUploadProgress({
          evidenceId: `PENDING`,
          filename: file.name,
          progress: 15,
          status: 'uploading',
          statusText: `INGESTING ${file.name} (${i + 1}/${fileArray.length})...`,
        });

        const newEvidence = await evidenceService.uploadEvidence(
          caseId,
          file,
          uploadType,
          (progress, statusText) => {
            setUploadProgress({
              evidenceId: 'EV-GEN',
              filename: file.name,
              progress,
              status: progress < 100 ? 'uploading' : 'processing',
              statusText,
            });
          }
        );

        existingNames.push(file.name);
        uploadedBatch.push(newEvidence);
      } catch (err: any) {
        setUploadError(err?.message || 'Ingestion failure encountered.');
        setUploadProgress(null);
        return;
      }
    }

    // Update state
    setCaseEvidence((prev) => [...uploadedBatch, ...prev]);

    setTimeout(() => {
      setUploadProgress(null);
    }, 1200);

    // AI telemetry log
    const batchSummary = uploadedBatch.map((e) => `${e.id} (${e.filename})`).join(', ');
    const logMsg: AIMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `EVIDENCE INGESTION COMPLETE [${selectedCase.title}]: Ingested ${uploadedBatch.length} artifact(s): ${batchSummary}. Immutable SHA-256 hash registered. Artifacts are calibrated and ready for future computer vision & 3D reconstruction pipeline.`,
    };
    setAiMessages((prev) => [...prev, logMsg]);
  };

  // EVIDENCE DELETE CONFIRMATION HANDLER
  const handleConfirmDeleteEvidence = async () => {
    if (!evidenceToDelete) return;
    const targetId = evidenceToDelete.id;
    const filename = evidenceToDelete.filename;

    await evidenceService.deleteEvidence(targetId);
    setCaseEvidence((prev) => prev.filter((e) => e.id !== targetId));
    setEvidenceToDelete(null);

    const logMsg: AIMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `CHAIN OF CUSTODY LOG: Evidence ${targetId} (${filename}) has been expunged from case ${selectedCase.title} repository. Storage object queued for backend removal.`,
    };
    setAiMessages((prev) => [...prev, logMsg]);
  };

  // ADD 3D EVIDENCE MARKER HANDLER
  const handleAddMarker = async (markerData: {
    markerType: MarkerCategoryType;
    label: string;
    description: string;
    coordinates: [number, number, number];
    linkedEvidenceId?: string;
  }) => {
    const created = await evidenceService.addEvidenceMarker(caseId, markerData);
    setMarkers((prev) => [...prev, created]);

    // Add corresponding movable 3D entity
    const newEntity: DetectedEntity = {
      id: `ent-${created.id}`,
      name: created.label,
      category: 'Evidence',
      confidence: 0.99,
      position: created.coordinates,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      type: 'marker',
      details: `${created.description}${created.linkedEvidenceId ? ` • Linked: ${created.linkedEvidenceId}` : ''}`,
    };
    setDetectedEntities((prev) => [newEntity, ...prev]);
    setSelectedEntityId(newEntity.id);

    const logMsg: AIMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `MARKER PLACED: ${created.id} (${created.label}) positioned in 3D scene at coordinates [${created.coordinates.join(', ')}] under category "${created.markerType}".`,
    };
    setAiMessages((prev) => [...prev, logMsg]);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#020612',
      color: '#ffffff',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* MAIN HORIZONTAL INVESTIGATION SPLIT */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* LEFT PANEL: INPUT EVIDENCE & CASE REPOSITORY */}
        <EvidencePanel
          currentCaseId={caseId}
          caseEvidence={caseEvidence}
          detectedEntities={detectedEntities}
          selectedEntityId={selectedEntityId}
          onSelectEntity={handleSelectEntity}
          onToggleEntityVisibility={handleToggleEntityVisibility}
          onUploadFiles={handleUploadFiles}
          onOpenAddMarker={() => setIsAddMarkerModalOpen(true)}
          onViewEvidence={(item) => setPreviewEvidenceItem(item)}
          onDeleteEvidence={(item) => setEvidenceToDelete(item)}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          onClearUploadError={() => setUploadError(null)}
        />

        {/* CENTER COLUMN: 3D VIEWPORT (Largest Area) + TIMELINE */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background: '#020612',
        }}>
          {/* Main 3D Canvas Area */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            {/* Vertical Left 3D Viewport Toolbar */}
            <SceneToolbar
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              onResetScene={() => setIsResetConfirmOpen(true)}
            />

            {/* Interactive Three.js Viewport */}
            <SceneViewer
              entities={detectedEntities}
              markers={markers}
              measurements={measurements}
              selectedEntityId={selectedEntityId}
              onSelectEntity={handleSelectEntity}
              onUpdateEntityPosition={handleUpdateEntityPosition}
              onUpdateEntityRotation={handleUpdateEntityRotation}
              onAddMeasurement={handleAddMeasurement}
              onOpenEvidencePlacement={handleOpenEvidencePlacement}
              activeTool={activeTool}
              activeTab={activeViewportTab}
              onSelectTab={handleSelectViewportTab}
              resetSignal={resetSignal}
            />
          </div>

          {/* SIMULATION TIMELINE (Underneath main 3D viewport) */}
          <Timeline
            events={timelineEvents}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onSeekTime={(t) => setCurrentTime(t)}
            onSelectEvent={(evt) => {
              if (evt.highlightEntityId) {
                setSelectedEntityId(evt.highlightEntityId);
              }
            }}
          />
        </div>

        {/* RIGHT PANEL: GENERATED SCENARIOS, CONSISTENCY ANALYSIS, AI ASSISTANT */}
        <aside style={{
          width: '380px',
          height: '100%',
          background: 'rgba(3, 8, 22, 0.94)',
          borderLeft: '1px solid rgba(0, 240, 255, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '16px',
          gap: '16px',
          userSelect: 'none',
          zIndex: 20,
        }}>
          {/* 1. Generated Scenarios */}
          <ScenarioPanel
            scenarios={scenarios}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={setSelectedScenarioId}
            onViewDetails={() => {
              setActiveLowerTab('simulation');
              setIsLowerExpanded(true);
            }}
          />

          {/* 2. Evidence Consistency Analysis */}
          <EvidenceAnalysis currentScenario={currentScenario} />

          {/* 3. AI Assistant */}
          <AIAssistant
            messages={aiMessages}
            onSendMessage={handleSendMessage}
            onTriggerAction={handleAITriggerAction}
          />
        </aside>
      </div>

      {/* LOWER WORKSPACE: 4 Major Integrated Areas + 3D/VR View */}
      <div style={{
        height: isLowerExpanded ? '260px' : '36px',
        background: 'rgba(2, 6, 18, 0.98)',
        borderTop: '1px solid rgba(0, 240, 255, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 30,
      }}>
        {/* Lower Workspace Tabs Bar */}
        <div style={{
          height: '36px',
          padding: '0 16px',
          background: 'rgba(6, 18, 42, 0.85)',
          borderBottom: isLowerExpanded ? '1px solid rgba(0, 240, 255, 0.15)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#00f0ff',
              letterSpacing: '0.8px',
              marginRight: '8px',
            }}>
              INTEGRATED WORKSPACE MODULES:
            </span>

            {[
              { id: 'interactive', label: 'INTERACTIVE INVESTIGATION', icon: <Sliders size={12} /> },
              { id: 'counterfactual', label: 'COUNTERFACTUAL SIMULATION', icon: <Sparkles size={12} /> },
              { id: 'diagram', label: '2D EVIDENCE DIAGRAM', icon: <Compass size={12} /> },
              { id: 'simulation', label: 'MULTIPLE SCENARIO SIMULATION', icon: <GitCompare size={12} /> },
              { id: 'vr', label: '3D / VR VIEW', icon: <Glasses size={12} /> },
            ].map((tab) => {
              const isActive = activeLowerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveLowerTab(tab.id as LowerWorkspaceTab);
                    setIsLowerExpanded(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#00f0ff' : '#94a3b8',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10.5px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsLowerExpanded(!isLowerExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10.5px',
              cursor: 'pointer',
            }}
          >
            <span>{isLowerExpanded ? 'COLLAPSE DRAWER' : 'EXPAND DRAWER'}</span>
            {isLowerExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Lower Workspace Tab Content */}
        {isLowerExpanded && (
          <div style={{ flex: 1, padding: '12px 20px', minHeight: 0, overflow: 'hidden' }}>
            {activeLowerTab === 'interactive' && (
              <InteractiveInvestigation
                entities={detectedEntities}
                selectedEntityId={selectedEntityId}
                onSelectEntity={setSelectedEntityId}
                onUpdateEntityPosition={handleUpdateEntityPosition}
                onUpdateEntityRotation={handleUpdateEntityRotation}
                onToggleVisibility={handleToggleEntityVisibility}
                onAddEvidenceAtCursor={() => setIsAddMarkerModalOpen(true)}
              />
            )}

            {activeLowerTab === 'counterfactual' && (
              <CounterfactualPanel
                branches={counterfactuals}
                onApplyCounterfactual={handleApplyCounterfactual}
              />
            )}

            {activeLowerTab === 'diagram' && (
              <EvidenceDiagram
                entities={detectedEntities}
                markers={markers}
                measurements={measurements}
                selectedEntityId={selectedEntityId}
                onSelectEntity={handleSelectEntity}
              />
            )}

            {activeLowerTab === 'simulation' && (
              <div style={{
                height: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
              }}>
                {scenarios.map((scen) => (
                  <div
                    key={scen.id}
                    onClick={() => setSelectedScenarioId(scen.id)}
                    style={{
                      background: scen.id === selectedScenarioId ? 'rgba(0, 240, 255, 0.12)' : 'rgba(3, 10, 26, 0.75)',
                      border: scen.id === selectedScenarioId ? '1.5px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#00f0ff', fontWeight: 700 }}>
                          BRANCH {scen.code}: {scen.badge}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '14px', fontWeight: 800, color: scen.consistencyScore >= 80 ? '#00f0ff' : '#f59e0b' }}>
                          {scen.consistencyScore.toFixed(1)}%
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                        {scen.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                        {scen.description}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '8px',
                      marginTop: '8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: '#64748b',
                    }}>
                      <span>Vector: {scen.trajectoryAngle}°</span>
                      <span style={{ color: scen.id === selectedScenarioId ? '#00f0ff' : '#38bdf8' }}>
                        {scen.id === selectedScenarioId ? 'ACTIVE COMPARISON' : 'CLICK TO TEST'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeLowerTab === 'vr' && <VRPanel />}
          </div>
        )}
      </div>

      {/* 1. MODAL: EVIDENCE PREVIEW */}
      <EvidencePreviewModal
        evidence={previewEvidenceItem}
        onClose={() => setPreviewEvidenceItem(null)}
        onDelete={(item) => setEvidenceToDelete(item)}
      />

      {/* 2. MODAL: DELETE CONFIRMATION */}
      <DeleteEvidenceDialog
        isOpen={evidenceToDelete !== null}
        evidence={evidenceToDelete}
        onClose={() => setEvidenceToDelete(null)}
        onConfirm={handleConfirmDeleteEvidence}
      />

      {/* 3. MODAL: ADD 3D EVIDENCE MARKER */}
      <AddMarkerModal
        isOpen={isAddMarkerModalOpen}
        onClose={() => {
          setIsAddMarkerModalOpen(false);
          setPendingMarkerCoords(null);
        }}
        caseEvidence={caseEvidence}
        initialCoordinates={pendingMarkerCoords}
        onAddMarker={handleAddMarker}
      />

      {/* 4. MODAL: CERTIFIED FORENSIC REPORT */}
      <ForensicReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          if (activeTab === 'Reports') {
            onSelectTab('Investigation');
          }
        }}
        caseTitle={selectedCase.title}
        scenario={currentScenario}
        markers={markers}
      />

      {/* 5. MODAL: RESET DEMONSTRATION SCENE CONFIRMATION */}
      <ResetConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetScene}
      />
    </div>
  );
};
