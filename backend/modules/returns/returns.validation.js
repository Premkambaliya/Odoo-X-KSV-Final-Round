import { z } from 'zod';

export const createReturnSchema = z.object({
  body: z.object({
    rentalOrderId: z.string().uuid('Invalid rental order ID'),
    executiveName: z.string().min(1, 'Executive name is required'),
    returnTime: z.string().datetime(),
    odometerReading: z.number().int().nonnegative('Odometer reading must be >= 0'),
    fuelLevel: z.string().min(1, 'Fuel level is required (0-100%)'),
    vehicleCondition: z.enum(['EXCELLENT', 'GOOD', 'SCRATCH', 'DENT', 'BROKEN_PART']),
    damageCharge: z.number().nonnegative().optional(),
    lateCharge: z.number().nonnegative().optional(),
    remarks: z.string().optional()
  })
});

export const updateReturnSchema = z.object({
  body: z.object({
    executiveName: z.string().min(1).optional(),
    returnTime: z.string().datetime().optional(),
    odometerReading: z.number().int().nonnegative().optional(),
    fuelLevel: z.string().min(1).optional(),
    vehicleCondition: z.enum(['EXCELLENT', 'GOOD', 'SCRATCH', 'DENT', 'BROKEN_PART']).optional(),
    damageCharge: z.number().nonnegative().optional(),
    lateCharge: z.number().nonnegative().optional(),
    remarks: z.string().optional()
  })
});
