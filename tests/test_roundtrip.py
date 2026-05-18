import pytest

from app.services.edi_generator_service import EdiGeneratorService
from app.services.edi_parser_service import EdiParserService
from app.schemas.edi import CargoItemBase


def test_roundtrip_preserves_values():
    # Arrange - create original items
    original_item = CargoItemBase.model_validate({
        "cargoType": "FCX",
        "numberOfPackages": 1,
        "containerNumber": "ABC'345",  # Contains an apostrophe to test escaping
        "masterBlNumber": "BL123456",
    })

    # Act - generate EDI
    edi = EdiGeneratorService.generate_edi([original_item])
    
    # Parse back to JSON
    parsed = EdiParserService.parse_edi(edi)

    # Assert - verify semantic equivalence
    assert len(parsed) >= 1
    item = parsed[0]
    # The container number with embedded apostrophe should be preserved
    assert getattr(item, 'containerNumber', None) == "ABC'345"
    # Master BL should be preserved
    assert getattr(item, 'masterBlNumber', None) == "BL123456"
