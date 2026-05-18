# Assumptions & Design Decisions

## Assumptions
- The project targets a limited but realistic subset of EDI segments required for the assessment.
- Trading partner variability is out of scope for this take-home; a single canonical format is used.
- LIN counters are per-message and must be unique and sequential.

## Simplifications
- No streaming parser for huge files — in-memory parsing is used for clarity.
- Persistence uses SQLite for simplicity; production should use a managed RDBMS.

## Supported Scope
- Segment-based messages using `'` as a segment delimiter and `?` as an escape prefix.
- Common cargo segments such as `LIN`, `PAC`, `RFF`, `EQD`, `FTX`.

## Parser Limitations
- Not a complete EDIFACT implementation. Composite elements and advanced segment groups are minimal.

## Rationale
- Use `pydifact` for low-level parsing where practical to avoid reimplementing fragile behavior.
- Shared contract reduces drift between front and back and improves testability.
