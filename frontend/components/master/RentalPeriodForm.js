'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Switch from '@/components/ui/Switch';
import Button from '@/components/ui/Button';
import { rentalPeriodSchema } from '@/lib/validations/masterData';

export default function RentalPeriodForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Period',
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rentalPeriodSchema),
    defaultValues: {
      name: '',
      days: 1,
      description: '',
      status: true,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface-card space-y-5 p-6 sm:p-8" noValidate>
      <Input
        label="Name"
        required
        placeholder="e.g. Weekly"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Days"
        type="number"
        required
        min={1}
        error={errors.days?.message}
        {...register('days')}
      />
      <Textarea
        label="Description"
        placeholder="Optional notes about this rental period"
        error={errors.description?.message}
        {...register('description')}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Switch
            label={field.value ? 'Active' : 'Inactive'}
            checked={Boolean(field.value)}
            onChange={field.onChange}
          />
        )}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
