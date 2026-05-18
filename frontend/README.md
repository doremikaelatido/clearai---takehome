# Frontend — React / Vite Application

This document describes the frontend application used to edit, validate, and generate EDI.

## Installation
Prerequisites: Node 18+ and npm

```bash
npm install
```

## Running Locally
```bash
npm run dev
```

## Project Structure
- `src/lib` — shared utilities (`api.ts`, `storage.ts`)
- `src/services` — typed API wrappers (e.g., `ediService.ts`)
- `src/hooks` — UI hooks (e.g., `useValidateJson.ts`)
- `src/components` — reusable UI components (line-numbered editor, Load JSON)
- `src/pages` — page-level components (DecodeEdiPage, GenerateEdiPage)
- `shared/edi-contract.json` — canonical contract used by both front & back

## Routing
- `/generate` — JSON → EDI generation flow
- `/decode` — EDI → JSON parsing and validation

## Form Validation
- Field-level validation uses Zod schemas derived from `shared/edi-contract.json`.
- Text fields restrict characters to ASCII 32–126 except square brackets; LIN validated as unique positive integer.

## EDI Editor / Textarea
- Line-numbered textarea with synchronized scroll and `Prettify` action that inserts newlines after unescaped segment delimiters.
- The editor keeps raw EDI intact; unescape occurs only on transformation to JSON.

## Build Scripts
- `npm run build` — produce production build
- `npm run preview` — preview production build

## UI/UX Decisions
- Preserve raw EDI input to avoid losing escape semantics.
- Provide immediate client-side validation + server-side validation endpoint for authoritative checks.
