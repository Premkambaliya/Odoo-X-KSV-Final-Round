/**
 * Frontend application routes.
 * Used by middleware and navigation — do not hardcode path strings elsewhere.
 */
export const APP_ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    VEHICLES: '/admin/vehicles',
    VEHICLE_NEW: '/admin/vehicles/new',
    VEHICLE_DETAIL: (id) => `/admin/vehicles/${id}`,
    VEHICLE_EDIT: (id) => `/admin/vehicles/${id}/edit`,
    CATEGORIES: '/admin/categories',
    CATEGORY_NEW: '/admin/categories/new',
    CATEGORY_DETAIL: (id) => `/admin/categories/${id}`,
    CATEGORY_EDIT: (id) => `/admin/categories/${id}/edit`,
    RENTAL_ORDERS: '/admin/rental-orders',
    RENTAL_ORDER_NEW: '/admin/rental-orders/new',
    RENTAL_ORDER_DETAIL: (id) => `/admin/rental-orders/${id}`,
    RENTAL_ORDER_EDIT: (id) => `/admin/rental-orders/${id}/edit`,
    CUSTOMERS: '/admin/customers',
    CUSTOMER_DETAIL: (id) => `/admin/customers/${id}`,
    PAYMENTS: '/admin/payments',
    PAYMENT_NEW: '/admin/payments/new',
    PAYMENT_HISTORY: '/admin/payments/history',
    PAYMENT_DETAIL: (id) => `/admin/payments/${id}`,
    PAYMENT_EDIT: (id) => `/admin/payments/${id}/edit`,
    PAYMENT_RECEIPT: (id) => `/admin/payments/${id}/receipt`,
    SECURITY_DEPOSITS: '/admin/security-deposits',
    SECURITY_DEPOSIT_NEW: '/admin/security-deposits/new',
    SECURITY_DEPOSIT_DETAIL: (id) => `/admin/security-deposits/${id}`,
    SECURITY_DEPOSIT_REFUND: (id) => `/admin/security-deposits/${id}/refund`,
    REPORTS: '/admin/reports',
    REPORTS_REVENUE: '/admin/reports/revenue',
    REPORTS_RENTALS: '/admin/reports/rentals',
    REPORTS_VEHICLES: '/admin/reports/vehicles',
    REPORTS_PAYMENTS: '/admin/reports/payments',
    REPORTS_ANALYTICS: '/admin/reports/analytics',
    PROFILE: '/admin/profile',
  },
  CUSTOMER: {
    ROOT: '/customer',
    DASHBOARD: '/customer',
    VEHICLES: '/customer/vehicles',
    VEHICLE_DETAIL: (id) => `/customer/vehicles/${id}`,
    FAVOURITES: '/customer/favourites',
    RENTALS: '/customer/rentals',
    RENTAL_DETAIL: (id) => `/customer/rentals/${id}`,
    PAYMENTS: '/customer/payments',
    PROFILE: '/customer/profile',
  },
});

/** Path prefixes that require authentication */
export const PROTECTED_PREFIXES = Object.freeze([
  APP_ROUTES.ADMIN.ROOT,
  APP_ROUTES.CUSTOMER.ROOT,
]);

export const AUTH_COOKIE = 'token';
export const ROLE_COOKIE = 'role';
export const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
