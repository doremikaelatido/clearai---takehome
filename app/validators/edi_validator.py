import re
from app.schemas.edi import CargoType, RffType
from app.models.validation_result import ValidationResult

SEGMENT_PREFIXES = ("LIN+", "PAC+", "PCI+", "RFF+")
CARGO_TYPE_PATTERN = "|".join(
    re.escape(item.value) for item in CargoType
)
RFF_TYPE_PATTERN = "|".join(
    re.escape(item.value) for item in RffType
)
LIN_REGEX = re.compile(r"^LIN\+(\d+)\+I$")
PAC_TYPE_REGEX = re.compile(
    rf"^PAC\+\+\+({CARGO_TYPE_PATTERN}):67:95$"
)
PAC_COUNT_REGEX = re.compile(
    r"^PAC\+([1-9][0-9]*)\+1$"
)
RFF_REGEX = re.compile(
    rf"^RFF\+({RFF_TYPE_PATTERN}):(.+)$"
)
PCI_REGEX = re.compile(r"^PCI\+1$")

def normalize_segment(segment: str) -> str:
    """
    Remove unnecessary whitespace and control chars.
    """
    return re.sub(r"\s+", "", segment.strip())


def recover_segment(
    raw_segment: str,
) -> tuple[str | None, str | None]:
    """
    Attempts to recover a valid EDI segment from noisy input.

    Returns:
        recovered_segment,
        warning_message
    """
    normalized = normalize_segment(raw_segment)
    for prefix in SEGMENT_PREFIXES:
        idx = normalized.find(prefix)

        if idx == -1:
            continue

        # Perfect segment
        if idx == 0:
            return normalized, None

        # Recoverable garbage before segment
        garbage = normalized[:idx]
        recovered = normalized[idx:]
        return (
            recovered,
            (
                "Discarded unexpected text before segment: "
                f"'{garbage}'"
            ),
        )
    return (
        None,
        f"Unknown or unsupported segment: '{raw_segment}'",
    )


def validate_edi_string(edi_text: str) -> ValidationResult:
    result = ValidationResult()
    if not isinstance(edi_text, str) or not edi_text.strip():
        result.errors.append("EDI payload must be a non-empty string")
        return result

    raw_segments = [
        segment
        for segment in re.split(r"(?<!\?)'", edi_text)
        if segment.strip()
    ]

    if not raw_segments:
        result.errors.append("EDI payload contains no segments")
        return result

    recovered_segments: list[tuple[int, str]] = []
    # -----------------------------------------
    # Recovery phase
    # -----------------------------------------
    for line_no, raw_segment in enumerate(raw_segments, start=1):
        segment, warning = recover_segment(raw_segment)
        if warning:
            result.warnings.append(
                f"{warning} @ line:{line_no}"
            )
        if segment:
            recovered_segments.append((line_no, segment))

    if not recovered_segments:
        result.errors.append(
            "No valid EDI segments could be recovered"
        )
        return result.errors, result.warnings

    # -----------------------------------------
    # Required segment checks
    # -----------------------------------------
    has_lin = any(
        segment.startswith("LIN+")
        for _, segment in recovered_segments
    )
    has_pac = any(
        segment.startswith("PAC+")
        for _, segment in recovered_segments
    )

    if not has_lin:
        result.errors.append("Missing LIN segment")
    if not has_pac:
        result.errors.append("Missing PAC segment")

    # -----------------------------------------
    # Validation state machine
    # -----------------------------------------
    expected_lin = 1
    expecting_rff = False
    for line_no, segment in recovered_segments:
        # -------------------------------------
        # LIN
        # -------------------------------------
        if segment.startswith("LIN+"):
            match = LIN_REGEX.match(segment)
            if not match:
                result.errors.append(
                    f"Invalid LIN segment: {segment} "
                    f"@ line:{line_no}"
                )
                continue

            lin_number = int(match.group(1))
            if lin_number != expected_lin:
                result.errors.append(
                    (
                        "Invalid LIN sequence "
                        f"{lin_number}, expected "
                        f"{expected_lin} "
                        f"@ line:{line_no}"
                    )
                )
            else:
                expected_lin += 1

            expecting_rff = False
            continue

        # -------------------------------------
        # PAC
        # -------------------------------------
        if segment.startswith("PAC+"):
            is_valid = (
                PAC_TYPE_REGEX.match(segment)
                or PAC_COUNT_REGEX.match(segment)
            )
            if not is_valid:
                result.errors.append(
                    f"Invalid PAC segment: {segment} "
                    f"@ line:{line_no}"
                )
            expecting_rff = False
            continue

        # -------------------------------------
        # PCI
        # -------------------------------------
        if segment.startswith("PCI+"):
            if not PCI_REGEX.match(segment):
                result.errors.append(
                    f"Invalid PCI segment: {segment} "
                    f"@ line:{line_no}"
                )
            else:
                expecting_rff = True
            continue

        # -------------------------------------
        # RFF
        # -------------------------------------
        if segment.startswith("RFF+"):
            if not expecting_rff:
                result.errors.append(
                    (
                        "RFF segment must be preceded "
                        "by PCI+1 "
                        f"@ line:{line_no}"
                    )
                )
            match = RFF_REGEX.match(segment)
            if not match:
                result.errors.append(
                    f"Invalid RFF segment: {segment} "
                    f"@ line:{line_no}"
                )
            expecting_rff = False
            continue

        # -------------------------------------
        # Unknown recovered segment
        # -------------------------------------
        result.warnings.append(
            f"Unhandled segment: {segment} "
            f"@ line:{line_no}"
        )

    # -----------------------------------------
    # Final structural validation
    # -----------------------------------------
    if expecting_rff:
        result.errors.append(
            "PCI+1 segment missing required RFF segment"
        )

    cleaned_segments = [
        segment
        for _, segment in recovered_segments
    ]
    result.cleaned_edi = "'".join(cleaned_segments) + "'"
    result.valid = not result.errors
    return result