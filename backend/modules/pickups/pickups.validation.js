import { z } from 'zod';

export const createPickupSchema = z.object({
  body: z.object({
    rentalOrderId: z.string().uuid('Invalid rental order ID'),
    executiveName: z.string().min(1, 'Executive name is required'),
    pickupTime: z.string().datetime(),
    odometerReading: z.number().int().nonnegative('Odometer reading must be >= 0'),
    fuelLevel: z.string().min(1, 'Fuel level is required (0-100%)'),
    customerVerified: z.boolean().optional(),
    remarks: z.string().optional()
  })
});

export const updatePickupSchema = z.object({
  body: z.object({
    executiveName: z.string().min(1).optional(),
    pickupTime: z.string().datetime().optional(),
    odometerReading: z.number().int().nonnegative().optional(),
    fuelLevel: z.string().min(1).optional(),
    customerVerified: z.boolean().optional(),
    remarks: z.string().optional()
  })
});
