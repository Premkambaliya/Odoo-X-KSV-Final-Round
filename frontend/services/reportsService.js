import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const reportsService = {
  async getRentalReport(params = {}) {
    const response = await api.get(API_ROUTES.REPORTS.RENTALS, { params });
    return parseApiResponse(response);
  },

  async getRevenueReport(params = {}) {
    const response = await api.get(API_ROUTES.REPORTS.REVENUE, { params });
    return parseApiResponse(response);
  },
};

export default reportsService;
