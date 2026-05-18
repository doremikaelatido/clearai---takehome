import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FormField, FormFieldConfig } from './ui/form-field';
import { cargoFormSchema } from '@/lib/edi';
import type { CargoItem, CargoType } from '@/lib/types';
import type { FieldValues } from 'react-hook-form';

interface CargoFormProps {
  creatingMode: boolean;
  item: CargoItem | null;
  onSave: (item: CargoItem) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface CargoFormFields extends FieldValues {
  cargoType: CargoType;
  numberOfPackages: number;
  containerNumber: string;
  masterBlNumber: string;
  houseBlNumber: string;
}

// Filter for text fields: allow only ASCII 32-126 except [ (91) and ] (93)
const filterAllowedChars = (value: string): string => {
  return Array.from(value)
    .filter((char) => {
      const charCode = char.charCodeAt(0);
      return (charCode >= 32 && charCode <= 126) && charCode !== 91 && charCode !== 93;
    })
    .join('');
};

const formFieldsConfig: FormFieldConfig<CargoFormFields>[] = [
  {
    name: 'cargoType',
    label: 'Cargo Type',
    type: 'select',
    required: true,
    colSpan: 1,
    options: [
      { value: 'FCX', label: 'FCX' },
      { value: 'LCL', label: 'LCL' },
      { value: 'FCL', label: 'FCL' },
    ],
  },
  {
    name: 'numberOfPackages',
    label: 'Number of Packages',
    type: 'number',
    required: true,
    colSpan: 1,
    min: 1,
  },
  {
    name: 'containerNumber',
    label: 'Container Number',
    type: 'text',
    colSpan: 2,
    maxLength: 64,
    inputFilter: filterAllowedChars,
  },
  {
    name: 'masterBlNumber',
    label: 'Master Bill of Lading Number',
    type: 'text',
    colSpan: 2,
    maxLength: 128,
    inputFilter: filterAllowedChars,
  },
  {
    name: 'houseBlNumber',
    label: 'House Bill of Lading Number',
    type: 'text',
    colSpan: 2,
    maxLength: 128,
    inputFilter: filterAllowedChars,
  },
];

/**
 * Reusable form component for editing a single cargo item.
 * Uses React Hook Form + Zod for validation with Controller for proper state management.
 */
export default function CargoForm({
  creatingMode,
  item,
  onSave,
  onCancel,
  isSubmitting = false,
}: CargoFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CargoFormFields>({
    resolver: zodResolver(cargoFormSchema),
    mode: 'onChange',
    defaultValues: {
      cargoType: item?.cargoType || 'FCX',
      numberOfPackages: item?.numberOfPackages || 1,
      containerNumber: item?.containerNumber || '',
      masterBlNumber: item?.masterBlNumber || '',
      houseBlNumber: item?.houseBlNumber || '',
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        cargoType: item.cargoType,
        numberOfPackages: item.numberOfPackages,
        containerNumber: item.containerNumber || '',
        masterBlNumber: item.masterBlNumber || '',
        houseBlNumber: item.houseBlNumber || '',
      });
    }
  }, [item, reset]);

  const onSubmit = (data: CargoFormFields) => {
    if (!item) return;
    onSave({
      ...item,
      cargoType: data.cargoType,
      numberOfPackages: data.numberOfPackages,
      containerNumber: data.containerNumber || '',
      masterBlNumber: data.masterBlNumber || '',
      houseBlNumber: data.houseBlNumber || '',
    });
  };

  return (
    <Card className="h-fit top-1/3 relative">
      <CardHeader>
        <CardTitle className="text-base">{creatingMode ? 'Create' : 'Edit'} Cargo Item</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-5">
          {formFieldsConfig.map((fieldConfig) => (
            <FormField
              key={fieldConfig.name}
              config={fieldConfig}
              control={control}
              error={errors[fieldConfig.name]?.message?.toString()}
            />
          ))}

          <div className="col-span-1">
            <Button variant="secondary" className="w-full" type="button" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className="col-span-1">
            <Button
              type="submit"
              className="w-full"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
