import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const quotationService = {
  async generate(rentalOrderId) {
    const response = await api.post(API_ROUTES.QUOTATIONS.GENERATE(rentalOrderId));
    return parseApiResponse(response);
  },

  async getById(id) {
    const response = await api.get(API_ROUTES.QUOTATIONS.BY_ID(id));
    return parseApiResponse(response);
  },

  async getByOrderId(rentalOrderId) {
    const response = await api.get(API_ROUTES.RENTAL_ORDERS.QUOTATION(rentalOrderId));
    return parseApiResponse(response);
  },
};

export default quotationService;
