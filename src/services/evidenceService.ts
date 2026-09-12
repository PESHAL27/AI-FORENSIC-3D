import type {
  EvidenceItem,
  EvidenceMarkerItem,
  EvidenceUploadType,
  MarkerCategoryType,
} from '../types/investigation';
import { formatBytes } from '../utils/fileValidation';
import { api, type BackendEvidenceItem, type BackendMarkerItem, type EvidenceAnalysisResponse } from './api';


/**
 * EVIDENCE SERVICE
 * Integrates the UI with the FastAPI backend and Supabase Storage.
 * Maintains an in-memory cache as an ultra-reliable fallback.
 */

// Helper to convert backend evidence model to frontend EvidenceItem
function mapBackendEvidence(item: BackendEvidenceItem): EvidenceItem {
  let uiType: EvidenceItem['type'] = 'image';
  const rawType = (item.file_type || '').toLowerCase();
  if (rawType.includes('video')) uiType = 'video';
  else if (rawType.includes('360')) uiType = '360-image';
  else if (rawType.includes('report') || (item.filename || '').endsWith('.pdf')) uiType = 'report';
  else if (rawType.includes('measurement') || (item.filename || '').endsWith('.csv')) uiType = 'measurements';

  const downloadUrl = item.download_url || `/api/evidence/${item.id}/download`;

  return {
    id: item.id,
    caseId: item.case_id,
    filename: item.filename || item.original_filename,
    type: uiType,
    fileSize: item.file_size,
    fileSizeFormatted: formatBytes(item.file_size),
    uploadDate: item.created_at ? item.created_at.replace('T', ' ').substring(0, 19) : new Date().toISOString().substring(0, 19),
    status: (item.status.toLowerCase() as any) || 'uploaded',
    preview: uiType === 'image' || uiType === '360-image' ? downloadUrl : undefined,
    source: 'upload',
    analysis: item.analysis,
    metadata: {
      mimeType: item.mime_type,
      storagePath: item.storage_path,
      ...(item.metadata || {}),
    },
  };
}


// Fallback in-memory database if network/backend is restarting
const localFallbackStore: Map<string, EvidenceItem[]> = new Map();
const markerFallbackStore: Map<string, EvidenceMarkerItem[]> = new Map();

