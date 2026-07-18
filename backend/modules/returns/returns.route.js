import express from 'express';
import rController from './returns.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createReturnSchema, updateReturnSchema } from './returns.validation.js';

const router = express.Router();

router.use(verifyToken, authorize('ADMIN'));

router.post('/', validate(createReturnSchema), rController.create);
router.get('/', rController.getAll);
router.get('/:id', rController.getById);
router.put('/:id', validate(updateReturnSchema), rController.update);
router.delete('/:id', rController.delete);

export default router;
