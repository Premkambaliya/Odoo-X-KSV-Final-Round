import { z } from 'zod';
import { VEHICLE_AVAILABILITY } from '@/constants/masterData';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  status: z.boolean().optional(),
});

export const rentalPeriodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  days: z.coerce.number().int().positive('Days must be greater than 0'),
  description: z.string().optional().or(z.literal('')),
  status: z.boolean().optional(),
});

export const vehicleSchema = z.object({
  categoryId: z.string().uuid('Select a valid category'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  variant: z.string().optional().or(z.literal('')),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  vin: z.string().min(1, 'VIN is required'),
  year: z.coerce.number().int().min(1900, 'Enter a valid year'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  color: z.string().min(1, 'Color is required'),
  seatCapacity: z.coerce.number().int().positive('Seat capacity must be positive'),
  mileage: z.coerce.number().nonnegative('Mileage cannot be negative'),
  description: z.string().optional().or(z.literal('')),
  basePrice: z.coerce.number().positive('Base price must be positive'),
  securityDeposit: z.coerce.number().nonnegative('Security deposit cannot be negative'),
  availabilityStatus: z.enum([
    VEHICLE_AVAILABILITY.AVAILABLE,
    VEHICLE_AVAILABILITY.BOOKED,
    VEHICLE_AVAILABILITY.UNDER_MAINTENANCE,
    VEHICLE_AVAILABILITY.OUT_OF_SERVICE,
  ]),
  currentStatus: z.string().optional().or(z.literal('')),
});

export const priceListSchema = z
  .object({
    vehicleId: z.string().uuid('Select a vehicle'),
    pricingType: z.string().min(1, 'Pricing type is required'),
    price: z.coerce.number().positive('Price must be positive'),
    validFrom: z.string().optional().or(z.literal('')),
    validTo: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.validFrom || !data.validTo) return true;
      return new Date(data.validFrom) <= new Date(data.validTo);
    },
    { message: 'validFrom must be before or equal to validTo', path: ['validTo'] }
  );
