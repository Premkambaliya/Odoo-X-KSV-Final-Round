'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import FuelIndicator from '@/components/operations/FuelIndicator';
import SignaturePlaceholder from '@/components/operations/SignaturePlaceholder';
import rentalService from '@/services/rentalService';
import pickupService from '@/services/pickupService';
import { createReturnSchema } from '@/lib/validations/operations';
import {
  FUEL_LEVEL_OPTIONS,
  VEHICLE_CONDITION_OPTIONS,
  localDateTimeToIso,
  nowLocalDateTime,
} from '@/lib/operations';
import { customerName, vehicleLabel, formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function ReturnForm({
  defaultValues,
  defaultExecutiveName = '',
  onSubmit,
  loading = false,
}) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createReturnSchema),
    defaultValues: {
      rentalOrderId: '',
      executiveName: defaultExecutiveName,
      returnTime: nowLocalDateTime(),
      odometerReading: '',
      fuelLevel: '100%',
      vehicleCondition: 'GOOD',
      damageCharge: 0,
      lateCharge: 0,
      remarks: '',
      customerVerified: false,
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
          status: 'ACTIVE',
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
      setPickup(null);
      return;
    }
    let active = true;
    async function loadOrder() {
      try {
        const result = await rentalService.getRentalOrderById(rentalOrderId);
        if (!active) return;
        const order = result.data;
        setSelectedOrder(order);
        if (order?.bookingNumber) {
          const pickups = await pickupService.getPickups({
            orderNumber: order.bookingNumber,
            limit: 1,
            page: 1,
          });
          if (!active) return;
          setPickup(pickups.data?.pickups?.[0] || null);
        }
      } catch (err) {
        notify.error(getErrorMessage(err));
      }
    }
    loadOrder();
    return () => {
      active = false;
    };
  }, [rentalOrderId]);

  function submit(values) {
    const payload = {
      rentalOrderId: values.rentalOrderId,
      executiveName: values.executiveName,
      returnTime: localDateTimeToIso(values.returnTime),
      odometerReading: Number(values.odometerReading),
      fuelLevel: values.fuelLevel,
      vehicleCondition: values.vehicleCondition,
    };
    if (values.damageCharge !== '' && values.damageCharge != null) {
      payload.damageCharge = Number(values.damageCharge);
    }
    if (values.lateCharge !== '' && values.lateCharge != null) {
      payload.lateCharge = Number(values.lateCharge);
    }
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
              loadingOrders ? 'Loading active rentals…' : 'Select active rental'
            }
            error={errors.rentalOrderId?.message}
            disabled={loadingOrders || Boolean(defaultValues?.rentalOrderId)}
            {...field}
          />
        )}
      />

      {selectedOrder ? (
        <div className="space-y-3 rounded-2xl border border-border bg-slate-50/80 px-4 py-3 text-sm">
          <p className="font-medium text-primary">
            {customerName(selectedOrder.customer)}
          </p>
          <p className="text-muted">{vehicleLabel(selectedOrder.rentalItems)}</p>
          <p className="text-xs text-muted">
            Expected return {formatDateTime(selectedOrder.expectedReturnDate)}
          </p>
          {pickup ? (
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                Pickup summary
              </p>
              <p className="text-xs text-muted">
                {formatDateTime(pickup.pickupTime)} · Odo{' '}
                {pickup.odometerReading?.toLocaleString('en-IN')} km
              </p>
              <FuelIndicator className="mt-2" fuelLevel={pickup.fuelLevel} label="Pickup fuel" />
            </div>
          ) : null}
        </div>
      ) : null}

      <Input
        label="Handled by"
        required
        error={errors.executiveName?.message}
        {...register('executiveName')}
      />

      <Input
        label="Return date & time"
        type="datetime-local"
        required
        error={errors.returnTime?.message}
        {...register('returnTime')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Return odometer (km)"
          type="number"
          min="0"
          step="1"
          required
          hint={
            pickup
              ? `Pickup was ${pickup.odometerReading?.toLocaleString('en-IN')} km`
              : undefined
          }
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
            label="Vehicle condition"
            required
            options={VEHICLE_CONDITION_OPTIONS}
            error={errors.vehicleCondition?.message}
            {...field}
          />
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Damage charge"
          type="number"
          min="0"
          step="0.01"
          error={errors.damageCharge?.message}
          {...register('damageCharge')}
        />
        <Input
          label="Late charge"
          type="number"
          min="0"
          step="0.01"
          error={errors.lateCharge?.message}
          {...register('lateCharge')}
        />
      </div>

      <Textarea
        label="Damage / additional notes"
        placeholder="Describe damage, missing items, or other observations…"
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
            label="Customer acknowledged return condition"
          />
        )}
      />

      <p className="text-xs text-muted">
        Return image uploads are not supported by the return API. Completing
        return sets the rental to COMPLETED and releases vehicles.
      </p>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          Complete return
        </Button>
      </div>
    </form>
  );
}
