# Backend — FastAPI Service

This document describes the backend service powering EDI parsing, generation, and validation.

## Quick Start
1. Create virtualenv and activate:
```bash
python -m venv .venv
source .venv/bin/activate
```
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Run locally:
```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Environment Variables
- `SECRET_KEY` — required for signing JWT tokens
- `DATABASE_URL` — default: `sqlite:///./data/dev.db`

## Endpoints
- `POST /auth/login` — Body `{ username, password }`, returns JWT
- `POST /edi/validate-json` — Body `{ items: [...] }` — performs semantic validation
- `POST /edi/generate` — Body `{ items: [...] }` — returns serialized EDI
- `POST /edi/validate-edi` — Body `{ edi: '<EDI string>' }` — validates raw EDI
- `POST /edi/parse` — Body `{ edi: '<EDI string>' }` — parses to JSON

## Sample curl
Validate JSON:
```bash
curl -X POST http://localhost:8000/edi/validate-json \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items":[{"lin":1, "cargoType":"FCX"}]}'
```

Generate EDI:
```bash
curl -X POST http://localhost:8000/edi/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items":[{"lin":1, "cargoType":"FCX","containerNumber":"MSKU1234567"}]}'
```

## JWT Authentication
- The backend uses JWT for protecting endpoints. Include `Authorization: Bearer <token>` header for protected routes.
- Tokens are signed with `SECRET_KEY`. For a production system use a secure secret and short TTLs with refresh token flows.

## EDI Parser Behavior
- Low-level parsing uses `pydifact` where practical for correctness.
- The parser performs unescaping (`?'` → `'`) when mapping fields to JSON.
- Raw EDI is preserved for auditing and replay; unescaped values are computed for mapping only.

## Validation Behavior
- The validation layer enforces both syntactic and semantic rules:
  - Syntactic: segment counts, correct qualifiers
  - Semantic: enumerations (cargo type, RFF types), LIN uniqueness and sequence, text allowed char ranges
- Validation returns `{ errors: [], warnings: [] }` to help clients render actionable feedback.

## Notes on Escaped Delimiters
- The backend treats `?` as the escape prefix and `?'` as an escaped apostrophe inside data elements.
- Parsing must handle escape sequences at byte level; naive `split("'")` is insufficient.

## Tests
- Run `pytest -q` from repo root. See `tests/` for skeleton tests.
# ClearAI EDI Backend Service

This FastAPI backend supports user authentication, JSON-to-EDI conversion, EDI-to-JSON parsing, and payload validation.

## Features

- JWT authentication
- SQLite-based user storage
- `POST /auth/register` and `POST /auth/login`
- `POST /edi/json-to-edi`
- `POST /edi/edi-to-json`
- `POST /edi/validate-edi`
- `POST /edi/validate-json`
- Middleware for JSON body validation and EDI structural validation
- Service layer separation and reusable validators

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run the service

```bash
uvicorn app.main:app --reload
```

## Environment

Create a `.env` file in the project root or in the `app` folder with these values:

```env
DATABASE_URL=sqlite:///./app.db
JWT_SECRET_KEY=your-super-secret-value
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Testing

```bash
pytest app/tests
```

## Example requests

Register:

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecretPass123"}'
```

Login:

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecretPass123"}'
```

Convert JSON to EDI:

```bash
curl -X POST http://127.0.0.1:8000/edi/json-to-edi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"cargoItems":[{"cargoType":"FCX","numberOfPackages":10,"containerNumber":"CONT123"}]}'
```
