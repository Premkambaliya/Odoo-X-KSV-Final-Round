import roService from './rentalOrders.service.js';
import catchAsync from '../../utils/catchAsync.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';

class RentalOrderController {
  create = catchAsync(async (req, res) => {
    const order = await roService.create(req.body, req.user);
    res.status(201).json(new ApiResponse(201, order, 'Rental Order created successfully'));
  });
  getAll = catchAsync(async (req, res) => {
    // If not admin, restrict to own orders
    const query = { ...req.query };
    if (req.user.role !== 'ADMIN') {
      query.customerId = req.user.id;
    }
    const result = await roService.getAll(query);
    res.status(200).json(new ApiResponse(200, result, 'Rental Orders fetched successfully'));
  });
  getById = catchAsync(async (req, res) => {
    const order = await roService.getById(req.params.id);
    // Security check
    if (req.user.role !== 'ADMIN' && order.customerId !== req.user.id) {
      throw new ApiError(403, 'Not authorized');
    }
    res.status(200).json(new ApiResponse(200, order, 'Rental Order fetched successfully'));
  });
  update = catchAsync(async (req, res) => {
    const order = await roService.update(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, order, 'Rental Order updated successfully'));
  });
  updateStatus = catchAsync(async (req, res) => {
    const order = await roService.updateStatus(req.params.id, req.body.status, req.user);
    res.status(200).json(new ApiResponse(200, order, 'Rental Order status updated successfully'));
  });
  recalculate = catchAsync(async (req, res) => {
    if (req.user.role !== 'ADMIN') {
      throw new ApiError(403, 'Only ADMIN can recalculate order totals');
    }
    const result = await roService.recalculate(req.params.id);
    res
      .status(200)
      .json(new ApiResponse(200, result, 'Order totals recalculated successfully'));
  });
  delete = catchAsync(async (req, res) => {
    await roService.delete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Rental Order deleted successfully'));
  });
}
export default new RentalOrderController();
