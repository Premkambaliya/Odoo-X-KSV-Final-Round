import { z } from 'zod';

export const createRentalOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    rentalPeriodId: z.string().uuid('Invalid rental period ID'),
    pickupDate: z.string().datetime(),
    expectedReturnDate: z.string().datetime(),
    pickupAddressId: z.string().uuid().optional().nullable(),
    dropAddressId: z.string().uuid().optional().nullable(),
    remarks: z.string().optional()
  })
}).refine(data => new Date(data.body.pickupDate) > new Date(Date.now() - 86400000), {
  message: 'Pickup date cannot be in the past',
  path: ['body', 'pickupDate']
}).refine(data => new Date(data.body.expectedReturnDate) > new Date(data.body.pickupDate), {
  message: 'Expected return date must be after pickup date',
  path: ['body', 'expectedReturnDate']
});

export const updateRentalOrderSchema = z.object({
  body: z.object({
    pickupDate: z.string().datetime().optional(),
    expectedReturnDate: z.string().datetime().optional(),
    pickupAddressId: z.string().uuid().optional().nullable(),
    dropAddressId: z.string().uuid().optional().nullable(),
    remarks: z.string().optional(),
    tax: z.number().nonnegative().optional(),
    discount: z.number().nonnegative().optional()
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  })
});
