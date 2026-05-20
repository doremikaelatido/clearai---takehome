from dataclasses import dataclass, field

@dataclass
class ValidationResult:
    valid: bool = True
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    cleaned_edi: str = ""
    items: list[dict[str, any]] = field(default_factory=list)