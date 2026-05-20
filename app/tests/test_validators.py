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

    validation = validate_json_payload(payload)
    assert validation.valid
    assert not validation.errors
    assert "Unexpected field: extraField" in validation.warnings
    assert validation.items[0]["cargoType"] == "FCL"


def test_validate_edi_string_detects_missing_segments():
    validation = validate_edi_string("PAC+++FCX:67:95'PAC+2+1'")
    assert "Missing LIN segment" in validation.errors
    # Note: RFF is not required, only LIN and PAC are mandatory
