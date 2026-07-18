import express from 'express';
import roController from './rentalOrders.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createRentalOrderSchema, updateRentalOrderSchema, updateOrderStatusSchema } from './rentalOrders.validation.js';

// Items and Quotation routes will be attached in app.js or here
const router = express.Router();

router.use(verifyToken);

router.post('/', validate(createRentalOrderSchema), roController.create);
router.get('/', roController.getAll);
router.get('/:id', roController.getById);

// Update details usually by admin, but let's allow customer to update if PENDING
router.put('/:id', validate(updateRentalOrderSchema), roController.update);

// Status update (Confirming, Cancelling etc)
router.patch('/:id/status', validate(updateOrderStatusSchema), roController.updateStatus);

router.post(
  '/:id/recalculate',
  authorize('ADMIN'),
  roController.recalculate
);

router.delete('/:id', roController.delete);

export default router;
