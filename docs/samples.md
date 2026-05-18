# Sample Payloads

## JSON → EDI (Single Cargo Item)
Request JSON
```json
{
  "items": [
    {
      "lin": 1,
      "cargoType": "FCX",
      "containerNumber": "MSKU1234567",
      "marks": "Fragile",
      "rff": [ { "type": "MB", "value": "BL123456" } ]
    }
  ]
}
```

Generated EDI (example)
```
LIN+1'
PAC+++FCX:1:20'
RFF+MB:BL123456'
EQD+CN+MSKU1234567'
FTX+AA+++Fragile'
```

## EDI → JSON
Raw EDI
```
LIN+1'PAC+++FCX:1:20'RFF+MB:BL123456'EQD+CN+MSKU1234567'FTX+AA+++Fragile'
```
Parsed JSON
```json
{
  "items": [
    {
      "lin": 1,
      "cargoType": "FCX",
      "containerNumber": "MSKU1234567",
      "marks": "Fragile",
      "rff": [{ "type": "MB", "value": "BL123456" }]
    }
  ]
}
```

## Escaped example
Raw EDI
```
FTX+AA+++ABC?'345'
```
Parsed value: `ABC'345`

## Malformed EDI examples
- Unescaped apostrophe inside field:
```
FTX+AA+++ABC'345'
```
  - Fails because parser interprets `'` as segment delimiter.
- Trailing escape character:
```
FTX+AA+++DATA?'
```
  - Fails because `?` escape is not followed by a valid char.

## Validation failure (JSON)
Request
```json
{ "items": [{ "lin": -1, "cargoType": "UNKNOWN" }] }
```
Response
```json
{
  "ok": false,
  "errors": [
    "LIN must be a positive integer",
    "cargoType must be one of FCX,LCL,FCL"
  ]
}
```
