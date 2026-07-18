import { z } from 'zod';

export const createPickupSchema = z.object({
  rentalOrderId: z.string().uuid('Select a rental order'),
  executiveName: z.string().min(1, 'Handled by is required'),
  pickupTime: z.string().min(1, 'Pickup date & time is required'),
  odometerReading: z.coerce.number().int().nonnegative('Odometer must be ≥ 0'),
  fuelLevel: z.string().min(1, 'Fuel level is required'),
  customerVerified: z.boolean().optional(),
  remarks: z.string().optional().or(z.literal('')),
  vehicleCondition: z.string().optional().or(z.literal('')),
});

export const createReturnSchema = z.object({
  rentalOrderId: z.string().uuid('Select a rental order'),
  executiveName: z.string().min(1, 'Handled by is required'),
  returnTime: z.string().min(1, 'Return date & time is required'),
  odometerReading: z.coerce.number().int().nonnegative('Odometer must be ≥ 0'),
  fuelLevel: z.string().min(1, 'Fuel level is required'),
  vehicleCondition: z.enum(
    ['EXCELLENT', 'GOOD', 'SCRATCH', 'DENT', 'BROKEN_PART'],
    { message: 'Select vehicle condition' }
  ),
  damageCharge: z.coerce.number().nonnegative().optional(),
  lateCharge: z.coerce.number().nonnegative().optional(),
  remarks: z.string().optional().or(z.literal('')),
  customerVerified: z.boolean().optional(),
});

export const createPenaltySchema = z.object({
  rentalOrderId: z.string().uuid('Select a rental order'),
  type: z.enum(['LATE_RETURN', 'DAMAGE', 'CLEANING', 'TRAFFIC_FINE', 'OTHER'], {
    message: 'Select penalty type',
  }),
  reason: z.string().min(1, 'Reason is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  status: z.enum(['UNPAID', 'PAID']).optional(),
});

export const updatePenaltySchema = z.object({
  type: z.enum(['LATE_RETURN', 'DAMAGE', 'CLEANING', 'TRAFFIC_FINE', 'OTHER']).optional(),
  reason: z.string().min(1).optional(),
  amount: z.coerce.number().positive().optional(),
  status: z.enum(['UNPAID', 'PAID']).optional(),
});
