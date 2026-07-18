import prisma from '../config/db.js';

/**
 * Shared rental order financial helpers.
 * Formula: grandTotal = subtotal + tax - discount + securityDeposit + lateFee
 */

export function computeGrandTotal({
  subtotal = 0,
  tax = 0,
  discount = 0,
  securityDeposit = 0,
  lateFee = 0,
} = {}) {
  return (
    Number(subtotal || 0) +
    Number(tax || 0) -
    Number(discount || 0) +
    Number(securityDeposit || 0) +
    Number(lateFee || 0)
  );
}

export function resolvePaymentStatus(grandTotal, totalPaid) {
  const balance = Number(grandTotal) - Number(totalPaid);
  if (Number(totalPaid) <= 0) return 'PENDING';
  if (balance <= 0) return 'PAID';
  return 'PARTIAL';
}

/**
 * Recalculate paymentStatus from SUCCESS payments vs current grandTotal.
 * Works inside an existing transaction (tx) or standalone (prisma).
 */
export async function syncOrderPaymentStatus(db, orderId) {
  const client = db || prisma;
  const order = await client.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      payments: { where: { paymentStatus: 'SUCCESS' } },
    },
  });
  if (!order) return null;

  const totalPaid = order.payments.reduce(
    (acc, p) => acc + Number(p.amount),
    0
  );
  const paymentStatus = resolvePaymentStatus(order.grandTotal, totalPaid);

  if (order.paymentStatus !== paymentStatus) {
    await client.rentalOrder.update({
      where: { id: orderId },
      data: { paymentStatus },
    });
  }

  return {
    paymentStatus,
    totalPaid,
    balance: Number(order.grandTotal) - totalPaid,
    grandTotal: Number(order.grandTotal),
  };
}

/**
 * Rebuild subtotal + securityDeposit + grandTotal from rental items + fees.
 */
export async function recalculateOrderTotals(db, orderId) {
  const client = db || prisma;
  const order = await client.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      rentalItems: { include: { vehicle: true } },
    },
  });
  if (!order) return null;

  const subtotal = order.rentalItems.reduce(
    (acc, item) => acc + Number(item.subtotal),
    0
  );
  const securityDeposit = order.rentalItems.reduce(
    (acc, item) => acc + Number(item.vehicle?.securityDeposit || 0),
    0
  );
  const tax = Number(order.tax || 0);
  const discount = Number(order.discount || 0);
  const lateFee = Number(order.lateFee || 0);
  const grandTotal = computeGrandTotal({
    subtotal,
    tax,
    discount,
    securityDeposit,
    lateFee,
  });

  const updated = await client.rentalOrder.update({
    where: { id: orderId },
    data: { subtotal, securityDeposit, grandTotal },
  });

  const payment = await syncOrderPaymentStatus(client, orderId);

  return {
    order: updated,
    subtotal,
    securityDeposit,
    grandTotal,
    payment,
  };
}
