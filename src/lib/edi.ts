import { z } from 'zod';
import type { CargoItem } from './types';
import contract from '../../shared/edi-contract.json';

// Validator for text fields: ASCII 32-126 except [ (91) and ] (93)
const createTextFieldValidator = (maxLen: number) =>
  z
    .string()
    .max(maxLen)
    .refine(
      (value) => {
        for (let i = 0; i < value.length; i++) {
          const charCode = value.charCodeAt(i);
          if (!(charCode >= 32 && charCode <= 126) || charCode === 91 || charCode === 93) {
            return false;
          }
        }
        return true;
      },
      { message: 'Only ASCII characters 32-126 allowed (except [ and ])' }
    );

const cargoTypeOptions = contract.cargoTypes as unknown as [string, ...string[]];

export const cargoItemSchema = z.object({
  id: z.string().uuid(),
  cargoType: z.enum(cargoTypeOptions),
  numberOfPackages: z.number().int().positive(),
  containerNumber: z.string().max(64).optional(),
  masterBlNumber: z.string().max(128).optional(),
  houseBlNumber: z.string().max(128).optional(),
});

export const cargoFormSchema = cargoItemSchema.omit({ id: true }).extend({
  containerNumber: z.union([z.literal(''), createTextFieldValidator(64)]).optional(),
  masterBlNumber: z.union([z.literal(''), createTextFieldValidator(128)]).optional(),
  houseBlNumber: z.union([z.literal(''), createTextFieldValidator(128)]).optional(),
});

export const createEmptyCargoItem = (): CargoItem => ({
  id: crypto.randomUUID(),
  cargoType: contract.cargoTypes[0] as CargoItem['cargoType'],
  numberOfPackages: 1,
  containerNumber: '',
  masterBlNumber: '',
  houseBlNumber: '',
});