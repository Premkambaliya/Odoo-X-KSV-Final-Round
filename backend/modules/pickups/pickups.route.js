import express from 'express';
import pController from './pickups.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createPickupSchema, updatePickupSchema } from './pickups.validation.js';

const router = express.Router();

router.use(verifyToken, authorize('ADMIN'));

router.post('/', validate(createPickupSchema), pController.create);
router.get('/', pController.getAll);
router.get('/:id', pController.getById);
router.put('/:id', validate(updatePickupSchema), pController.update);
router.delete('/:id', pController.delete);

export default router;
