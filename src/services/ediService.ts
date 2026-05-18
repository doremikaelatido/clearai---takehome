import request, { api } from '../lib/api';
import type { CargoItem, ValidateJsonResult } from '../types/edi';

export async function validateJson(items: CargoItem[]): Promise<ValidateJsonResult> {
  // POST /edi/validate-json expects payload { items: CargoItem[] }
  return api.post<ValidateJsonResult>('/edi/validate-json', { items });
}

export default { validateJson };
