import { z } from 'zod';

export const categorySchema = z.object({
  categoryName: z.string().min(1, 'Category Name is required'),
  vehicleType: z.enum(['Two_Wheeler', 'Four_Wheeler']),
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
  rentPerHour: z.coerce.number().positive('Hourly rate must be positive'),
  rentPerDay: z.coerce.number().positive('Daily rate must be positive'),
  rentPerWeek: z.coerce.number().positive('Weekly rate must be positive'),
  rentPerMonth: z.coerce.number().positive('Monthly rate must be positive'),
  securityDeposit: z.coerce.number().nonnegative('Security deposit cannot be negative'),
  engineCapacity: z.string().min(1, 'Engine capacity is required'),
  currentOdometer: z.coerce.number().nonnegative('Current odometer is required'),
  status: z.enum(['Available', 'Reserved', 'Rented', 'Maintenance']),
  currentStatus: z.string().optional().or(z.literal('')),
});
