import express from 'express';
import itemController from './rentalItems.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createRentalItemSchema } from './rentalItems.validation.js';

const router = express.Router();

router.use(verifyToken);

// Mount point will be /api directly, so we map the paths
router.post('/rental-orders/:id/items', validate(createRentalItemSchema), itemController.addItem);
router.get('/rental-orders/:id/items', itemController.getItems);
router.delete('/rental-items/:id', itemController.removeItem);

export default router;
