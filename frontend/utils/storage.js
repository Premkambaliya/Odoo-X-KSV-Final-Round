import { STORAGE_KEYS } from '@/constants/storageKeys';
import {
  AUTH_COOKIE,
  ROLE_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  TOKEN_MAX_AGE_SECONDS,
} from '@/constants/routes';

function canUseDom() {
  return typeof window !== 'undefined';
}

function getRememberPreference() {
  if (!canUseDom()) return true;
  const stored = localStorage.getItem(STORAGE_KEYS.REMEMBER);
  if (stored === null) return true;
  return stored === 'true';
}

function getMaxAge(remember) {
  return remember ? TOKEN_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS;
}

function writeCookie(name, value, maxAge) {
  if (!canUseDom()) return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearCookie(name) {
  if (!canUseDom()) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function setRememberMe(remember) {
  if (!canUseDom()) return;
  localStorage.setItem(STORAGE_KEYS.REMEMBER, String(Boolean(remember)));
}

export function getToken() {
  if (!canUseDom()) return null;
  return (
    localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.TOKEN)
  );
}

export function setToken(token, options = {}) {
  if (!canUseDom() || !token) return;

  const remember = options.remember ?? getRememberPreference();
  setRememberMe(remember);

  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);

  if (remember) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  writeCookie(AUTH_COOKIE, token, getMaxAge(remember));
}

export function removeToken() {
  if (!canUseDom()) return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  clearCookie(AUTH_COOKIE);
}

export function getUser() {
  if (!canUseDom()) return null;
  const raw =
    localStorage.getItem(STORAGE_KEYS.USER) ||
    sessionStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  }
}

export function setUser(user, options = {}) {
  if (!canUseDom()) return;

  const remember = options.remember ?? getRememberPreference();

  localStorage.removeItem(STORAGE_KEYS.USER);
  sessionStorage.removeItem(STORAGE_KEYS.USER);

  if (!user) {
    clearCookie(ROLE_COOKIE);
    return;
  }

  const serialized = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.USER, serialized);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.USER, serialized);
  }

  if (user.role) {
    writeCookie(ROLE_COOKIE, user.role, getMaxAge(remember));
  }
}

export function clearAuthStorage() {
  removeToken();
  setUser(null);
  clearCookie(ROLE_COOKIE);
}
