import type {
  EvidenceItem,
  EvidenceMarkerItem,
  EvidenceUploadType,
  MarkerCategoryType,
} from '../types/investigation';
import { formatBytes } from '../utils/fileValidation';

/**
 * EVIDENCE SERVICE (API CONTRACT PREPARATION FOR FASTAPI BACKEND)
 *
 * Expected future FastAPI endpoints:
 * - POST   /api/cases/{case_id}/evidence         (multipart/form-data)
 * - GET    /api/cases/{case_id}/evidence         (returns EvidenceItem[])
 * - GET    /api/evidence/{evidence_id}           (returns EvidenceItem)
 * - DELETE /api/evidence/{evidence_id}           (returns { success: boolean })
 * - POST   /api/cases/{case_id}/evidence-markers (json body)
 * - GET    /api/cases/{case_id}/evidence-markers (returns EvidenceMarkerItem[])
 * - DELETE /api/evidence-markers/{marker_id}     (returns { success: boolean })
 *
 * CURRENT IMPLEMENTATION:
 * Modular in-memory & session storage cache isolated from UI components.
 * To connect FastAPI: Replace internal store calls with fetch() requests.
 */

// Simulated in-memory database indexed by caseId
const evidenceStore: Map<string, EvidenceItem[]> = new Map();
const markerStore: Map<string, EvidenceMarkerItem[]> = new Map();

