from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator


class CargoType(str, Enum):
    FCX = "FCX"
    LCL = "LCL"
    FCL = "FCL"


class RffType(str, Enum):
    AAQ = "AAQ"
    MB = "MB"
    BH = "BH"


class CargoItemBase(BaseModel):
    cargoType: CargoType
    numberOfPackages: int = Field(..., gt=0)
    containerNumber: str | None = None
    masterBlNumber: str | None = None
    houseBlNumber: str | None = None

    model_config = ConfigDict(extra="allow")

    @staticmethod
    def _validate_text_field(value: str | None) -> str | None:
        """Validate RFF text fields: ASCII 32-126 except [ (91) and ] (93)"""
        if value is None:
            return value
        
        for char in value:
            char_code = ord(char)
            if not (32 <= char_code <= 126) or char_code in (91, 93):
                raise ValueError(
                    f"Invalid character '{char}' (ASCII {char_code}). "
                    f"Allowed: ASCII 32-126 except [ (91) and ] (93)."
                )
        return value

    @field_validator("containerNumber", "masterBlNumber", "houseBlNumber", mode="before")
    def validate_text_fields(cls, value: str | None) -> str | None:
        if value is None:
            return value
        trimmed = value.strip() or None
        if trimmed:
            return CargoItemBase._validate_text_field(trimmed)
        return trimmed


class JsonToEdiRequest(BaseModel):
    cargoItems: list[CargoItemBase]

    model_config = ConfigDict(extra="allow")


class EdiToJsonRequest(BaseModel):
    edi: str

    model_config = ConfigDict(extra="forbid")


class ValidationResponse(BaseModel):
    valid: bool
    errors: list[str] = []
    warnings: list[str] = []

    model_config = ConfigDict(extra="forbid")

class EdiDetail(BaseModel):
    warnings: list[str]

class EdiParseResponse(BaseModel):
    cargoItems: list[CargoItemBase]
    detail: EdiDetail