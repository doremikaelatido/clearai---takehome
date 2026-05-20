from dataclasses import dataclass
from typing import Any


@dataclass
class EdiSegment:
    tag: str
    elements: list[Any]


def parse_edi_segments(edi_text: str) -> list[EdiSegment]:
    """
    Lightweight EDIFACT parser with proper release-character handling.
    """

    raw_segments: list[str] = []

    current: list[str] = []
    escape_next = False

    for char in edi_text:
        # Real segment terminator
        if char == "'" and not escape_next:
            segment = "".join(current).strip()
            if segment:
                raw_segments.append(segment)
            current = []
            continue

        # Previous char was release character
        if escape_next:
            current.append(char)
            escape_next = False
            continue

        # Release character
        if char == "?":
            current.append(char)
            escape_next = True
            continue

        current.append(char)

    # Flush trailing content
    trailing = "".join(current).strip()
    if trailing:
        raw_segments.append(trailing)

    parsed_segments: list[EdiSegment] = []

    for raw_segment in raw_segments:
        parts = raw_segment.split("+")

        if not parts:
            continue

        tag = parts[0].strip()

        elements: list[Any] = []

        if tag == "RFF":
            rff_parts = raw_segment.split("+", 1)
            # Special handling for RFF segments to split by ':' while respecting release characters
            qualifier, value = rff_parts[1].split(":", 1)
            print(f"Parsing RFF segment: qualifier='{qualifier}', value='{value}'")  # Debug log
            elements.append(qualifier)
            elements.append(value)
        else:
            for part in parts[1:]:
                if ":" in part:
                    elements.append(part.split(":"))
                else:
                    elements.append(part)

        parsed_segments.append(
            EdiSegment(
                tag=tag,
                elements=elements,
            )
        )

    return parsed_segments