// Helper to generate simulated SHA-256 checksum
function generateSimulatedChecksum(filename: string, size: number): string {
  let hash = 0;
  const str = `${filename}-${size}-${Date.now()}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `sha256-${Math.abs(hash).toString(16).padStart(16, '0')}7f4a`;
}

// Helper to generate sequential evidence IDs per case (e.g. EV-001, EV-002)
function getNextEvidenceId(caseId: string): string {
  const currentItems = evidenceStore.get(caseId) || [];
  const nextNum = currentItems.length + 1;
  return `EV-${String(nextNum).padStart(3, '0')}`;
}

function getNextMarkerId(caseId: string): string {
  const currentMarkers = markerStore.get(caseId) || [];
  const nextNum = currentMarkers.length + 1;
  return `MK-${String(nextNum).padStart(3, '0')}`;
}

// Initial demonstration evidence seeded per case to show case isolation
function seedInitialData() {
  if (evidenceStore.size > 0) return;

  // Case 001 (Downtown Office Incident)
  const case001Items: EvidenceItem[] = [
    {
      id: 'EV-001',
      caseId: 'case-001',
      filename: 'east-window-breach-exterior.jpg',
      type: 'image',
      fileSize: 4194304,
      fileSizeFormatted: '4.0 MB',
      uploadDate: '2026-09-08 18:24:10',
      status: 'uploaded',
      preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23061632"/><text x="150" y="95" fill="%2300f0ff" font-family="monospace" font-size="14" text-anchor="middle" font-weight="bold">EAST WINDOW BREACH</text><circle cx="150" cy="130" r="30" fill="none" stroke="%23ff3366" stroke-width="2" stroke-dasharray="4 2"/><line x1="80" y1="130" x2="220" y2="130" stroke="%2300f0ff" stroke-width="1.5"/></svg>',
      source: 'upload',
      metadata: {
        mimeType: 'image/jpeg',
        dimensions: '4032 x 3024',
        checksum: 'sha256-4c91a03e198b82e17f4a',
        description: 'Perimeter glass spiderweb fracture pattern taken with macro lens.',
      },
    },
    {
      id: 'EV-002',
      caseId: 'case-001',
      filename: 'corridor-egress-telemetry.mp4',
      type: 'video',
      fileSize: 18874368,
      fileSizeFormatted: '18.0 MB',
      uploadDate: '2026-09-08 18:35:42',
      status: 'uploaded',
      source: 'upload',
      metadata: {
        mimeType: 'video/mp4',
        duration: '00:00:24',
        checksum: 'sha256-a19f80cc428131e57f4a',
        description: 'Security camera 04 stream capturing timestamp T-10s egress motion.',
      },
    },
    {
      id: 'EV-003',
      caseId: 'case-001',
      filename: 'ballistics-preliminary-report.pdf',
      type: 'report',
      fileSize: 838860,
      fileSizeFormatted: '820 KB',
      uploadDate: '2026-09-08 19:10:05',
      status: 'uploaded',
      source: 'upload',
      metadata: {
        mimeType: 'application/pdf',
        checksum: 'sha256-8e2b0129a391512f7f4a',
        description: 'Coroner and ballistician preliminary muzzle velocity analysis.',
      },
    },
    {
      id: 'EV-004',
      caseId: 'case-001',
      filename: 'lidar-room-scan-points.csv',
      type: 'measurements',
      fileSize: 3145728,
      fileSizeFormatted: '3.0 MB',
      uploadDate: '2026-09-08 19:45:18',
      status: 'uploaded',
      source: 'upload',
      metadata: {
        mimeType: 'text/csv',
        lineCount: 18400,
        pointCount: 18400,
        checksum: 'sha256-2b10a9f1437162987f4a',
        description: 'FARO Focus 3D scanner room mesh coordinate cloud.',
      },
    },
  ];

  // Case 002 (Substation Perimeter Breach - Different distinct evidence)
  const case002Items: EvidenceItem[] = [
    {
      id: 'EV-001',
      caseId: 'case-002',
      filename: 'fence-cut-detail.png',
      type: 'image',
      fileSize: 2097152,
      fileSizeFormatted: '2.0 MB',
      uploadDate: '2026-08-22 14:12:00',
      status: 'uploaded',
      source: 'upload',
      metadata: {
        mimeType: 'image/png',
        dimensions: '2048 x 1536',
        checksum: 'sha256-912a78ff019283747f4a',
        description: 'Chain link boundary wire bolt-cutter shear markings.',
      },
    },
  ];

  evidenceStore.set('case-001', case001Items);
  evidenceStore.set('case-002', case002Items);
  evidenceStore.set('case-003', []);
}

seedInitialData();

export const evidenceService = {
  /**
   * Fetch all evidence items associated with a specific case.
   * FastAPI: GET /api/cases/{case_id}/evidence
   */
  async getCaseEvidence(caseId: string): Promise<EvidenceItem[]> {
    seedInitialData();
    // Simulate slight network roundtrip (50ms)
    await new Promise((resolve) => setTimeout(resolve, 50));
    const items = evidenceStore.get(caseId) || [];
    return [...items];
  },

  /**
   * Fetch single evidence item by ID.
   * FastAPI: GET /api/evidence/{evidence_id}
   */
  async getEvidence(evidenceId: string): Promise<EvidenceItem | null> {
    for (const list of evidenceStore.values()) {
      const found = list.find((e) => e.id === evidenceId);
      if (found) return { ...found };
    }
    return null;
  },

  /**
   * Upload an evidence file to a case with progress simulation.
   * FastAPI: POST /api/cases/{case_id}/evidence (Multipart)
   */
  async uploadEvidence(
    caseId: string,
    file: File,
    type: EvidenceUploadType,
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<EvidenceItem> {
    seedInitialData();

    // 1. Generate unique ID for this case
    const evidenceId = getNextEvidenceId(caseId);

    // 2. Read preview data if it is an image
    let previewUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      try {
        previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        });
      } catch {
        previewUrl = URL.createObjectURL(file);
      }
    } else if (file.type.startsWith('video/')) {
      previewUrl = URL.createObjectURL(file);
    }

    // 3. Progress simulation: Uploading -> Processing -> Uploaded
    const progressSteps = [
      { p: 25, text: 'UPLOADING... ██░░░░░░░░ 25%' },
      { p: 60, text: 'UPLOADING... ██████░░░░ 60%' },
      { p: 90, text: 'UPLOADING... █████████░ 90%' },
      { p: 100, text: 'PROCESSING FORENSIC TELEMETRY...' },
    ];

    for (const step of progressSteps) {
      if (onProgress) onProgress(step.p, step.text);
      await new Promise((resolve) => setTimeout(resolve, 140));
    }

    // Determine normalized evidence category
    let normalizedType: EvidenceItem['type'] = 'image';
    if (type === 'video' || file.type.startsWith('video/')) normalizedType = 'video';
    else if (type === '360-image') normalizedType = '360-image';
    else if (type === 'report' || file.name.endsWith('.pdf') || file.name.endsWith('.docx'))
      normalizedType = 'report';
    else if (type === 'measurements' || file.name.endsWith('.csv') || file.name.endsWith('.las'))
      normalizedType = 'measurements';

    // Construct evidence item
    const newItem: EvidenceItem = {
      id: evidenceId,
      caseId,
      filename: file.name,
      type: normalizedType,
      fileSize: file.size,
      fileSizeFormatted: formatBytes(file.size),
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'uploaded',
      preview: previewUrl,
      source: 'upload',
      metadata: {
        mimeType: file.type || 'application/octet-stream',
        checksum: generateSimulatedChecksum(file.name, file.size),
        description: `Ingested through ${type.toUpperCase()} intake portal.`,
      },
    };

    // Store in case collection
    const currentList = evidenceStore.get(caseId) || [];
    evidenceStore.set(caseId, [newItem, ...currentList]);

    if (onProgress) onProgress(100, `UPLOADED ${evidenceId}`);

    return newItem;
  },

  /**
   * Delete an evidence item from current case collection.
   * FastAPI: DELETE /api/evidence/{evidence_id}
   */
  async deleteEvidence(evidenceId: string): Promise<boolean> {
    for (const [caseId, list] of evidenceStore.entries()) {
      const idx = list.findIndex((e) => e.id === evidenceId);
      if (idx !== -1) {
        list.splice(idx, 1);
        evidenceStore.set(caseId, [...list]);
        return true;
      }
    }
    return false;
  },

  /**
   * Get 3D evidence markers for a case.
   * FastAPI: GET /api/cases/{case_id}/evidence-markers
   */
  async getCaseMarkers(caseId: string): Promise<EvidenceMarkerItem[]> {
    return markerStore.get(caseId) || [];
  },

  /**
   * Add a new physical 3D evidence marker to a case.
   * FastAPI: POST /api/cases/{case_id}/evidence-markers
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
    const markerId = getNextMarkerId(caseId);
    const existing = markerStore.get(caseId) || [];
    const number = String(existing.length + 1).padStart(2, '0');

    const newMarker: EvidenceMarkerItem = {
      id: markerId,
      caseId,
      number,
      label: markerData.label || `Marker #${number}: ${markerData.markerType}`,
      description: markerData.description || `Spatial trace registered under ${markerData.markerType} category.`,
      confidence: 0.985,
      type: markerData.markerType,
      markerType: markerData.markerType,
      coordinates: markerData.coordinates,
      linkedEvidenceId: markerData.linkedEvidenceId,
      verified: true,
    };

    markerStore.set(caseId, [...existing, newMarker]);
    return newMarker;
  },

  /**
   * Delete a 3D evidence marker.
   * FastAPI: DELETE /api/evidence-markers/{marker_id}
   */
  async deleteEvidenceMarker(markerId: string): Promise<boolean> {
    for (const [caseId, list] of markerStore.entries()) {
      const idx = list.findIndex((m) => m.id === markerId);
      if (idx !== -1) {
        list.splice(idx, 1);
        markerStore.set(caseId, [...list]);
        return true;
      }
    }
    return false;
  },
};
