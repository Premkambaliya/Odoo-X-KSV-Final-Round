import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const pickupService = {
  async getPickups(params = {}) {
    const response = await api.get(API_ROUTES.PICKUPS.LIST, { params });
    return parseApiResponse(response);
  },

  async getById(id) {
    const response = await api.get(API_ROUTES.PICKUPS.BY_ID(id));
    return parseApiResponse(response);
  },

  async create(payload) {
    const response = await api.post(API_ROUTES.PICKUPS.LIST, payload);
    return parseApiResponse(response);
  },

  async update(id, payload) {
    const response = await api.put(API_ROUTES.PICKUPS.BY_ID(id), payload);
    return parseApiResponse(response);
  },

  async remove(id) {
    const response = await api.delete(API_ROUTES.PICKUPS.BY_ID(id));
    return parseApiResponse(response);
  },
};

export default pickupService;
