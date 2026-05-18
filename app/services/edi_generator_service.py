from app.schemas.edi import CargoItemBase, RffType


class EdiGeneratorService:
    @staticmethod
    def generate_edi(cargo_items: list[CargoItemBase]) -> str:
        def normalize_values(value: str) -> str:
            # Escape the 's inside the value
            return value.replace("'", "?'")
    
        # Validate cargo items before processing
        if not cargo_items or not all(isinstance(item, CargoItemBase) for item in cargo_items):
            raise ValueError("Invalid cargo items: must provide non-empty list of CargoItemBase objects")

        segments: list[str] = []

        for index, item in enumerate(cargo_items, start=1):
            # LIN segment: Line item number
            segments.append(f"LIN+{index}+I'")

            # PAC segment: Packaging - cargo type with UOM codes
            cargo_type_value = item.cargoType.value if hasattr(item.cargoType, "value") else str(item.cargoType)
            segments.append(f"PAC+++{cargo_type_value}:67:95'")

            # PAC segment: Number of packages
            segments.append(f"PAC+{item.numberOfPackages}+1'")

            # RFF segments: References (optional)
            if item.containerNumber:
                segments.append("PCI+1'")
                segments.append(f"RFF+{RffType.AAQ.value}:{normalize_values(item.containerNumber)}'")

            if item.masterBlNumber:
                segments.append(f"PCI+1'")
                segments.append(f"RFF+{RffType.MB.value}:{normalize_values(item.masterBlNumber)}'")

            if item.houseBlNumber:
                segments.append(f"PCI+1'")
                segments.append(f"RFF+{RffType.BH.value}:{normalize_values(item.houseBlNumber)}'")

        return "\n".join(segments)
