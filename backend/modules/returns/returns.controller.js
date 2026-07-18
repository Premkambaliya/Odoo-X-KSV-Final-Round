import rService from './returns.service.js';
import catchAsync from '../../utils/catchAsync.js';
import ApiResponse from '../../utils/ApiResponse.js';

class ReturnController {
  create = catchAsync(async (req, res) => {
    const result = await rService.create(req.body);
    res.status(201).json(new ApiResponse(201, result, 'Vehicle returned successfully'));
  });
  getAll = catchAsync(async (req, res) => {
    const result = await rService.getAll(req.query);
    res.status(200).json(new ApiResponse(200, result, 'Returns fetched successfully'));
  });
  getById = catchAsync(async (req, res) => {
    const returnRecord = await rService.getById(req.params.id);
    res.status(200).json(new ApiResponse(200, returnRecord, 'Return fetched successfully'));
  });
  update = catchAsync(async (req, res) => {
    const returnRecord = await rService.update(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, returnRecord, 'Return updated successfully'));
  });
  delete = catchAsync(async (req, res) => {
    await rService.delete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Return deleted successfully'));
  });
}
export default new ReturnController();
