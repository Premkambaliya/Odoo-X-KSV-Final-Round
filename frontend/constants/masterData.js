/**
 * Master data option constants aligned with backend seed / conventions.
 */
export const VEHICLE_AVAILABILITY = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
});

export const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BOOKED', label: 'Booked / Rented' },
  { value: 'UNDER_MAINTENANCE', label: 'Maintenance' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

export const FUEL_OPTIONS = [
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Electric', label: 'Electric' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'CNG', label: 'CNG' },
];

export const TRANSMISSION_OPTIONS = [
  { value: 'Manual', label: 'Manual' },
  { value: 'Automatic', label: 'Automatic' },
];

export const PRICING_TYPE_OPTIONS = [
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Weekend', label: 'Weekend' },
];

export const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];
