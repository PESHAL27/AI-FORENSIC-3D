# AI FORENSIC 3D - FastAPI & Supabase Backend

This is the backend service for **AI FORENSIC 3D**, providing RESTful APIs for case management, 3D scene reconstruction persistence, object coordinate syncing with debounced autosave, evidence marker spatial tracking, 3D Euclidean distance measurement calculations, and Supabase Storage integration for forensic assets.

---

## 1. Prerequisites

- **Python 3.10+** (Python 3.12 recommended)
- **Pip** package manager
- (Optional but recommended) A free [Supabase](https://supabase.com) account

---

## 2. Quick Start (Zero-Config Mode)

The backend features an automated **persistent local storage fallback mode**. If Supabase credentials are not configured yet, the backend immediately operates using a local JSON database and storage engine pre-seeded with baseline forensic data for **Case #CASE-2026-FR-0941**.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

5. Access the interactive Swagger API documentation:
   - **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 3. Supabase Integration Setup

To connect to a live Supabase PostgreSQL database and Supabase Storage bucket:

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Note your **Project URL** and API keys:
   - `anon` `public` key
   - `service_role` key (keep this secret! Never expose it to the frontend)

### Step 2: Apply Database Schema
1. In the Supabase Dashboard, navigate to the **SQL Editor**.
2. Open `backend/schema.sql` from this repository.
3. Paste the contents into the SQL Editor and click **Run**.
   - This creates all 7 tables (`cases`, `evidence`, `scenes`, `scene_objects`, `evidence_markers`, `measurements`, `timeline_events`), sets up indexes, and initializes the `forensic-evidence` storage bucket.

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `backend/.env` with your Supabase credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_STORAGE_BUCKET=forensic-evidence
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

When you start or reload FastAPI, the service will detect the keys and route all operations directly through Supabase PostgREST and Supabase Storage.

---

## 4. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service and Supabase connectivity status |
| `GET` | `/api/cases` | List all investigation cases |
| `POST` | `/api/cases` | Create a new case |
| `GET` | `/api/cases/{id}` | Get case details |
| `PATCH` | `/api/cases/{id}` | Update case title, description, or status |
| `DELETE` | `/api/cases/{id}` | Delete case |
| `POST` | `/api/cases/{id}/evidence` | Upload multipart evidence (photo, 360, video, report) |
| `GET` | `/api/cases/{id}/evidence` | List evidence assets for case |
| `DELETE` | `/api/evidence/{id}` | Delete evidence asset and file |
| `GET` | `/api/cases/{id}/scene` | Get 3D reconstruction scene and child objects |
| `PATCH` | `/api/cases/{id}/scene` | Debounced autosave for manipulated 3D objects |
| `POST` | `/api/cases/{id}/scene/restore-object/{obj_id}` | Restore single object to original coordinates |
| `POST` | `/api/cases/{id}/scene/reset` | Reset all scene objects to baseline positions |
| `GET` | `/api/cases/{id}/markers` | List 3D spatial evidence pins |
| `POST` | `/api/cases/{id}/markers` | Add 3D evidence marker |
| `PATCH` | `/api/markers/{id}` | Move or update marker |
| `DELETE` | `/api/markers/{id}` | Delete marker |
| `GET` | `/api/cases/{id}/measurements` | List 3D laser/photogrammetry distance measurements |
| `POST` | `/api/cases/{id}/measurements` | Register measurement with auto Euclidean distance |
| `GET` | `/api/cases/{id}/timeline` | Retrieve chronological event timeline |

---

## 5. Testing the API

You can test endpoints directly using `curl` or the Swagger UI at `http://localhost:8000/docs`:

```bash
# 1. Health check
curl http://localhost:8000/api/health

# 2. Get cases
curl http://localhost:8000/api/cases

# 3. Get 3D Scene for baseline case
curl http://localhost:8000/api/cases/CASE-2026-FR-0941/scene

# 4. Upload an evidence image
curl -X POST http://localhost:8000/api/cases/CASE-2026-FR-0941/evidence \
  -F "file=@photo.jpg" \
  -F "file_type=IMAGE"
```
