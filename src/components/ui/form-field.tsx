import { Controller, FieldValues, Path, Control } from 'react-hook-form';
import { Input } from './input';
import { Select } from './select';
import { Label } from './label';

export interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: 'text' | 'number' | 'email' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  maxLength?: number;
  colSpan?: number;
  inputFilter?: (value: string) => string;
}

interface FormFieldProps<T extends FieldValues> {
  config: FormFieldConfig<T>;
  control: Control<T>;
  error?: string;
}

export function FormField<T extends FieldValues>({ config, control, error }: FormFieldProps<T>) {
  const colSpanClass = config.colSpan === 1 ? 'col-span-1' : 'col-span-2';

  return (
    <div className={colSpanClass}>
      <Label htmlFor={config.name}>
        {config.label}
        {config.required && <span className="text-red-700">*</span>}
      </Label>

      <Controller
        name={config.name}
        control={control}
        render={({ field }) => {
          if (config.type === 'select') {
            return (
              <Select
                id={config.name}
                {...field}
                value={field.value || ''}
                className={error ? 'ring-2 ring-red-300/50' : ''}
              >
                {config.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            );
          }

          if (config.type === 'number') {
            return (
              <Input
                id={config.name}
                type="number"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                min={config.min}
                max={config.max}
                className={error ? 'ring-2 ring-red-300/50' : ''}
              />
            );
          }

          return (
            <Input
              id={config.name}
              type={config.type}
              {...field}
              value={field.value || ''}
              placeholder={config.placeholder}
              maxLength={config.maxLength}
              onChange={(e) => {
                let value = e.target.value;
                if (config.inputFilter) {
                  value = config.inputFilter(value);
                }
                field.onChange(value);
              }}
              className={error ? 'ring-2 ring-red-300/50' : ''}
            />
          );
        }}
      />

      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
