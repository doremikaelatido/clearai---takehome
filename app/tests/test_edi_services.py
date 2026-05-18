from app.schemas.edi import CargoItemBase
from app.services.edi_generator_service import EdiGeneratorService
from app.services.edi_parser_service import EdiParserService


def test_edi_generation_and_parse(client):
    auth_response = client.post(
        "api/auth/register",
        json={"email": "edi@example.com", "password": "StrongPassword1"},
    )
    token = auth_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "cargoItems": [
            {
                "cargoType": "FCX",
                "numberOfPackages": 12,
                "containerNumber": "CONT123",
                "masterBlNumber": "MBL456",
                "houseBlNumber": "HBL789",
            }
        ]
    }

    json_to_edi = client.post("/api/edi/json-to-edi", json=payload, headers=headers)
    assert json_to_edi.status_code == 200
    edi_text = json_to_edi.json()["edi"]
    assert "LIN+1+I'" in edi_text
    assert "PAC+++FCX:67:95'" in edi_text
    assert "RFF+AAQ:CONT123'" in edi_text

    parse_response = client.post("/api/edi/edi-to-json", json={"edi": edi_text}, headers=headers)
    assert parse_response.status_code == 200
    parsed = parse_response.json()["cargoItems"]
    assert parsed[0]["cargoType"] == "FCX"
    assert parsed[0]["numberOfPackages"] == 12


def test_direct_edi_service():
    item = CargoItemBase(
        cargoType="LCL",
        numberOfPackages=3,
        containerNumber="CONT321",
    )
    edi_string = EdiGeneratorService.generate_edi([item])
    parsed_items = EdiParserService.parse_edi(edi_string)

    assert parsed_items[0].cargoType == "LCL"
    assert parsed_items[0].numberOfPackages == 3
    assert parsed_items[0].containerNumber == "CONT321"
