import dayjs from 'dayjs';

export function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function formatCurrency(value, options = {}) {
  const amount = toNumber(value);
  const { compact = false, currency = 'INR', locale = 'en-IN' } = options;

  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(toNumber(value));
}

export function formatDate(value, pattern = 'DD MMM YYYY') {
  if (!value) return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format(pattern) : '—';
}

export function formatDateTime(value) {
  return formatDate(value, 'DD MMM YYYY, HH:mm');
}

export function getGreeting(date = new Date()) {
  const hour = dayjs(date).hour();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function customerName(customer) {
  if (!customer) return 'Unknown customer';
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
  return name || customer.email || 'Unknown customer';
}

export function vehicleLabel(rentalItems = []) {
  if (!rentalItems?.length) return 'No vehicle';
  const first = rentalItems[0]?.vehicle;
  if (first) {
    const label = [first.make, first.model].filter(Boolean).join(' ') || first.registrationNumber;
    if (rentalItems.length > 1) return `${label} +${rentalItems.length - 1}`;
    return label || 'Vehicle';
  }
  return `${rentalItems.length} vehicle${rentalItems.length > 1 ? 's' : ''}`;
}

/**
 * Bin raw analytics rows into daily series for charts.
 */
export function binByDay(rows, { dateKey, valueAccessor, days = 14 } = {}) {
  const map = new Map();
  const end = dayjs().endOf('day');
  const start = end.subtract(days - 1, 'day').startOf('day');

  for (let i = 0; i < days; i += 1) {
    const key = start.add(i, 'day').format('YYYY-MM-DD');
    map.set(key, 0);
  }

  (rows || []).forEach((row) => {
    const raw = row?.[dateKey];
    if (!raw) return;
    const key = dayjs(raw).format('YYYY-MM-DD');
    if (!map.has(key)) return;
    map.set(key, map.get(key) + toNumber(valueAccessor(row)));
  });

  return Array.from(map.entries()).map(([date, value]) => ({
    date,
    label: dayjs(date).format('DD MMM'),
    value,
  }));
}

export function aggregatePaymentMethods(payments = []) {
  const buckets = {
    CASH: 0,
    UPI: 0,
    CARD: 0,
    NET_BANKING: 0,
    OTHERS: 0,
  };

  payments.forEach((payment) => {
    const method = payment.paymentMethod;
    if (buckets[method] !== undefined) {
      buckets[method] += 1;
    } else {
      buckets.OTHERS += 1;
    }
  });

  return [
    { name: 'Cash', key: 'CASH', value: buckets.CASH },
    { name: 'UPI', key: 'UPI', value: buckets.UPI },
    { name: 'Card', key: 'CARD', value: buckets.CARD },
    { name: 'Bank', key: 'NET_BANKING', value: buckets.NET_BANKING },
    { name: 'Others', key: 'OTHERS', value: buckets.OTHERS },
  ];
}
