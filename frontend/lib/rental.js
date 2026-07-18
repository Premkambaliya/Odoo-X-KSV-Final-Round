export const RENTAL_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  LATE: 'LATE',
});

export const RENTAL_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'LATE', label: 'Late' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const RENTAL_TIMELINE_STEPS = [
  { key: 'PENDING', label: 'Created', description: 'Booking drafted' },
  { key: 'CONFIRMED', label: 'Confirmed', description: 'Vehicles reserved' },
  { key: 'ACTIVE', label: 'Active / Pickup', description: 'Rental in progress' },
  { key: 'COMPLETED', label: 'Completed', description: 'Return finished' },
];

export function itemLineTotal(item) {
  if (!item) return 0;
  if (item.subtotal != null) return Number(item.subtotal);
  if (item.rentalAmount != null) return Number(item.rentalAmount);
  if (item.unitPrice != null) return Number(item.unitPrice) * Number(item.quantity || 1);
  return 0;
}

export function previewVehiclePrice(vehicle, periodDays = 1) {
  return Number(vehicle?.basePrice || 0) * Number(periodDays || 1);
}

export function previewSecurityDeposit(vehicles = []) {
  return vehicles.reduce((sum, v) => sum + Number(v.securityDeposit || 0), 0);
}

export function previewPricing(vehicles = [], periodDays = 1, tax = 0, discount = 0, lateFee = 0) {
  const subtotal = vehicles.reduce(
    (sum, v) => sum + previewVehiclePrice(v, periodDays),
    0
  );
  const deposit = previewSecurityDeposit(vehicles);
  const grandTotal =
    subtotal +
    Number(tax || 0) -
    Number(discount || 0) +
    deposit +
    Number(lateFee || 0);
  return {
    subtotal,
    tax: Number(tax || 0),
    discount: Number(discount || 0),
    deposit,
    lateFee: Number(lateFee || 0),
    grandTotal,
  };
}

/** Canonical grand total formula aligned with backend recalculation. */
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
