## Architecture & Design

### Layered Overview
Frontend (React) → REST API → FastAPI Backend → Validation Layer → EDI Service Layer → Persistence

- Frontend: UI, lightweight client validation, and user experience concerns.
- REST API: authentication, request routing, and minimal orchestration.
- Validation Layer: syntactic and semantic checks, returns structured errors/warnings.
- EDI Service Layer: parser and generator implementations, isolated from validation and persistence.
- Persistence: stores metadata and raw EDI when necessary.

### Separation of Concerns
- Parser and generator are separate modules to avoid accidental behavior coupling: generator must escape correctly; parser must unescape correctly.
- Validation is performed before transformation to stop invalid outputs and to provide meaningful errors early.

### Escaping Strategy
- Raw EDI is preserved. Unescaping is applied only when mapping fields into typed JSON objects; escaping is applied only during generation.
- Low-level parsing uses `pydifact` where feasible; supplemental byte-level scanning is used for escape-aware operations.

### Why validation before transformation
- Prevents emission of invalid EDI (which could break trading partners).
- Moves error reporting to a pre-commit gate for the client and server.