export const evidenceService = {
  /**
   * Fetch all evidence items associated with a specific case.
   * Calls FastAPI: GET /api/cases/{case_id}/evidence
   */
  async getCaseEvidence(caseId: string): Promise<EvidenceItem[]> {
    try {
      const backendItems = await api.getCaseEvidence(caseId);
      const mapped = backendItems.map(mapBackendEvidence);
      localFallbackStore.set(caseId, mapped);
      return mapped;
    } catch (err) {
      console.warn(`[EvidenceService] API fetch failed for case ${caseId}, using local cache:`, err);
      return localFallbackStore.get(caseId) || [];
    }
  },

  /**
   * Fetch single evidence item by ID.
   * Calls FastAPI: GET /api/evidence/{evidence_id}
   */
  async getEvidence(evidenceId: string): Promise<EvidenceItem | null> {
    try {
      const backendItem = await api.getEvidence(evidenceId);
      return mapBackendEvidence(backendItem);
    } catch (err) {
      console.warn(`[EvidenceService] API getEvidence failed for ${evidenceId}:`, err);
      for (const list of localFallbackStore.values()) {
        const found = list.find((e) => e.id === evidenceId);
        if (found) return found;
      }
      return null;
    }
  },

  /**
   * Upload an evidence file to a case with progress tracking.
   * Calls FastAPI: POST /api/cases/{case_id}/evidence (Multipart)
   */
  async uploadEvidence(
    caseId: string,
    file: File,
    type: EvidenceUploadType,
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<EvidenceItem> {
    if (onProgress) onProgress(20, 'INITIALIZING STREAM...');

    // Map frontend upload category to backend type
    let backendType = 'IMAGE';
    if (type === 'video' || file.type.startsWith('video/')) backendType = 'VIDEO';
    else if (type === '360-image') backendType = 'IMAGE_360';
    else if (type === 'report' || file.name.endsWith('.pdf')) backendType = 'REPORT';
    else if (type === 'measurements' || file.name.endsWith('.csv')) backendType = 'MEASUREMENT';

    if (onProgress) onProgress(50, 'UPLOADING TO STORAGE...');

    try {
      const result = await api.uploadEvidence(caseId, file, backendType, {
        frontendCategory: type,
        originalMime: file.type,
      });

      if (onProgress) onProgress(90, 'SYNCHRONIZING DATABASE...');

      const mapped = mapBackendEvidence(result);

      // Cache locally
      const current = localFallbackStore.get(caseId) || [];
      localFallbackStore.set(caseId, [mapped, ...current]);

      if (onProgress) onProgress(100, `UPLOADED ${mapped.id}`);
      return mapped;
    } catch (err: any) {
      console.error(`[EvidenceService] Upload failed:`, err);
      if (onProgress) onProgress(100, `FAILED: ${err.message || 'Error'}`);
      throw err;
    }
  },

  /**
   * Delete an evidence item.
   * Calls FastAPI: DELETE /api/evidence/{evidence_id}
   */
  async deleteEvidence(evidenceId: string): Promise<boolean> {
    try {
      await api.deleteEvidence(evidenceId);
      for (const [caseId, list] of localFallbackStore.entries()) {
        const filtered = list.filter((e) => e.id !== evidenceId);
        localFallbackStore.set(caseId, filtered);
      }
      return true;
    } catch (err) {
      console.error(`[EvidenceService] Delete failed for ${evidenceId}:`, err);
      return false;
    }
  },

  /**
   * Get 3D evidence markers for a case.
   * Calls FastAPI: GET /api/cases/{case_id}/markers
   */
  async getCaseMarkers(caseId: string): Promise<EvidenceMarkerItem[]> {
    try {
      const markers = await api.getMarkers(caseId);
      return markers.map((m: BackendMarkerItem, idx: number) => ({
        id: m.id,
        caseId: m.case_id,
        number: (m.metadata?.number as string) || String(idx + 1).padStart(2, '0'),
        label: m.label,
        description: (m.metadata?.description as string) || `Marker registered under ${m.marker_type}`,
        confidence: (m.metadata?.confidence as number) || 0.95,
        type: m.marker_type,
        markerType: (m.marker_type.charAt(0).toUpperCase() + m.marker_type.slice(1).toLowerCase()) as MarkerCategoryType,
        coordinates: [m.position_x, m.position_y, m.position_z],
        linkedEvidenceId: m.evidence_id,
        verified: true,
      }));
    } catch (err) {
      console.warn(`[EvidenceService] Get markers failed, using fallback:`, err);
      return markerFallbackStore.get(caseId) || [];
    }
  },

  /**
   * Add a new physical 3D evidence marker to a case.
   * Calls FastAPI: POST /api/cases/{case_id}/markers
   */
  async addEvidenceMarker(
    caseId: string,
    markerData: {
      markerType: MarkerCategoryType;
      label: string;
      description: string;
      coordinates: [number, number, number];
      linkedEvidenceId?: string;
    }
  ): Promise<EvidenceMarkerItem> {
    try {
      const res = await api.createMarker(caseId, {
        label: markerData.label,
        marker_type: markerData.markerType.toUpperCase(),
        position_x: markerData.coordinates[0],
        position_y: markerData.coordinates[1],
        position_z: markerData.coordinates[2],
        evidence_id: markerData.linkedEvidenceId,
        metadata: {
          description: markerData.description,
        },
      });

      return {
        id: res.id,
        caseId: res.case_id,
        number: '01',
        label: res.label,
        description: markerData.description,
        confidence: 0.985,
        type: res.marker_type,
        markerType: markerData.markerType,
        coordinates: [res.position_x, res.position_y, res.position_z],
        linkedEvidenceId: res.evidence_id,
        verified: true,
      };
    } catch (err) {
      console.error(`[EvidenceService] Failed to create marker:`, err);
      throw err;
    }
  },

  /**
   * Delete a 3D evidence marker.
   * Calls FastAPI: DELETE /api/markers/{marker_id}
   */
  async deleteEvidenceMarker(markerId: string): Promise<boolean> {
    try {
      return await api.deleteMarker(markerId);
    } catch (err) {
      console.error(`[EvidenceService] Delete marker failed:`, err);
      return false;
    }
  },

  /**
   * Analyze an evidence image using the configured AI vision model.
   * Calls FastAPI: POST /api/evidence/{evidence_id}/analyze
   */
  async analyzeEvidence(evidenceId: string): Promise<EvidenceAnalysisResponse> {
    const analysis = await api.analyzeEvidence(evidenceId);
    for (const list of localFallbackStore.values()) {
      const item = list.find((e) => e.id === evidenceId);
      if (item) {
        item.analysis = analysis;
      }
    }
    return analysis;
  },

  /**
   * Retrieve saved AI analysis for an evidence item.
   * Calls FastAPI: GET /api/evidence/{evidence_id}/analysis
   */
  async getEvidenceAnalysis(evidenceId: string): Promise<EvidenceAnalysisResponse | null> {
    try {
      return await api.getEvidenceAnalysis(evidenceId);
    } catch {
      return null;
    }
  },

  /**
   * List all AI analyses for a case.
   * Calls FastAPI: GET /api/cases/{case_id}/analyses
   */
  async getCaseAnalyses(caseId: string): Promise<EvidenceAnalysisResponse[]> {
    try {
      return await api.getCaseAnalyses(caseId);
    } catch {
      return [];
    }
  },

};

