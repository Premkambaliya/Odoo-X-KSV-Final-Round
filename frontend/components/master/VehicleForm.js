'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { vehicleSchema } from '@/lib/validations/masterData';
import {
  AVAILABILITY_OPTIONS,
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  VEHICLE_AVAILABILITY,
} from '@/constants/masterData';

export default function VehicleForm({
  defaultValues,
  categories = [],
  onSubmit,
  submitLabel = 'Save Vehicle',
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      categoryId: '',
      brand: '',
      model: '',
      variant: '',
      registrationNumber: '',
      vin: '',
      year: new Date().getFullYear(),
      fuelType: '',
      transmission: '',
      color: '',
      seatCapacity: 5,
      mileage: 0,
      description: '',
      basePrice: '',
      securityDeposit: '',
      availabilityStatus: VEHICLE_AVAILABILITY.AVAILABLE,
      currentStatus: '',
      ...defaultValues,
    },
  });

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="surface-card space-y-6 p-6 sm:p-8"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Category"
          required
          options={categoryOptions}
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />
        <Select
          label="Availability"
          required
          options={AVAILABILITY_OPTIONS}
          error={errors.availabilityStatus?.message}
          {...register('availabilityStatus')}
        />
        <Input
          label="Brand"
          required
          error={errors.brand?.message}
          {...register('brand')}
        />
        <Input
          label="Model"
          required
          error={errors.model?.message}
          {...register('model')}
        />
        <Input
          label="Variant"
          error={errors.variant?.message}
          {...register('variant')}
        />
        <Input
          label="Year"
          type="number"
          required
          error={errors.year?.message}
          {...register('year')}
        />
        <Input
          label="Registration Number"
          required
          error={errors.registrationNumber?.message}
          {...register('registrationNumber')}
        />
        <Input
          label="VIN"
          required
          error={errors.vin?.message}
          {...register('vin')}
        />
        <Select
          label="Fuel Type"
          required
          options={FUEL_OPTIONS}
          error={errors.fuelType?.message}
          {...register('fuelType')}
        />
        <Select
          label="Transmission"
          required
          options={TRANSMISSION_OPTIONS}
          error={errors.transmission?.message}
          {...register('transmission')}
        />
        <Input
          label="Color"
          required
          error={errors.color?.message}
          {...register('color')}
        />
        <Input
          label="Seat Capacity"
          type="number"
          required
          error={errors.seatCapacity?.message}
          {...register('seatCapacity')}
        />
        <Input
          label="Mileage"
          type="number"
          step="0.1"
          required
          error={errors.mileage?.message}
          {...register('mileage')}
        />
        <Input
          label="Base Price"
          type="number"
          step="0.01"
          required
          error={errors.basePrice?.message}
          {...register('basePrice')}
        />
        <Input
          label="Security Deposit"
          type="number"
          step="0.01"
          required
          error={errors.securityDeposit?.message}
          {...register('securityDeposit')}
        />
        <Input
          label="Current Status"
          placeholder="Optional operational note"
          error={errors.currentStatus?.message}
          {...register('currentStatus')}
        />
      </div>

      <Textarea
        label="Description"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
