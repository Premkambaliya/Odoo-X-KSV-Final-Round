import { ROLES, ROLE_HOME } from '@/constants/roles';
import { APP_ROUTES } from '@/constants/routes';

export function getHomeForRole(role) {
  return ROLE_HOME[role] || APP_ROUTES.LOGIN;
}

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isCustomer(role) {
  return role === ROLES.CUSTOMER;
}

export function canAccessAdmin(role) {
  return isAdmin(role);
}

export function canAccessCustomer(role) {
  return isCustomer(role);
}

export function getDisplayName(user) {
  if (!user) return 'User';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email || 'User';
}

export function getInitials(user) {
  if (!user) return 'U';
  const first = user.firstName?.[0] || user.email?.[0] || 'U';
  const last = user.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase();
}
