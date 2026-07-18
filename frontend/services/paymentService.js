import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const paymentService = {
  async getPayments(params = {}) {
    const response = await api.get(API_ROUTES.PAYMENTS.LIST, { params });
    return parseApiResponse(response);
  },

  async getPaymentById(id) {
    const response = await api.get(API_ROUTES.PAYMENTS.BY_ID(id));
    return parseApiResponse(response);
  },

  async create(payload) {
    const response = await api.post(API_ROUTES.PAYMENTS.LIST, payload);
    return parseApiResponse(response);
  },

  async updateStatus(id, status) {
    const response = await api.patch(API_ROUTES.PAYMENTS.STATUS(id), { status });
    return parseApiResponse(response);
  },

  async remove(id) {
    const response = await api.delete(API_ROUTES.PAYMENTS.BY_ID(id));
    return parseApiResponse(response);
  },
};

export default paymentService;
