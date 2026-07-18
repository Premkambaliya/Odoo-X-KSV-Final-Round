'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { priceListSchema } from '@/lib/validations/masterData';
import { PRICING_TYPE_OPTIONS } from '@/constants/masterData';
import { toDateInputValue } from '@/lib/listUtils';

export default function PriceListForm({
  defaultValues,
  vehicles = [],
  onSubmit,
  submitLabel = 'Save Price',
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(priceListSchema),
    defaultValues: {
      vehicleId: '',
      pricingType: '',
      price: '',
      validFrom: '',
      validTo: '',
      ...defaultValues,
      validFrom: toDateInputValue(defaultValues?.validFrom) || defaultValues?.validFrom || '',
      validTo: toDateInputValue(defaultValues?.validTo) || defaultValues?.validTo || '',
    },
  });

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.brand} ${v.model} (${v.registrationNumber})`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface-card space-y-5 p-6 sm:p-8" noValidate>
      <Select
        label="Vehicle"
        required
        options={vehicleOptions}
        error={errors.vehicleId?.message}
        {...register('vehicleId')}
      />
      <Select
        label="Pricing Type"
        required
        options={PRICING_TYPE_OPTIONS}
        error={errors.pricingType?.message}
        {...register('pricingType')}
      />
      <Input
        label="Price"
        type="number"
        step="0.01"
        required
        error={errors.price?.message}
        {...register('price')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Valid From"
          type="date"
          error={errors.validFrom?.message}
          {...register('validFrom')}
        />
        <Input
          label="Valid To"
          type="date"
          error={errors.validTo?.message}
          {...register('validTo')}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
