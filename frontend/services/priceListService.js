import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const priceListService = {
  async getAll() {
    const response = await api.get(API_ROUTES.PRICE_LISTS.LIST);
    return parseApiResponse(response);
  },

  async getById(id) {
    const response = await api.get(API_ROUTES.PRICE_LISTS.BY_ID(id));
    return parseApiResponse(response);
  },

  async create(payload) {
    const response = await api.post(API_ROUTES.PRICE_LISTS.LIST, payload);
    return parseApiResponse(response);
  },

  async update(id, payload) {
    const response = await api.put(API_ROUTES.PRICE_LISTS.BY_ID(id), payload);
    return parseApiResponse(response);
  },

  async remove(id) {
    const response = await api.delete(API_ROUTES.PRICE_LISTS.BY_ID(id));
    return parseApiResponse(response);
  },
};

export default priceListService;
