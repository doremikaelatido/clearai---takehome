import pytest

from app.services.edi_parser_service import EdiParserService


def test_parser_basic_parse():
    # Arrange
    raw = "LIN+1'PAC+++FCX:1:20'RFF+MB:BL123456'EQD+CN+MSKU1234567'FTX+AA+++Fragile'"

    # Act
    parsed = EdiParserService.parse_edi(raw)

    # Assert
    assert isinstance(parsed, list)
    assert len(parsed) >= 1
    item = parsed[0]
    # master BL number should be populated from RFF+MB
    assert getattr(item, 'masterBlNumber', None) == 'BL123456' or item.masterBlNumber == 'BL123456'
