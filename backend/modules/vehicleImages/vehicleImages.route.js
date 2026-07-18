import express from 'express';
import vImageController from './vehicleImages.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadImageSchema } from './vehicleImages.validation.js';

const router = express.Router();

// Get images - public
router.get('/vehicles/:vehicleId/images', vImageController.getImages);

// Admin routes
router.post(
  '/vehicles/:vehicleId/images',
  verifyToken,
  authorize('ADMIN'),
  upload.single('image'),
  validate(uploadImageSchema),
  vImageController.upload
);

router.patch(
  '/vehicle-images/:id/primary',
  verifyToken,
  authorize('ADMIN'),
  vImageController.setPrimary
);

router.delete(
  '/vehicle-images/:id',
  verifyToken,
  authorize('ADMIN'),
  vImageController.delete
);

export default router;
