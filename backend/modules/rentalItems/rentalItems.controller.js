import itemService from './rentalItems.service.js';
import catchAsync from '../../utils/catchAsync.js';
import ApiResponse from '../../utils/ApiResponse.js';

class RentalItemController {
  addItem = catchAsync(async (req, res) => {
    const item = await itemService.addRentalItem(req.params.id, req.body.vehicleId);
    res.status(201).json(new ApiResponse(201, item, 'Rental item added successfully'));
  });
  getItems = catchAsync(async (req, res) => {
    const items = await itemService.getItems(req.params.id);
    res.status(200).json(new ApiResponse(200, items, 'Rental items fetched successfully'));
  });
  removeItem = catchAsync(async (req, res) => {
    await itemService.removeItem(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Rental item removed successfully'));
  });
}
export default new RentalItemController();
