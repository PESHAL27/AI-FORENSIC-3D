-- ==============================================================================
-- AI FORENSIC 3D: SUPABASE DATABASE SCHEMA (POSTGRESQL)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. CASES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'COMPLETED', 'IN_REVIEW')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast case lookup by case_number
CREATE INDEX IF NOT EXISTS idx_cases_number ON cases(case_number);

-- ------------------------------------------------------------------------------
-- 2. EVIDENCE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('IMAGE', 'VIDEO', 'IMAGE_360', 'REPORT', 'MEASUREMENT')),
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADED', 'PROCESSING', 'READY', 'FAILED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);

-- ------------------------------------------------------------------------------
-- 3. SCENES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Primary Forensic Reconstruction',
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_case_scene UNIQUE (case_id)
);

CREATE INDEX IF NOT EXISTS idx_scenes_case_id ON scenes(case_id);

-- ------------------------------------------------------------------------------
-- 4. SCENE OBJECTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scene_objects (
    id VARCHAR(100) NOT NULL,
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    original_position JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
    current_position JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
    original_rotation JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
    current_rotation JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
    scale JSONB NOT NULL DEFAULT '{"x":1,"y":1,"z":1}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, scene_id)
);

CREATE INDEX IF NOT EXISTS idx_scene_objects_scene_id ON scene_objects(scene_id);

-- ------------------------------------------------------------------------------
-- 5. EVIDENCE MARKERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_markers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE SET NULL,
    marker_type VARCHAR(50) NOT NULL DEFAULT 'EVIDENCE' CHECK (marker_type IN ('EVIDENCE', 'PERSON', 'OBJECT', 'DAMAGE', 'MEASUREMENT', 'UNKNOWN')),
    label VARCHAR(255) NOT NULL,
    position_x DOUBLE PRECISION NOT NULL,
    position_y DOUBLE PRECISION NOT NULL,
    position_z DOUBLE PRECISION NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_markers_case_id ON evidence_markers(case_id);

-- ------------------------------------------------------------------------------
-- 6. MEASUREMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    point_a JSONB NOT NULL, -- {"x": 0, "y": 0, "z": 0}
    point_b JSONB NOT NULL, -- {"x": 0, "y": 0, "z": 0}
    distance DOUBLE PRECISION NOT NULL,
    unit VARCHAR(10) NOT NULL DEFAULT 'm',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurements_case_id ON measurements(case_id);

-- ------------------------------------------------------------------------------
-- 7. TIMELINE EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    time_offset VARCHAR(50) NOT NULL, -- e.g. 'T-10s', 'T=0', 'T+2s'
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL DEFAULT 'movement',
    scene_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_case_id ON timeline_events(case_id);

-- ------------------------------------------------------------------------------
-- STORAGE BUCKET CREATION (Run in Supabase SQL editor)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;
