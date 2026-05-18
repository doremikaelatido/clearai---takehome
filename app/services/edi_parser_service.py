from typing import Any

from pydantic import ValidationError
from pydifact import Parser

from app.schemas.edi import CargoItemBase, RffType

class EdiParserService:
    # Map RFF qualifiers to cargo item fields
    RFF_QUALIFIER_MAP = {
        RffType.AAQ.value: "containerNumber",
        RffType.MB.value: "masterBlNumber",
        RffType.BH.value: "houseBlNumber",
    }

    @staticmethod
    def _unescape_text(value: str) -> str:
        """Unescape EDI release sequences by treating ?X as literal X."""
        result: list[str] = []
        index = 0
        while index < len(value):
            if value[index] == '?' and index + 1 < len(value):
                result.append(value[index + 1])
                index += 2
                continue
            result.append(value[index])
            index += 1
        return ''.join(result)

    @staticmethod
    def _split_release_aware(value: str, delimiter: str) -> list[str]:
        parts: list[str] = []
        buffer: list[str] = []
        index = 0
        while index < len(value):
            char = value[index]
            if char == '?' and index + 1 < len(value):
                buffer.append(value[index])
                buffer.append(value[index + 1])
                index += 2
                continue
            if char == delimiter:
                parts.append(''.join(buffer))
                buffer = []
                index += 1
                continue
            buffer.append(char)
            index += 1
        parts.append(''.join(buffer))
        return parts

    @staticmethod
    def _validate_text_value(value: str) -> str:
        """
        Validate that text value contains only allowed ASCII characters (32-126, except [ and ]).
        Raises ValueError if validation fails.
        """
        # ASCII 32-126 is printable ASCII, excluding 91 ([) and 93 (])
        for char in value:
            char_code = ord(char)
            if not (32 <= char_code <= 126) or char_code in (91, 93):
                raise ValueError(
                    f"Invalid character in RFF value: '{char}' (ASCII {char_code}). "
                    f"Allowed: ASCII 32-126 except [ (91) and ] (93)."
                )
        return value

    @staticmethod
    def parse_edi(edi_text: str) -> list[CargoItemBase]:
        """
        Parse EDI text using pydifact library with validation.
        
        Extracts cargo items from EDI segments (LIN, PAC, RFF).
        Only returns items that pass Pydantic validation.
        """
        try:
            # Parse EDI message using pydifact
            parser = Parser()
            segments = list(parser.parse(edi_text))
        except Exception:
            segments = []

        cargo_items: list[dict[str, Any]] = []
        current_item: dict[str, Any] | None = None

        # Iterate through parsed segments
        for segment in segments:
            tag = segment.tag.strip()

            if tag == "LIN":
                # Start a new cargo item
                if current_item:
                    cargo_items.append(current_item)
                current_item = {
                    "cargoType": None,
                    "numberOfPackages": None,
                    "containerNumber": None,
                    "masterBlNumber": None,
                    "houseBlNumber": None,
                }

            if current_item is None:
                continue

            if tag == "PAC":
                # PAC segment: packaging info
                # pydifact may represent composites at different positions; handle both shapes
                elements = segment.elements

                if isinstance(elements, list) and len(elements) > 0:
                    # Find the first composite (list) element if present
                    composite = None
                    for el in elements:
                        if isinstance(el, list):
                            composite = el
                            break

                    # If a composite exists, try to extract cargo type from it
                    if composite:
                        # composite might be ['', '', '', 'FCL', '67', '95'] or ['FCL', '67', '95']
                        cargo_candidate = None
                        if len(composite) >= 1 and composite[0]:
                            cargo_candidate = composite[0]
                        if (not cargo_candidate) and len(composite) >= 4 and composite[3]:
                            cargo_candidate = composite[3]
                        if cargo_candidate:
                            current_item["cargoType"] = str(cargo_candidate).split(":")[0]

                    # Also check simple numeric qty element (e.g., ['10','1'])
                    # Look for a non-list first element containing digits
                    for el in elements:
                        if isinstance(el, list):
                            # if it's a simple composite like ['10','1']
                            if len(el) >= 1 and isinstance(el[0], str) and el[0].isdigit() and not current_item.get("numberOfPackages"):
                                try:
                                    current_item["numberOfPackages"] = int(el[0])
                                except (ValueError, TypeError):
                                    pass
                        elif isinstance(el, str) and el.isdigit() and not current_item.get("numberOfPackages"):
                            try:
                                current_item["numberOfPackages"] = int(el)
                            except (ValueError, TypeError):
                                pass

            if tag == "RFF":
                # RFF segment: references
                # Elements are a list of strings like ['AAQ:CNT123']
                elements = segment.elements
                
                if isinstance(elements, list):
                    for element in elements:
                        # element may be a list like ['AAQ','CNT123'] or a string 'AAQ:CNT123'
                        if isinstance(element, list) and len(element) >= 2:
                            qualifier, value = element[0], element[1]
                        else:
                            element_str = str(element)
                            if ":" in element_str:
                                qualifier, value = element_str.split(":", 1)
                            else:
                                continue

                        # Map qualifier to field name
                        field_name = EdiParserService.RFF_QUALIFIER_MAP.get(qualifier)
                        if not field_name:
                            continue

                        try:
                            # Unescape and validate text value
                            unescaped_value = EdiParserService._unescape_text(str(value))
                            validated_value = EdiParserService._validate_text_value(unescaped_value)
                            current_item[field_name] = validated_value
                        except ValueError as e:
                            # Log error and skip this RFF value
                            raise ValueError(f"Invalid RFF segment {qualifier}: {str(e)}")

        if current_item:
            cargo_items.append(current_item)

        # Validate items using Pydantic
        parsed_items: list[CargoItemBase] = []
        for item in cargo_items:
            if item["cargoType"] and item["numberOfPackages"]:
                try:
                    validated_item = CargoItemBase.model_validate(item)
                    parsed_items.append(validated_item)
                except ValidationError:
                    # Skip invalid items
                    continue

        return parsed_items
