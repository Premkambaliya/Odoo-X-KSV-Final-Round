import express from 'express';
import dController from './dashboard.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = express.Router();

router.use(verifyToken, authorize('ADMIN'));

router.get('/overview', dController.getOverview);
router.get('/revenue', dController.getRevenue);
router.get('/rentals', dController.getRentals);
router.get('/vehicles', dController.getVehicles);
router.get('/payments', dController.getPayments);

export default router;
