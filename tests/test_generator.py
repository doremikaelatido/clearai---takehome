import pytest

from app.services.edi_generator_service import EdiGeneratorService
from app.schemas.edi import CargoItemBase


def test_generator_basic():
    # Arrange - create a validated CargoItemBase instance
    item = CargoItemBase.model_validate({
        "cargoType": "FCX",
        "numberOfPackages": 1,
        "containerNumber": "MSKU1234567",
    })

    # Act
    edi = EdiGeneratorService.generate_edi([item])

    # Assert
    assert isinstance(edi, str)
    assert "LIN+1" in edi
    assert "MSKU1234567" in edi
