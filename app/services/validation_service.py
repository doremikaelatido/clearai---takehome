from app.schemas.edi import CargoItemBase
from app.validators.edi_validator import validate_edi_string
from app.validators.json_validator import validate_json_payload


class ValidationService:
    @staticmethod
    def validate_json(payload: dict) -> tuple[bool, list[str], list[str], list[CargoItemBase]]:
        valid, errors, warnings, items = validate_json_payload(payload)
        if not valid:
            return False, errors, warnings, []

        parsed_items = [CargoItemBase.model_validate(item) for item in items]
        return True, [], warnings, parsed_items

    @staticmethod
    def validate_edi(edi_text: str) -> tuple[bool, list[str], list[str]]:
        errors, warnings = validate_edi_string(edi_text)
        return len(errors) == 0, errors, warnings
