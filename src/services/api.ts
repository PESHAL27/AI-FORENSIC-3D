/**
 * AI FORENSIC 3D - REST API CLIENT
 * Connects the React frontend to the FastAPI Backend and Supabase Database / Storage.
 */

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  mode: string;
  supabase_configured: boolean;
  supabase_connected: boolean;
}

export interface CaseItem {
  id: string;
  case_number: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'IN_REVIEW';
  created_at: string;
  updated_at: string;
}

export interface CreateCaseInput {
  case_number: string;
  title: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'IN_REVIEW';
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SceneObject {
  id: string;
  name: string;
  type: string;
  model?: string;
  original_position: Vector3D;
  current_position: Vector3D;
  original_rotation: Vector3D;
  current_rotation: Vector3D;
  scale: Vector3D;
  metadata?: Record<string, any>;
}

export interface SceneData {
  id: string;
  case_id: string;
  name: string;
  version: number;
  objects: SceneObject[];
  created_at: string;
  updated_at: string;
}

export interface SceneUpdateInput {
  name?: string;
  version?: number;
  objects?: Partial<SceneObject>[];
}

export interface BackendEvidenceItem {
  id: string;
  case_id: string;
  original_filename: string;
  filename?: string;
  storage_path: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  status: string;
  metadata: Record<string, any>;
  download_url?: string;
  analysis?: EvidenceAnalysisResponse;
  created_at: string;
  updated_at: string;
}

export interface DetectedObject {
  id: string;
  name: string;
  category: string;
  confidence: number;
  observation: string;
  state: 'observed' | 'inferred';
}

export interface SpatialRelationship {
  subject: string;
  relation: string;
  object: string;
  confidence: number;
}

export interface ObservationItem {
  text: string;
  state: 'observed' | 'inferred';
}

export interface SceneAnalysisResult {
  scene_type: string;
  overall_description: string;
  objects: DetectedObject[];
  relationships: SpatialRelationship[];
  observations: ObservationItem[];
  possible_evidence: string[];
  uncertainties: string[];
}

export interface EvidenceAnalysisResponse {
  evidence_id: string;
  case_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  provider: string;
  model: string;
  timestamp: string;
  error_message?: string;
  result?: SceneAnalysisResult;
}


export interface BackendMarkerItem {
  id: string;
  case_id: string;
  label: string;
  marker_type: string;
  position_x: number;
  position_y: number;
  position_z: number;
  evidence_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateMarkerInput {
  label: string;
  marker_type?: string;
  position_x: number;
  position_y: number;
  position_z: number;
  evidence_id?: string;
  metadata?: Record<string, any>;
}

export interface BackendMeasurementItem {
  id: string;
  case_id: string;
  label: string;
  point_a: Vector3D;
  point_b: Vector3D;
  distance: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMeasurementInput {
  label: string;
  point_a: Vector3D;
  point_b: Vector3D;
  unit?: string;
}

export interface BackendTimelineItem {
  id: string;
  case_id: string;
  time_offset: string;
  event_name: string;
  description?: string;
  event_type: string;
  scene_state?: Record<string, any>;
  created_at: string;
}

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData ? options.headers : headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // 1. Health
  async healthCheck(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  // 2. Cases
  async getCases(): Promise<CaseItem[]> {
    return request<CaseItem[]>('/cases');
  },

  async getCase(caseId: string): Promise<CaseItem> {
    return request<CaseItem>(`/cases/${encodeURIComponent(caseId)}`);
  },

  async createCase(caseData: CreateCaseInput): Promise<CaseItem> {
    return request<CaseItem>('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  async updateCase(caseId: string, updates: Partial<CreateCaseInput>): Promise<CaseItem> {
    return request<CaseItem>(`/cases/${encodeURIComponent(caseId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteCase(caseId: string): Promise<boolean> {
    await request(`/cases/${encodeURIComponent(caseId)}`, {
      method: 'DELETE',
    });
    return true;
  },

  // 3. Evidence
  async getCaseEvidence(caseId: string): Promise<BackendEvidenceItem[]> {
    return request<BackendEvidenceItem[]>(`/cases/${encodeURIComponent(caseId)}/evidence`);
  },

  async uploadEvidence(
    caseId: string,
    file: File,
    fileType: string = 'IMAGE',
    metadata?: Record<string, any>
  ): Promise<BackendEvidenceItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}/evidence`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let detail = `Upload failed with status ${response.status}`;
      try {
        const err = await response.json();
        if (err.detail) detail = err.detail;
      } catch {}
      throw new Error(detail);
    }

    return response.json();
  },

  async getEvidence(evidenceId: string): Promise<BackendEvidenceItem> {
    return request<BackendEvidenceItem>(`/evidence/${encodeURIComponent(evidenceId)}`);
  },

  async deleteEvidence(evidenceId: string): Promise<boolean> {
    await request(`/evidence/${encodeURIComponent(evidenceId)}`, {
      method: 'DELETE',
    });
    return true;
  },

  // 4. Scenes & 3D Objects
  async getScene(caseId: string): Promise<SceneData> {
    return request<SceneData>(`/cases/${encodeURIComponent(caseId)}/scene`);
  },

  async saveScene(caseId: string, sceneData: SceneUpdateInput): Promise<SceneData> {
    return request<SceneData>(`/cases/${encodeURIComponent(caseId)}/scene`, {
      method: 'PATCH',
      body: JSON.stringify(sceneData),
    });
  },

  async restoreObject(caseId: string, objectId: string): Promise<SceneObject> {
    return request<SceneObject>(
      `/cases/${encodeURIComponent(caseId)}/scene/restore-object/${encodeURIComponent(objectId)}`,
      { method: 'POST' }
    );
  },

  async resetScene(caseId: string): Promise<SceneData> {
    return request<SceneData>(`/cases/${encodeURIComponent(caseId)}/scene/reset`, {
      method: 'POST',
    });
  },

  // 5. Markers
  async getMarkers(caseId: string): Promise<BackendMarkerItem[]> {
    return request<BackendMarkerItem[]>(`/cases/${encodeURIComponent(caseId)}/markers`);
  },

  async createMarker(caseId: string, marker: CreateMarkerInput): Promise<BackendMarkerItem> {
    return request<BackendMarkerItem>(`/cases/${encodeURIComponent(caseId)}/markers`, {
      method: 'POST',
      body: JSON.stringify(marker),
    });
  },

  async deleteMarker(markerId: string): Promise<boolean> {
    await request(`/markers/${encodeURIComponent(markerId)}`, {
      method: 'DELETE',
    });
    return true;
  },

  // 6. Measurements
  async getMeasurements(caseId: string): Promise<BackendMeasurementItem[]> {
    return request<BackendMeasurementItem[]>(`/cases/${encodeURIComponent(caseId)}/measurements`);
  },

  async createMeasurement(
    caseId: string,
    measurement: CreateMeasurementInput
  ): Promise<BackendMeasurementItem> {
    return request<BackendMeasurementItem>(`/cases/${encodeURIComponent(caseId)}/measurements`, {
      method: 'POST',
      body: JSON.stringify(measurement),
    });
  },

  // 7. Timeline
  async getTimeline(caseId: string): Promise<BackendTimelineItem[]> {
    return request<BackendTimelineItem[]>(`/cases/${encodeURIComponent(caseId)}/timeline`);
  },

  // 8. AI Scene Understanding
  async analyzeEvidence(evidenceId: string): Promise<EvidenceAnalysisResponse> {
    return request<EvidenceAnalysisResponse>(`/evidence/${encodeURIComponent(evidenceId)}/analyze`, {
      method: 'POST',
    });
  },

  async getEvidenceAnalysis(evidenceId: string): Promise<EvidenceAnalysisResponse> {
    return request<EvidenceAnalysisResponse>(`/evidence/${encodeURIComponent(evidenceId)}/analysis`);
  },

  async getCaseAnalyses(caseId: string): Promise<EvidenceAnalysisResponse[]> {
    return request<EvidenceAnalysisResponse[]>(`/cases/${encodeURIComponent(caseId)}/analyses`);
  },
};

