'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { refundDepositSchema } from '@/lib/validations/finance';
import { remainingDeposit } from '@/lib/finance';
import { formatCurrency } from '@/lib/format';

export default function RefundDepositForm({
  deposit,
  onSubmit,
  loading = false,
}) {
  const remaining = remainingDeposit(deposit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(refundDepositSchema),
    defaultValues: {
      amountToRefund: remaining > 0 ? remaining : '',
      damageCost: 0,
      reason: '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="surface-card space-y-5 p-6 sm:p-8"
      noValidate
    >
      <div className="rounded-2xl border border-border bg-slate-50/80 px-4 py-3 text-sm">
        <p className="text-muted">Available to refund</p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
          {formatCurrency(remaining)}
        </p>
        <p className="mt-1 text-xs text-muted">
          Collected {formatCurrency(deposit?.amountCollected)} · Already refunded{' '}
          {formatCurrency(deposit?.amountRefunded)} · Damage{' '}
          {formatCurrency(deposit?.damageCost)}
        </p>
      </div>

      <Input
        label="Amount to refund"
        type="number"
        step="0.01"
        min="0"
        required
        error={errors.amountToRefund?.message}
        {...register('amountToRefund')}
      />

      <Input
        label="Damage cost (optional)"
        type="number"
        step="0.01"
        min="0"
        error={errors.damageCost?.message}
        {...register('damageCost')}
      />

      <Textarea
        label="Reason"
        placeholder="Reason for refund or damage deduction"
        error={errors.reason?.message}
        {...register('reason')}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} disabled={remaining <= 0}>
          Process refund
        </Button>
      </div>
    </form>
  );
}
