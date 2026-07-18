import aService from './analytics.service.js';
import catchAsync from '../../utils/catchAsync.js';
import ApiResponse from '../../utils/ApiResponse.js';

class AnalyticsController {
  getRevenueTrend = catchAsync(async (req, res) => {
    const data = await aService.getRevenueTrend();
    res.status(200).json(new ApiResponse(200, data, 'Revenue trend fetched'));
  });
  getRentalTrend = catchAsync(async (req, res) => {
    const data = await aService.getRentalTrend();
    res.status(200).json(new ApiResponse(200, data, 'Rental trend fetched'));
  });
}
export default new AnalyticsController();
