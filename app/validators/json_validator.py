from typing import Any

from pydantic import ValidationError

from app.schemas.edi import CargoItemBase, CargoType


def validate_json_payload(payload: dict[str, Any]) -> tuple[bool, list[str], list[str], list[dict[str, Any]]]:
    errors: list[str] = []
    warnings: list[str] = []
    cargo_items: list[dict[str, Any]] = []

    if not isinstance(payload, dict):
        return False, ["Payload must be a JSON object"], warnings, []

    if "cargoItems" not in payload:
        return False, ["Missing required field: cargoItems"], warnings, []

    if not isinstance(payload["cargoItems"], list):
        return False, ["cargoItems must be an array"], warnings, []

    for index, item in enumerate(payload["cargoItems"], start=1):
        if not isinstance(item, dict):
            errors.append(f"cargoItems[{index}] must be an object")
            continue

        extra_fields = [key for key in item.keys() if key not in CargoItemBase.model_fields]
        for extra in extra_fields:
            warnings.append(f"Unexpected field: {extra}")

        try:
            validated = CargoItemBase.model_validate(item)
            cargo_items.append(validated.model_dump())
        except ValidationError as exc:
            for error in exc.errors():
                field = error.get("loc", ["unknown"])[0]
                message = error.get("msg", "Invalid value")
                errors.append(f"cargoItems[{index}].{field}: {message}")

        cargo_type = item.get("cargoType")
        if cargo_type and cargo_type not in CargoType._value2member_map_:
            errors.append(f"cargoItems[{index}].cargoType: invalid cargo type")

    return len(errors) == 0, errors, warnings, cargo_items
