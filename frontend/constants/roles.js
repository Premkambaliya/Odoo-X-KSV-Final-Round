import { APP_ROUTES } from '@/constants/routes';

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
});

export const ROLE_HOME = Object.freeze({
  [ROLES.ADMIN]: APP_ROUTES.ADMIN.ROOT,
  [ROLES.CUSTOMER]: APP_ROUTES.CUSTOMER.ROOT,
});
