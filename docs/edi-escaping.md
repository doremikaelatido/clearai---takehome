# EDI Escaping Rules & Parsing Notes

## Key rules
- Segment delimiter: `'` (single quote)
- Escape character: `?`
- Escape sequence: `?'` represents a literal single quote in a data element.

## Parsing algorithm (recommended)
1. Iterate bytes left-to-right.
2. If current char is `?` and next char exists, treat next char as literal and append to current token; advance two positions.
3. If current char is `'` and previous char was not an unescaped `?`, treat as segment delimiter and finalize token.
4. Otherwise append char to current field.

## Why naive splitting fails
- Splitting by `'` will incorrectly treat escaped apostrophes as delimiters. Escapes must be recognized before splitting.

## Examples
- Logical value: `ABC'345` → EDI: `ABC?'345`
- Raw EDI: `FTX+AA+++ABC?'345'` → parsed field: `ABC'345`
