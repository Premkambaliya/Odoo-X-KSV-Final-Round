import { z } from 'zod';

export const createRentalItemSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
  }) // Quantity is always 1 by business rule
});
