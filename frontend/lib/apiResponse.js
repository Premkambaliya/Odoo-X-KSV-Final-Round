/**
 * Helpers for parsing backend ApiResponse payloads:
 * { success: boolean, message: string, data: any }
 */

export function isSuccessResponse(response) {
  const payload = unwrapPayload(response);
  return Boolean(payload?.success);
}

export function getResponseData(response, fallback = null) {
  const payload = unwrapPayload(response);
  if (!payload || payload.success === false) {
    return fallback;
  }
  return payload.data ?? fallback;
}

export function getResponseMessage(response, fallback = '') {
  const payload = unwrapPayload(response);
  return payload?.message || fallback;
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback;

  const apiMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    null;

  if (apiMessage) return apiMessage;

  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection and try again.';
  }

  return error.message || fallback;
}

export function parseApiResponse(response) {
  const payload = unwrapPayload(response);

  return {
    success: Boolean(payload?.success),
    message: payload?.message || '',
    data: payload?.data ?? null,
  };
}

function unwrapPayload(response) {
  if (!response) return null;
  if (typeof response === 'object' && 'success' in response) {
    return response;
  }
  if (typeof response === 'object' && response.data && 'success' in response.data) {
    return response.data;
  }
  return response?.data ?? response;
}
