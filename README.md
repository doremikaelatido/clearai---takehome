# EDI Converter & Validator — Take-home Project

Project delivering a pragmatic, maintainable web application for converting between JSON and EDI (segment-based) payloads, validating messages, and preserving raw EDI semantics. This repository contains a React + Vite frontend and a Python FastAPI backend with a focused EDI service layer.

## Project Overview
This project demonstrates a clean separation between presentation (frontend), API surface (FastAPI), validation rules, EDI parsing/generation logic, and persistence. It emphasizes correctness around EDI escaping rules, contract-driven validation, and testability.

## Features
- JSON → EDI generation (serializer)
- EDI → JSON parsing (parser)
- Structural and semantic validation for JSON and EDI
- JWT-based authentication for protected endpoints
- Precise handling of escaped EDI delimiters using `?` and `'`
- Shared `shared/edi-contract.json` to avoid duplicated enums and validation rules
- Docker support for reproducible local setup

## Architecture Overview
Frontend (React/Vite) ↔ REST API ↔ FastAPI backend
- Validation Layer: syntactic and semantic checks
- EDI Service Layer: parser and generator (isolated modules)
- Persistence Layer: SQLite for demo purposes (replaceable for production)

## Tech Stack
- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Python 3.12, FastAPI, Pydantic, pydifact, SQLAlchemy
- Auth: JWT
- Dev: Docker, docker-compose

## Repository Structure (high level)
- `src/` — frontend app
- `app/` — backend service
- `shared/` — shared contract and enums used by both front and back
- `tests/` — backend pytest tests (skeletons provided)
- `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`

## Setup Instructions
1. Clone the repo
2. Frontend: `npm install`
3. Backend: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
4. Start frontend: `npm run dev`
5. Start backend: `uvicorn app.main:app --reload --port 8000`

## Running with Docker
Build and run both services via docker-compose for a consistent environment:
```bash
docker-compose up --build
```

## Environment Variables
- `VITE_API_BASE_URL` — front->back API base URL
- `SECRET_KEY` — backend JWT secret
- `DATABASE_URL` — backend DB connection (sqlite default provided)

## API Documentation
The FastAPI app exposes OpenAPI docs at `/docs` when running locally. Key endpoints:
- `POST /auth/login` — returns JWT token
- `POST /edi/generate` — accepts JSON payloads → returns EDI string
- `POST /edi/parse` — accepts EDI string → returns JSON
- `POST /edi/validate-json` — validates JSON for generation
- `POST /edi/validate-edi` — validates raw EDI

## EDI Escaping Rules
- Segment delimiter: `'` (single quote)
- Escape char: `?`
- Use `?` immediately before a delimiter to include that delimiter literally inside data: `ABC?'345` → logical value `ABC'345`
- Parsers must scan and treat `?'` as a literal apostrophe, not a segment separator

## Sample Requests & Responses
See `docs/samples.md` for complete JSON and EDI examples including escaped cases and malformed inputs.

## Testing
- Backend uses `pytest`; run `pytest -q` from the repository root. Skeletons are under `tests/`.

## Assumptions
- The implementation targets a specific EDI subset required by the assessment and uses a shared contract to avoid duplication. See `docs/assumptions.md`.

## Future Improvements
- Streaming parsing, trading-partner profiles, audit logs, and more—see `docs/future-improvements.md`.

---
If you want these documents committed to specific folders or need CI configuration updates, I can add them next.
# ClearAI EDI Dashboard

A modern EDI web application UI built with React, Vite, TailwindCSS, and shadcn-inspired components.

## Recommended Folder Structure

- `/src`
  - `/components`
    - `/ui` - reusable UI primitives
    - `CargoForm.tsx`
    - `DashboardLayout.tsx`
    - `FileUpload.tsx`
    - `OutputPanel.tsx`
    - `Sidebar.tsx`
    - `SummaryTable.tsx`
  - `/lib`
    - `edi.ts`
    - `types.ts`
    - `utils.ts`
  - `/pages`
    - `DecodeEdiPage.tsx`
    - `GenerateEdiPage.tsx`
    - `LoginPage.tsx`
    - `SignupPage.tsx`
  - `App.tsx`
  - `main.tsx`
  - `styles/globals.css`
- `package.json`
- `tailwind.config.js`
- `vite.config.ts`

## Install Packages

```bash
cd "/Users/mikaelanicoleramos/Documents/GitHub/clearai - takehome"
npm install
```

## Tailwind Setup

Tailwind is already configured via `tailwind.config.js`, `postcss.config.js`, and `src/styles/globals.css`.

## shadcn/ui Setup

This project uses shadcn-style reusable UI primitives in `src/components/ui/*`.
Use those wrapper components in future pages for consistent enterprise UI.

## Available Scripts

- `npm run dev` - start the local Vite development server
- `npm run build` - build the production bundle
- `npm run preview` - preview the built app locally

## Routing

- `/login`
- `/signup`
- `/home/generate-edi`
- `/home/decode-edi`

## Notes

- Uses React Hook Form + Zod for cargo form validation
- Includes mock EDI generation and decode helpers
- Sidebar and dashboard layout are responsive and reusable
