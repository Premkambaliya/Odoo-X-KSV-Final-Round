'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import rentalService from '@/services/rentalService';
import { createPenaltySchema } from '@/lib/validations/operations';
import {
  PENALTY_TYPE_OPTIONS,
  PENALTY_STATUS_OPTIONS,
} from '@/lib/operations';
import { customerName, vehicleLabel } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function PenaltyForm({
  defaultValues,
  onSubmit,
  loading = false,
  submitLabel = 'Create penalty',
}) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPenaltySchema),
    defaultValues: {
      rentalOrderId: '',
      type: 'LATE_RETURN',
      reason: '',
      amount: '',
      status: 'UNPAID',
      ...defaultValues,
    },
  });

  const rentalOrderId = watch('rentalOrderId');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoadingOrders(true);
      try {
        const result = await rentalService.getRentalOrders({
          page: 1,
          limit: 50,
          sortBy: 'createdAt',
          order: 'desc',
        });
        if (!active) return;
        const list = (result.data?.orders || []).filter(
          (o) => o.status !== 'CANCELLED'
        );
        setOrders(list);
      } catch (err) {
        notify.error(getErrorMessage(err));
      } finally {
        if (active) setLoadingOrders(false);
      }
    }
    load();
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
    rentalService
      .getRentalOrderById(rentalOrderId)
      .then((result) => {
        if (active) setSelectedOrder(result.data);
      })
      .catch((err) => notify.error(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, [rentalOrderId]);

  function submit(values) {
    const payload = {
      rentalOrderId: values.rentalOrderId,
      type: values.type,
      reason: values.reason,
      amount: Number(values.amount),
    };
    if (values.status) payload.status = values.status;
    return onSubmit(payload);
  }

  const orderOptions = orders.map((o) => ({
    value: o.id,
    label: `${o.bookingNumber} · ${customerName(o.customer)} · ${o.status}`,
  }));

  return (
    <form
      onSubmit={handleSubmit(submit)}
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
        </div>
      ) : null}

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select
            label="Penalty type"
            required
            options={PENALTY_TYPE_OPTIONS}
            error={errors.type?.message}
            {...field}
          />
        )}
      />

      <Input
        label="Amount"
        type="number"
        min="0"
        step="0.01"
        required
        error={errors.amount?.message}
        {...register('amount')}
      />

      <Textarea
        label="Reason"
        required
        placeholder="Describe why this penalty applies…"
        error={errors.reason?.message}
        {...register('reason')}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            label="Status"
            options={PENALTY_STATUS_OPTIONS}
            error={errors.status?.message}
            {...field}
          />
        )}
      />

      <p className="text-xs text-muted">
        Creating a penalty adjusts the security deposit or order total on the
        backend. Evidence image uploads are not available via the API.
      </p>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
