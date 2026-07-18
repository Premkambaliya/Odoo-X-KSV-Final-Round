import pService from './pickups.service.js';
import catchAsync from '../../utils/catchAsync.js';
import ApiResponse from '../../utils/ApiResponse.js';

class PickupController {
  create = catchAsync(async (req, res) => {
    const result = await pService.create(req.body);
    res.status(201).json(new ApiResponse(201, result, 'Vehicle picked up successfully'));
  });
  getAll = catchAsync(async (req, res) => {
    const result = await pService.getAll(req.query);
    res.status(200).json(new ApiResponse(200, result, 'Pickups fetched successfully'));
  });
  getById = catchAsync(async (req, res) => {
    const pickup = await pService.getById(req.params.id);
    res.status(200).json(new ApiResponse(200, pickup, 'Pickup fetched successfully'));
  });
  update = catchAsync(async (req, res) => {
    const pickup = await pService.update(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, pickup, 'Pickup updated successfully'));
  });
  delete = catchAsync(async (req, res) => {
    await pService.delete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Pickup deleted successfully'));
  });
}
export default new PickupController();
