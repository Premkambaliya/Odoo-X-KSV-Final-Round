import axios from 'axios';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import { clearAuthStorage, getToken } from '@/utils/storage';
import notify from '@/lib/toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isAuthCredentialRequest(config) {
  const url = config?.url || '';
  return url.includes('/auth/login') || url.includes('/auth/register');
}

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = getErrorMessage(error);
    const authAttempt = isAuthCredentialRequest(error.config);

    if (!error.response) {
      notify.error(message || 'Network error. Please try again.');
      return Promise.reject(error);
    }

    if (status === 401) {
      if (!authAttempt) {
        clearAuthStorage();
        notify.error(message || 'Session expired. Please log in again.');

        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== APP_ROUTES.LOGIN
        ) {
          window.location.href = APP_ROUTES.LOGIN;
        }
      }

      return Promise.reject(error);
    }

    if (status === 403) {
      notify.error(message || 'You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    if (status >= 500) {
      notify.error(message || 'Server error. Please try again later.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
