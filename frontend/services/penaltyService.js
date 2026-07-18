import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const penaltyService = {
  async getPenalties(params = {}) {
    const response = await api.get(API_ROUTES.PENALTIES.LIST, { params });
    return parseApiResponse(response);
  },

  async getById(id) {
    const response = await api.get(API_ROUTES.PENALTIES.BY_ID(id));
    return parseApiResponse(response);
  },

  async create(payload) {
    const response = await api.post(API_ROUTES.PENALTIES.LIST, payload);
    return parseApiResponse(response);
  },

  async update(id, payload) {
    const response = await api.put(API_ROUTES.PENALTIES.BY_ID(id), payload);
    return parseApiResponse(response);
  },

  async remove(id) {
    const response = await api.delete(API_ROUTES.PENALTIES.BY_ID(id));
    return parseApiResponse(response);
  },

  async calculate(rentalOrderId) {
    const response = await api.post(API_ROUTES.PENALTIES.CALCULATE, {
      rentalOrderId,
    });
    return parseApiResponse(response);
  },

  async checkClosure(rentalOrderId) {
    const response = await api.post(
      API_ROUTES.PENALTIES.CHECK_CLOSURE(rentalOrderId)
    );
    return parseApiResponse(response);
  },
};

export default penaltyService;
