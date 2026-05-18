import contract from '../../shared/edi-contract.json';

export type CargoType = (typeof contract.cargoTypes)[number];

export interface CargoItem {
  id: string;
  cargoType: CargoType;
  numberOfPackages: number;
  containerNumber?: string;
  masterBlNumber?: string;
  houseBlNumber?: string;
}

export interface DecodedEdiItem {
  id: string;
  cargoType: CargoType;
  numberOfPackages: number;
  containerNumber?: string;
  masterBlNumber?: string;
  houseBlNumber?: string;
}
