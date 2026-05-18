import { Button } from './ui/button';
import type { CargoItem } from '../types/edi';
import { validateJson as validateJsonService } from '../services/ediService';

interface LoadJsonButtonProps {
  onLoadJson: (items: CargoItem[], errorMessage?: string) => void;
  disabled?: boolean;
}

export function LoadJsonButton({ onLoadJson, disabled = false }: LoadJsonButtonProps) {
  const handleLoadJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let parsed: unknown;
    try {
      const content = await file.text();
      parsed = JSON.parse(content);
    } catch (err) {
      onLoadJson([], `Invalid JSON file: ${err instanceof Error ? err.message : 'Parse error'}`);
      event.target.value = '';
      return;
    }

    try {
      // Determine items array from common shapes: { cargoItems: [...] } or { items: [...] } or an array
      let items: any[] = [];
      if (Array.isArray(parsed)) items = parsed as any[];
      else if (parsed && typeof parsed === 'object') {
        items = (parsed as any).cargoItems ?? (parsed as any).items ?? [];
      }

      if (!Array.isArray(items)) {
        onLoadJson([], 'JSON does not contain an items array');
        event.target.value = '';
        return;
      }

      const res = await validateJsonService(items as CargoItem[]);
      if (!res || (res as any).ok === false || (res.errors && res.errors.length > 0)) {
        const errMsg = (res && (res.errors || []).join?.('; ')) || 'Backend validation failed';
        onLoadJson([], errMsg);
        event.target.value = '';
        return;
      }

      // validation passed
      onLoadJson(items as CargoItem[]);
    } catch (error) {
      onLoadJson([], error instanceof Error ? error.message : 'Failed to validate JSON');
    }

    // Reset file input for future selections
    event.target.value = '';
  };

  return (
    <label className="flex items-center">
      <input
        type="file"
        accept=".json"
        onChange={handleLoadJson}
        className="hidden"
      />
      <span
        onClick={(e) => {
          const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement;
          input?.click();
        }}
      >
        <Button
          variant="secondary"
          className="h-fit w-fit px-3 py-2 text-sm"
          disabled={disabled}
        >
          Load JSON
        </Button>
      </span>
    </label>
  );
}
