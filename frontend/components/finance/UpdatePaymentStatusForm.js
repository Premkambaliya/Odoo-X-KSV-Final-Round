'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { updatePaymentStatusSchema } from '@/lib/validations/finance';
import { PAYMENT_STATUS_OPTIONS } from '@/lib/finance';

export default function UpdatePaymentStatusForm({
  defaultStatus,
  onSubmit,
  loading = false,
}) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updatePaymentStatusSchema),
    defaultValues: {
      status: defaultStatus || 'SUCCESS',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="surface-card space-y-5 p-6 sm:p-8"
      noValidate
    >
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            label="Payment status"
            required
            options={PAYMENT_STATUS_OPTIONS}
            error={errors.status?.message}
            {...field}
          />
        )}
      />
      <p className="text-xs text-muted">
        Updating status recalculates the rental order payment status on the
        backend.
      </p>
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Update status
        </Button>
      </div>
    </form>
  );
}
