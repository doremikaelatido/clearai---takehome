# Testing Strategy

## Goals
- Verify parser and generator correctness
- Ensure escaping rules are preserved across roundtrip flows
- Validate API endpoints and authentication

## Test types
- Unit tests: parser, generator, validators
- Integration tests: API endpoints, auth, service wiring
- Roundtrip tests: JSON → EDI → JSON to assert semantic equivalence
- Negative tests: malformed EDI, invalid JSON

## Running tests
From the repository root:
```bash
pytest -q
```

## Test skeletons
Skeleton test modules are under `tests/` (parser, generator, roundtrip, escape, auth). Fill in concrete assertions referencing `app.services` and validation modules.
