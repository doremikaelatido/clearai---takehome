from app.validators.edi_validator import validate_edi_string
from app.validators.json_validator import validate_json_payload


def test_validate_json_payload_allows_extra_fields():
    payload = {
        "cargoItems": [
            {
                "cargoType": "FCL",
                "numberOfPackages": 2,
                "containerNumber": "CONT900",
                "extraField": "unexpected",
            }
        ]
    }

    valid, errors, warnings, items = validate_json_payload(payload)
    assert valid
    assert not errors
    assert "Unexpected field: extraField" in warnings
    assert items[0]["cargoType"] == "FCL"


def test_validate_edi_string_detects_missing_segments():
    errors, warnings = validate_edi_string("PAC+++FCX:67:95'PAC+2+1'")
    assert "Missing LIN segment" in errors
    # Note: RFF is not required, only LIN and PAC are mandatory
