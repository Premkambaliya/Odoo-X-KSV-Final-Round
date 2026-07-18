import dService from './dashboard.service.js';
import catchAsync from '../../utils/catchAsync.js';
import ApiResponse from '../../utils/ApiResponse.js';

class DashboardController {
  getOverview = catchAsync(async (req, res) => {
    const result = await dService.getOverview();
    res.status(200).json(new ApiResponse(200, result, 'Dashboard overview fetched successfully'));
  });
  getRevenue = catchAsync(async (req, res) => {
    const result = await dService.getRevenue();
    res.status(200).json(new ApiResponse(200, result, 'Dashboard revenue fetched successfully'));
  });
  getRentals = catchAsync(async (req, res) => {
    const result = await dService.getRentals();
    res.status(200).json(new ApiResponse(200, result, 'Dashboard rentals fetched successfully'));
  });
  getVehicles = catchAsync(async (req, res) => {
    const result = await dService.getVehicles();
    res.status(200).json(new ApiResponse(200, result, 'Dashboard vehicles fetched successfully'));
  });
  getPayments = catchAsync(async (req, res) => {
    const result = await dService.getPayments();
    res.status(200).json(new ApiResponse(200, result, 'Dashboard payments fetched successfully'));
  });
}
export default new DashboardController();
