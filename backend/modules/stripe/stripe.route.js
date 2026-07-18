import express from 'express';
import sController from './stripe.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = express.Router();
// Webhook bypasses standard json parser because it requires raw body
router.post('/webhook', sController.handleWebhook); // Note: rawBody middleware applied in app.js

router.use(verifyToken);
router.post('/create-payment-intent', sController.createPaymentIntent);
router.post('/create-checkout-session', sController.createCheckoutSession);
router.get('/payment/:paymentId', authorize('ADMIN'), sController.getPayment);
router.post('/refund/:paymentId', authorize('ADMIN'), sController.refundPayment);

export default router;
