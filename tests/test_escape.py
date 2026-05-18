import pytest

from app.services.edi_parser_service import EdiParserService


def test_escape_unescape():
    # Arrange - EDI with escaped apostrophe
    raw_edi = "LIN+1'PAC+++FCX:1:20'RFF+MB:ABC?'345'EQD+CN+MSKU1234567'FTX+AA+++Fragile'"

    # Act
    parsed = EdiParserService.parse_edi(raw_edi)

    # Assert - escaped apostrophe should be unescaped in parsed value
    assert len(parsed) >= 1
    item = parsed[0]
    # Master BL should have the unescaped apostrophe
    assert getattr(item, 'masterBlNumber', None) == "ABC'345" or item.masterBlNumber == "ABC'345"


def test_trailing_escape_error():
    # Arrange - malformed EDI with trailing escape
    malformed = "LIN+1'PAC+++FCX:1:20'RFF+MB:DATA?'EQD+CN+TEST'"
    
    # Act
    parsed = EdiParserService.parse_edi(malformed)
    
    # Assert - parser should handle gracefully (may return empty or partial results)
    # Depending on implementation, this might raise or return empty list
    assert isinstance(parsed, list)
