from app.models.validation_result import ValidationResult

from app.schemas.edi import CargoItemBase
from app.validators.edi_validator import validate_edi_string
from app.validators.json_validator import validate_json_payload

class ValidationService:
    @staticmethod
    def validate_json(payload: dict) -> ValidationResult:
        validation = validate_json_payload(payload)
        if not validation.valid:
            return validation

        parsed_items = [CargoItemBase.model_validate(item) for item in validation.items]
        return ValidationResult(valid=True, errors=[], warnings=validation.warnings, items=parsed_items)

    @staticmethod
    def validate_edi(edi_text: str) -> ValidationResult:
        validation = validate_edi_string(edi_text)
        return validation
