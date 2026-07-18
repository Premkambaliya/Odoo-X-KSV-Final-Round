import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const dashboardService = {
  async getOverview() {
    const response = await api.get(API_ROUTES.DASHBOARD.OVERVIEW);
    return parseApiResponse(response);
  },

  async getRevenue() {
    const response = await api.get(API_ROUTES.DASHBOARD.REVENUE);
    return parseApiResponse(response);
  },

  async getRentals() {
    const response = await api.get(API_ROUTES.DASHBOARD.RENTALS);
    return parseApiResponse(response);
  },

  async getVehicles() {
    const response = await api.get(API_ROUTES.DASHBOARD.VEHICLES);
    return parseApiResponse(response);
  },

  async getPayments() {
    const response = await api.get(API_ROUTES.DASHBOARD.PAYMENTS);
    return parseApiResponse(response);
  },
};

export default dashboardService;
