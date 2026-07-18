import { z } from 'zod';

export const rentalBookingSchema = z
  .object({
    customerId: z.string().uuid('Select a customer'),
    rentalPeriodId: z.string().uuid('Select a rental period'),
    pickupDate: z.string().min(1, 'Pickup date is required'),
    expectedReturnDate: z.string().min(1, 'Return date is required'),
    pickupLocation: z.string().optional().or(z.literal('')),
    returnLocation: z.string().optional().or(z.literal('')),
    remarks: z.string().optional().or(z.literal('')),
    tax: z.coerce.number().nonnegative().optional(),
    discount: z.coerce.number().nonnegative().optional(),
    vehicleIds: z.array(z.string().uuid()).min(1, 'Select at least one vehicle'),
  })
  .refine(
    (data) => new Date(data.expectedReturnDate) > new Date(data.pickupDate),
    { message: 'Return date must be after pickup date', path: ['expectedReturnDate'] }
  );

export const rentalUpdateSchema = z.object({
  pickupDate: z.string().optional(),
  expectedReturnDate: z.string().optional(),
  remarks: z.string().optional().or(z.literal('')),
  tax: z.coerce.number().nonnegative().optional(),
  discount: z.coerce.number().nonnegative().optional(),
});
