import { useCallback, useState } from 'react';
import { validateJson as validateJsonService } from '../services/ediService';
import type { CargoItem, ValidateJsonResult } from '../types/edi';
import { ApiError } from '../lib/api';

export function useValidateJson() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ValidateJsonResult | null>(null);

  const validate = useCallback(async (items: CargoItem[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await validateJsonService(items);
      setResult(res);
      return res;
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError(String(e));
      setResult(null);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { validate, loading, error, result } as const;
}

export default useValidateJson;
