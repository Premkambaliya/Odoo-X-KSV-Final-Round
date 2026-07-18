import { z } from 'zod';

export const createPaymentSchema = z.object({
  rentalOrderId: z.string().uuid('Select a rental order'),
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NET_BANKING'], {
    message: 'Select a payment method',
  }),
  transactionId: z.string().optional().or(z.literal('')),
  paymentGateway: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']),
});

export const createDepositSchema = z.object({
  rentalOrderId: z.string().uuid('Select a rental order'),
  amountCollected: z.coerce.number().nonnegative('Amount cannot be negative'),
  reason: z.string().optional().or(z.literal('')),
});

export const refundDepositSchema = z.object({
  amountToRefund: z.coerce.number().positive('Refund amount must be positive'),
  damageCost: z.coerce.number().nonnegative().optional(),
  reason: z.string().optional().or(z.literal('')),
});
