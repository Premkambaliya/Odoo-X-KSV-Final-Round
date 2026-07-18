'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import rentalService from '@/services/rentalService';
import { createDepositSchema } from '@/lib/validations/finance';
import { customerName, formatCurrency, vehicleLabel } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function DepositForm({
  defaultValues,
  onSubmit,
  loading = false,
  submitLabel = 'Collect deposit',
}) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createDepositSchema),
    defaultValues: {
      rentalOrderId: '',
      amountCollected: '',
      reason: '',
      ...defaultValues,
    },
  });

  const rentalOrderId = watch('rentalOrderId');

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const result = await rentalService.getRentalOrders({
          page: 1,
          limit: 50,
          sortBy: 'createdAt',
          order: 'desc',
        });
        if (!active) return;
        setOrders(result.data?.orders || []);
      } catch (err) {
        notify.error(getErrorMessage(err));
      } finally {
        if (active) setLoadingOrders(false);
      }
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!rentalOrderId) {
      setSelectedOrder(null);
      return;
    }
    let active = true;
    async function loadOrder() {
      try {
        const result = await rentalService.getRentalOrderById(rentalOrderId);
        if (!active) return;
        const order = result.data;
        setSelectedOrder(order);
        if (order?.securityDeposit != null) {
          setValue('amountCollected', Number(order.securityDeposit));
        }
      } catch (err) {
        notify.error(getErrorMessage(err));
      }
    }
    loadOrder();
    return () => {
      active = false;
    };
  }, [rentalOrderId, setValue]);

  const orderOptions = orders.map((order) => ({
    value: order.id,
    label: `${order.bookingNumber} · ${customerName(order.customer)}`,
  }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="surface-card mx-auto max-w-xl space-y-5 p-6 sm:p-8"
      noValidate
    >
      <Controller
        name="rentalOrderId"
        control={control}
        render={({ field }) => (
          <Select
            label="Rental order"
            required
            options={orderOptions}
            placeholder={loadingOrders ? 'Loading rentals…' : 'Select rental'}
            error={errors.rentalOrderId?.message}
            disabled={loadingOrders || Boolean(defaultValues?.rentalOrderId)}
            {...field}
          />
        )}
      />

      {selectedOrder ? (
        <div className="rounded-2xl border border-border bg-slate-50/80 px-4 py-3 text-sm">
          <p className="font-medium text-primary">
            {customerName(selectedOrder.customer)}
          </p>
          <p className="mt-1 text-muted">
            {vehicleLabel(selectedOrder.rentalItems)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Required deposit:{' '}
            {formatCurrency(selectedOrder.securityDeposit)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-secondary">
            This records a deposit hold/ledger against the booking. The deposit
            amount is already included in the rental grand total — collecting
            here does not charge it a second time.
          </p>
        </div>
      ) : null}

      <Input
        label="Amount collected"
        type="number"
        step="0.01"
        min="0"
        required
        error={errors.amountCollected?.message}
        {...register('amountCollected')}
      />

      <Textarea
        label="Reason / notes"
        placeholder="Optional reason for this deposit"
        error={errors.reason?.message}
        {...register('reason')}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
