import type { EvidenceAnalysisResponse, SceneAnalysisResult } from '../services/api';

export type NavigationTab = 'Home' | 'Investigation' | 'Scenarios' | 'Timeline' | 'Evidence' | 'Reports';

export type EvidenceUploadType =
  | 'image'
  | 'multi-image'
  | 'video'
  | '360-image'
  | 'report'
  | 'measurements'
  | 'add-evidence';

export type EvidenceStatus = 'idle' | 'uploading' | 'uploaded' | 'processing' | 'error';

export type MarkerCategoryType =
  | 'Evidence'
  | 'Person'
  | 'Object'
  | 'Damage'
  | 'Measurement'
  | 'Unknown';

export interface EvidenceItem {
  id: string; // e.g. 'EV-001'
  caseId: string; // e.g. 'case-001'
  filename: string;
  type: 'image' | 'video' | '360-image' | 'report' | 'measurements' | 'manual';
  fileSize: number; // bytes
  fileSizeFormatted: string; // e.g. '2.4 MB'
  uploadDate: string; // e.g. '2026-09-08 22:30:00'
  status: EvidenceStatus;
  preview?: string; // Data URL or blob URL
  source: 'upload' | 'manual' | 'telemetry';
  analysis?: EvidenceAnalysisResponse;
  metadata: {
    mimeType: string;
    checksum?: string;
    dimensions?: string;
    duration?: string;
    description?: string;
    lineCount?: number;
    pointCount?: number;
    [key: string]: any;
  };
}


export interface EvidenceUploadProgress {
  evidenceId: string;
  filename: string;
  progress: number; // 0 - 100
  status: EvidenceStatus;
  statusText: string;
  error?: string;
}

export type DetectedObjectCategory =
  | 'People'
  | 'Objects'
  | 'Furniture'
  | 'Doors / Windows'
  | 'Evidence'
  | 'Environment';

export interface DetectedEntity {
  id: string;
  name: string;
  category: DetectedObjectCategory;
  confidence: number;
  originalPosition?: [number, number, number];
  currentPosition?: [number, number, number];
  originalRotation?: [number, number, number];
  currentRotation?: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  type: 'person' | 'chair' | 'table' | 'glass' | 'door' | 'wall' | 'window' | 'marker' | string;
  selectable?: boolean;
  movable?: boolean;
  rotatable?: boolean;
  details: string;
}

export interface EvidenceMarkerItem {
  id: string;
  caseId?: string;
  number: string;
  label: string;
  description: string;
  confidence: number;
  type: string;
  markerType?: MarkerCategoryType;
  coordinates: [number, number, number];
  linkedEvidenceId?: string;
  verified: boolean;
}

export interface MeasurementItem {
  id: string;
  label: string;
  fromName: string;
  toName: string;
  fromCoord: [number, number, number];
  toCoord: [number, number, number];
  distanceMeters: number;
  fromEntityId?: string;
  toEntityId?: string;
}

export interface ScenarioItem {
  id: string;
  code: 'A' | 'B' | 'C';
  title: string;
  description: string;
  consistencyScore: number;
  badge: string;
  supportingEvidence: string[];
  contradictions: string[];
  trajectoryAngle: number;
  originPoint: string;
}

export interface TimelineEventItem {
  id: string;
  timestamp: string;
  timeSeconds: number;
  title: string;
  description: string;
  category: 'entry' | 'movement' | 'interaction' | 'impact' | 'dispersion';
  confidence: number;
  highlightEntityId?: string;
}

export interface CounterfactualBranch {
  id: string;
  title: string;
  question: string;
  targetObject: string;
  parameterChanged: string;
  originalValue: string;
  modifiedValue: string;
  originalConsistency: number;
  projectedConsistency: number;
  impactSummary: string;
  ballisticOutcome: string;
}

export interface AIMessageItem {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  content: string;
  suggestedAction?: string;
}

export type ViewportTool = 'select' | 'move' | 'rotate' | 'measure' | 'evidence' | 'reset';
export type ViewportTab = '3D View' | '2D Plan' | 'Point Cloud' | 'Measurements';
export type LowerWorkspaceTab =
  | 'simulation'
  | 'interactive'
  | 'counterfactual'
  | 'diagram'
  | 'vr';
