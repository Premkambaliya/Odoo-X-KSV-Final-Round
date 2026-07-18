export const FUEL_LEVEL_OPTIONS = [
  { value: '100%', label: 'Full (100%)' },
  { value: '75%', label: '3/4 (75%)' },
  { value: '50%', label: 'Half (50%)' },
  { value: '25%', label: '1/4 (25%)' },
  { value: '10%', label: 'Reserve (10%)' },
  { value: '0%', label: 'Empty (0%)' },
];

export const VEHICLE_CONDITION_OPTIONS = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'SCRATCH', label: 'Scratch' },
  { value: 'DENT', label: 'Dent' },
  { value: 'BROKEN_PART', label: 'Broken Part' },
];

export const PENALTY_TYPE_OPTIONS = [
  { value: 'LATE_RETURN', label: 'Late Return' },
  { value: 'DAMAGE', label: 'Vehicle Damage' },
  { value: 'CLEANING', label: 'Cleaning Charge' },
  { value: 'TRAFFIC_FINE', label: 'Traffic Fine' },
  { value: 'OTHER', label: 'Other / Extra Distance / Low Fuel' },
];

export const PENALTY_STATUS_OPTIONS = [
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PAID', label: 'Paid' },
];

export const OPERATIONS_TIMELINE = [
  { key: 'CREATED', label: 'Rental Created', description: 'Booking drafted' },
  { key: 'CONFIRMED', label: 'Confirmed', description: 'Vehicles reserved' },
  { key: 'PAYMENT', label: 'Payment', description: 'Settlement recorded' },
  { key: 'PICKUP', label: 'Pickup', description: 'Vehicle handed over' },
  { key: 'ACTIVE', label: 'Active Rental', description: 'Customer has the vehicle' },
  { key: 'RETURN', label: 'Return', description: 'Vehicle received back' },
  { key: 'PENALTY', label: 'Penalty', description: 'Charges assessed if any' },
  { key: 'COMPLETED', label: 'Completed', description: 'Rental closed' },
  { key: 'CANCELLED', label: 'Cancelled', description: 'Booking cancelled' },
];

/** Parse fuel strings like "80%" or "80" into 0–100. */
export function parseFuelPercent(value) {
  if (value == null || value === '') return null;
  const n = parseInt(String(value).replace('%', ''), 10);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
}

/** Convert datetime-local value to ISO string for backend zod datetime(). */
export function localDateTimeToIso(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

/** Format ISO / Date into datetime-local input value. */
export function isoToLocalDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function nowLocalDateTime() {
  return isoToLocalDateTime(new Date());
}
