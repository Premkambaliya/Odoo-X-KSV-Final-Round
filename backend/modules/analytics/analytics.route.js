import express from 'express';
import aController from './analytics.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = express.Router();

router.use(verifyToken, authorize('ADMIN'));

router.get('/revenue-trend', aController.getRevenueTrend);
router.get('/rental-trend', aController.getRentalTrend);

export default router;
