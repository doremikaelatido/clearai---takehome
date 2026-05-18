import re

from app.schemas.edi import CargoType, RffType


CARGO_TYPE_PATTERN = "|".join(re.escape(item.value) for item in CargoType)
RFF_TYPE_PATTERN = "|".join(re.escape(item.value) for item in RffType)
LIN_REGEX = re.compile(r"^LIN\+(\d+)\+I$")
PAC_TYPE_REGEX = re.compile(rf"^PAC\+\+\+({CARGO_TYPE_PATTERN}):67:95$")
PAC_COUNT_REGEX = re.compile(r"^PAC\+[1-9]+[0-9]*\+1$")
RFF_REGEX = re.compile(
    rf"^RFF\+(?:{RFF_TYPE_PATTERN}):[^\[\]]+$"
)

def validate_edi_string(edi_text: str) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    if not isinstance(edi_text, str) or not edi_text.strip():
        return (["EDI payload must be a non-empty string"], [])

    segments = [segment.strip() for segment in edi_text.split("'") if segment.strip()]
    if not segments:
        return (["EDI payload contains no segments"], [])

    has_lin = any(segment.startswith("LIN+") for segment in segments)
    has_pac = any(segment.startswith("PAC+") for segment in segments)

    if not has_lin:
        errors.append("Missing LIN segment")
    if not has_pac:
        errors.append("Missing PAC segment")

    last_count = 0
    last_segment_pci = False
    for line, segment in enumerate(segments):
        if segment.startswith("LIN+"):
            lin_match = LIN_REGEX.match(segment)
            if not lin_match:
                errors.append(f"Invalid LIN segment: {segment} @ line:{line+1}")
            else:
                lin_value = lin_match.group(1)
                if int(lin_value) != last_count + 1:
                    errors.append(f"Invalid LIN segment value: {lin_value} @ line:{line+1}")
                else:
                    last_count += 1
        elif segment.startswith("PAC+"):
            if not (PAC_TYPE_REGEX.match(segment) or PAC_COUNT_REGEX.match(segment)):
                errors.append(f"Invalid PAC segment: {segment} @ line:{line+1}")
        elif last_segment_pci:
            if segment.startswith("RFF+"):
                if not RFF_REGEX.match(segment):
                    errors.append(f"Invalid RFF segment: {segment} @ line:{line+1}")
        else:
            if segment.startswith("RFF+"):
                errors.append(f"Invalid RFF segment block - not preceded by PCI+1")
            else:
                warnings.append(f"Unexpected line @ {line+1}")
        last_segment_pci = segment == "PCI+1"

    return errors, warnings
