import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const analyticsService = {
  async getRevenueTrend() {
    const response = await api.get(API_ROUTES.ANALYTICS.REVENUE_TREND);
    return parseApiResponse(response);
  },

  async getRentalTrend() {
    const response = await api.get(API_ROUTES.ANALYTICS.RENTAL_TREND);
    return parseApiResponse(response);
  },
};

export default analyticsService;
