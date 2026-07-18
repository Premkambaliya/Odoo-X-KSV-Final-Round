'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import SignaturePlaceholder from '@/components/operations/SignaturePlaceholder';
import rentalService from '@/services/rentalService';
import { createPickupSchema } from '@/lib/validations/operations';
import {
  FUEL_LEVEL_OPTIONS,
  VEHICLE_CONDITION_OPTIONS,
  localDateTimeToIso,
  nowLocalDateTime,
} from '@/lib/operations';
import { customerName, vehicleLabel, formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function PickupForm({
  defaultValues,
  defaultExecutiveName = '',
  onSubmit,
  loading = false,
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
    resolver: zodResolver(createPickupSchema),
    defaultValues: {
      rentalOrderId: '',
      executiveName: defaultExecutiveName,
      pickupTime: nowLocalDateTime(),
      odometerReading: '',
      fuelLevel: '100%',
      customerVerified: false,
      remarks: '',
      vehicleCondition: 'GOOD',
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
          status: 'CONFIRMED',
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
      executiveName: values.executiveName,
      pickupTime: localDateTimeToIso(values.pickupTime),
      odometerReading: Number(values.odometerReading),
      fuelLevel: values.fuelLevel,
      customerVerified: Boolean(values.customerVerified),
    };
    if (values.remarks) payload.remarks = values.remarks;
    return onSubmit(payload);
  }

  const orderOptions = orders.map((o) => ({
    value: o.id,
    label: `${o.bookingNumber} · ${customerName(o.customer)}`,
  }));

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="surface-card mx-auto max-w-2xl space-y-5 p-6 sm:p-8"
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
            placeholder={
              loadingOrders ? 'Loading confirmed rentals…' : 'Select confirmed rental'
            }
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
            Scheduled pickup {formatDateTime(selectedOrder.pickupDate)}
          </p>
        </div>
      ) : null}

      <Input
        label="Handled by"
        required
        placeholder="Executive name"
        error={errors.executiveName?.message}
        {...register('executiveName')}
      />

      <Input
        label="Pickup date & time"
        type="datetime-local"
        required
        error={errors.pickupTime?.message}
        {...register('pickupTime')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Current odometer (km)"
          type="number"
          min="0"
          step="1"
          required
          error={errors.odometerReading?.message}
          {...register('odometerReading')}
        />
        <Controller
          name="fuelLevel"
          control={control}
          render={({ field }) => (
            <Select
              label="Fuel level"
              required
              options={FUEL_LEVEL_OPTIONS}
              error={errors.fuelLevel?.message}
              {...field}
            />
          )}
        />
      </div>

      <Controller
        name="vehicleCondition"
        control={control}
        render={({ field }) => (
          <Select
            label="Vehicle condition (inspection note)"
            options={VEHICLE_CONDITION_OPTIONS}
            hint="Stored in notes context only — pickup API does not persist condition."
            {...field}
          />
        )}
      />

      <Textarea
        label="Pickup notes"
        placeholder="Condition notes, accessories, observations…"
        error={errors.remarks?.message}
        {...register('remarks')}
      />

      <Controller
        name="customerVerified"
        control={control}
        render={({ field }) => (
          <SignaturePlaceholder
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <p className="text-xs text-muted">
        Inspection image uploads are not supported by the pickup API.
      </p>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          Complete pickup
        </Button>
      </div>
    </form>
  );
}
