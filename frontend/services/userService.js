import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const userService = {
  async getUsers() {
    const response = await api.get(API_ROUTES.USERS.LIST);
    return parseApiResponse(response);
  },

  async getById(id) {
    const response = await api.get(API_ROUTES.USERS.BY_ID(id));
    return parseApiResponse(response);
  },
};

export default userService;
