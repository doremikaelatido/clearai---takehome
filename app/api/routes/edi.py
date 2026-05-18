from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.schemas.edi import EdiParseResponse, EdiToJsonRequest, JsonToEdiRequest, ValidationResponse
from app.services.edi_generator_service import EdiGeneratorService
from app.services.edi_parser_service import EdiParserService
from app.services.validation_service import ValidationService

router = APIRouter(prefix="/edi", tags=["edi"], dependencies=[Depends(get_current_user)])


@router.post("/json-to-edi")
def json_to_edi(request: JsonToEdiRequest, db: Session = Depends(get_db)):
    valid, errors, warnings, items = ValidationService.validate_json(request.model_dump())
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": errors, "warnings": warnings},
        )

    edi_result = EdiGeneratorService.generate_edi(items)
    return {"edi": edi_result}


@router.post("/edi-to-json", response_model=EdiParseResponse)
def edi_to_json(request: EdiToJsonRequest):
    valid, errors, warnings = ValidationService.validate_edi(request.edi)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": errors, "warnings": warnings},
        )

    parsed_items = EdiParserService.parse_edi(request.edi)
    if not parsed_items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to parse any valid cargo items from EDI payload",
        )

    return EdiParseResponse(cargoItems=parsed_items, detail={"warnings": warnings})


@router.post("/validate-edi", response_model=ValidationResponse)
def validate_edi(request: EdiToJsonRequest):
    valid, errors, warnings = ValidationService.validate_edi(request.edi)
    return ValidationResponse(valid=valid, errors=errors, warnings=warnings)


@router.post("/validate-json", response_model=ValidationResponse)
def validate_json(request: JsonToEdiRequest):
    valid, errors, warnings, _ = ValidationService.validate_json(request.model_dump())
    return ValidationResponse(valid=valid, errors=errors, warnings=warnings)
