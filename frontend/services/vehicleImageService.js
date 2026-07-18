import api from '@/services/axios';
import { API_ROUTES } from '@/constants/apiRoutes';
import { parseApiResponse } from '@/lib/apiResponse';

const vehicleImageService = {
  async getImages(vehicleId) {
    const response = await api.get(API_ROUTES.VEHICLES.IMAGES(vehicleId));
    return parseApiResponse(response);
  },

  async upload(vehicleId, file, { isPrimary = false, onUploadProgress } = {}) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('isPrimary', isPrimary ? 'true' : 'false');

    const response = await api.post(API_ROUTES.VEHICLES.IMAGES(vehicleId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return parseApiResponse(response);
  },

  async setPrimary(imageId) {
    const response = await api.patch(API_ROUTES.VEHICLE_IMAGES.SET_PRIMARY(imageId));
    return parseApiResponse(response);
  },

  async remove(imageId) {
    const response = await api.delete(API_ROUTES.VEHICLE_IMAGES.BY_ID(imageId));
    return parseApiResponse(response);
  },
};

export default vehicleImageService;
