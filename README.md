# MinuteFlow — Meeting Notes & Transcription Platform

A full-stack, interview-ready meeting intelligence workspace inspired by the interaction patterns of modern meeting assistants. It includes a meeting library, searchable interactive transcripts, mock media playback, AI-style summaries, action-item management, transcript upload, CRUD operations, and SQLite persistence.

> This implementation is original and uses a distinct MinuteFlow identity. It recreates the requested workflows without copying proprietary source code or assets.

## Tech stack

- Frontend: Next.js App Router, TypeScript, React, plain responsive CSS, Lucide icons
- Backend: FastAPI, SQLAlchemy 2.x, Pydantic
- Database: SQLite with relational tables and foreign keys

## Folder structure

```text
meeting-notes-platform/
├── backend/
│   ├── app/
│   │   ├── routers/meetings.py
│   │   ├── services/transcript.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   └── main.py
│   ├── requirements.txt
│   └── render.yaml
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
└── README.md
```

## Database design

- `meetings`: title, date, duration, status, source, summary
- `participants`: many-to-one relationship with meetings
- `transcript_segments`: speaker, start/end timestamps, text
- `action_items`: task, assignee, due date, completion state
- `topics`: reusable meeting topic records

Deleting a meeting cascades to all dependent records. The schema is normalized enough to query participants, transcript text, tasks, and topics independently.

## Run locally on Windows PowerShell

### 1. Backend

```powershell
cd meeting-notes-platform\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend: `http://localhost:8000`  
Swagger API docs: `http://localhost:8000/docs`

### 2. Frontend

Open a second terminal:

```powershell
cd meeting-notes-platform\frontend
copy .env.example .env.local
npm install
npm run dev
```

Frontend: `http://localhost:3000`

The backend automatically creates `meeting_notes.db` and seeds three complete meetings on first launch.

## Core workflow

1. Dashboard fetches `GET /api/meetings` and supports debounced full-text-style title/transcript search plus sorting.
2. Opening a meeting fetches relational detail data from `GET /api/meetings/{id}`.
3. Clicking a transcript segment updates the mock player time. While playback runs, the active segment changes according to its timestamp.
4. Action-item checkboxes persist through PATCH requests.
5. “Add meeting” accepts pasted text or `.txt`, `.vtt`, `.srt` uploads.
6. The backend parses `[mm:ss] Speaker: text` lines, derives a basic seeded summary/topics, and persists everything.

## Supported transcript format

```text
[00:00] Ananya: Welcome everyone. Today we will finalize the roadmap.
[00:18] Mehak: I have prepared the onboarding prototype.
[00:42] Rohan: We should validate the enterprise permission model.
```

Lines without timestamps are still accepted and receive calculated sequential timestamps.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/meetings` | List/search/filter/sort meetings |
| GET | `/api/meetings/{id}` | Meeting detail |
| POST | `/api/meetings` | Create from pasted transcript |
| POST | `/api/meetings/upload` | Create from transcript file |
| PATCH | `/api/meetings/{id}` | Edit metadata/summary |
| DELETE | `/api/meetings/{id}` | Delete meeting |
| POST | `/api/meetings/{id}/actions` | Add task |
| PATCH | `/api/meetings/{id}/actions/{actionId}` | Edit/complete task |
| DELETE | `/api/meetings/{id}/actions/{actionId}` | Delete task |

## Deployment

### Backend on Render

1. Push the repository to GitHub.
2. Create a Render Web Service with root directory `backend`.
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add `FRONTEND_ORIGIN=https://your-frontend.vercel.app`

SQLite on many free hosts can be ephemeral. For a permanent production demo, attach a persistent disk or replace `DATABASE_URL` with a hosted PostgreSQL database. The SQLAlchemy layer minimizes migration effort.

### Frontend on Vercel

1. Import the GitHub repository and set root directory to `frontend`.
2. Add environment variable `NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api`.
3. Deploy.

## Interview explanation

### Architecture

The frontend is deliberately separated from the REST API. UI components only call the typed API wrapper in `frontend/lib/api.ts`; business logic and persistence remain in FastAPI. The backend uses routers for HTTP concerns, services for transcript parsing, schemas for request/response validation, and ORM models for relationships.

### Why SQLite?

The assignment requests SQLite. It is simple to run, requires no external database service, and is ideal for a 24-hour assignment. SQLAlchemy keeps the data layer portable if the product later moves to PostgreSQL.

### How transcript-player synchronization works

Every segment has `start_seconds` and `end_seconds`. Clicking a segment sets player time to `start_seconds`. During mock playback, a one-second timer advances the current time. The UI finds the segment whose range contains the current time and highlights it. A real audio element can later replace the timer while preserving the same segment-matching logic.

### What is mocked and what is real?

Real: meeting CRUD, SQLite persistence, title/transcript/participant/date search and filtering, sorting, transcript parsing and highlighting, player synchronization, action-item add/edit/complete/delete, TXT export, notifications/toasts, seeded data, and responsive UI.  
Mocked: live call bot, actual speech-to-text, authentication, external integrations, and true LLM generation, as permitted in the assignment.

### Production improvements

- Alembic migrations and PostgreSQL
- Authentication and workspace-level authorization
- Object storage for recordings
- Background jobs for transcription and summaries
- Pagination and FTS5/PostgreSQL full-text search
- Automated tests, rate limiting, observability, and CI/CD

## Quick interviewer demo script

1. Open the dashboard and search “enterprise”.
2. Open “Q3 Product Strategy Review”.
3. Click a chapter and show that the transcript/player timestamp changes.
4. Search inside the transcript for “onboarding”.
5. Complete an action item and refresh to prove persistence.
6. Export the meeting as text.
7. Add a new meeting using a short timestamped transcript.
8. Open `/docs` to show the clean API contract and database-backed CRUD.

## Meeting Workspace v2 Improvements

The meeting detail experience has been rebuilt into reusable components:

- `MeetingHeader.tsx` — meeting metadata, participants, share/export/edit/delete actions
- `MediaPlayer.tsx` — play/pause, seek, 10-second rewind, speed control, progress styling
- `SummaryPanel.tsx` — executive overview, decisions, next steps, topics, risks, and chapters
- `TranscriptPanel.tsx` — speaker-aware search, highlighted matches, active segment state
- `ActionItemsPanel.tsx` — complete action-item CRUD UI and participant list

The page now includes proper loading skeletons, API error states, confirmation prompts, responsive layouts, sticky playback controls, accessible tab semantics, and clearer visual hierarchy.

## Interactive API Documentation

When the backend is running, open:

- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

The API documentation is grouped into three sections:

- **System** — health and service availability
- **Meetings** — meeting library, upload, detail, update, and deletion
- **Action Items** — task creation, editing, completion, and deletion

Every endpoint includes a summary, detailed description, typed request/response schema, examples, and documented error responses. Use **Try it out** in Swagger to test the API before demonstrating the frontend.
