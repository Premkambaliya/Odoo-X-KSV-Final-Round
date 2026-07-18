import Stripe from 'stripe';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

class StripeService {
  async createPaymentIntent(orderId) {
    const order = await prisma.rentalOrder.findUnique({ where: { id: orderId }, include: { payments: { where: { paymentStatus: 'SUCCESS' } } } });
    if (!order) throw new ApiError(404, 'Rental Order not found');

    const totalPaid = order.payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const balance = Number(order.grandTotal) - totalPaid;
    if (balance <= 0) throw new ApiError(400, 'Order is already fully paid');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(balance * 100), // Stripe expects cents
      currency: 'inr', // fallback, ideally from org settings
      metadata: { rentalOrderId: order.id }
    });

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  }

  async createCheckoutSession(orderId, successUrl, cancelUrl) {
    const order = await prisma.rentalOrder.findUnique({ where: { id: orderId }, include: { payments: { where: { paymentStatus: 'SUCCESS' } } } });
    if (!order) throw new ApiError(404, 'Rental Order not found');

    const totalPaid = order.payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const balance = Number(order.grandTotal) - totalPaid;
    if (balance <= 0) throw new ApiError(400, 'Order is already fully paid');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: { currency: 'inr', product_data: { name: `Rental Order #${order.bookingNumber}` }, unit_amount: Math.round(balance * 100) },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { rentalOrderId: order.id }
    });
    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(signature, rawBody) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err) {
      throw new ApiError(400, `Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
      const data = event.type === 'checkout.session.completed' ? event.data.object : event.data.object;
      const rentalOrderId = data.metadata?.rentalOrderId;
      
      if (rentalOrderId) {
        // Find existing payments to avoid duplicate
        const existing = await prisma.payment.findUnique({ where: { transactionId: data.payment_intent || data.id } });
        if (!existing) {
          await prisma.$transaction(async (tx) => {
            const amount = data.amount_received || data.amount_total;
            await tx.payment.create({
              data: {
                rentalOrderId,
                transactionId: data.payment_intent || data.id,
                paymentMethod: 'CARD', // Maps to Prisma Enum
                paymentGateway: 'STRIPE',
                amount: amount / 100,
                paymentStatus: 'SUCCESS'
              }
            });

            // Recalculate order status
            const order = await tx.rentalOrder.findUnique({ where: { id: rentalOrderId }, include: { payments: { where: { paymentStatus: 'SUCCESS' } } } });
            const totalPaid = order.payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
            const balance = Number(order.grandTotal) - totalPaid;
            
            await tx.rentalOrder.update({
              where: { id: rentalOrderId },
              data: { paymentStatus: balance <= 0 ? 'PAID' : 'PARTIAL' }
            });
          });
        }
      }
    }
    return { received: true };
  }

  async getPayment(paymentId) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new ApiError(404, 'Payment not found');
    return payment;
  }

  async refundPayment(paymentId) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { rentalOrder: { include: { payments: { where: { paymentStatus: 'SUCCESS' } } } } } });
    if (!payment) throw new ApiError(404, 'Payment not found');
    if (!payment.transactionId || payment.paymentGateway !== 'STRIPE') throw new ApiError(400, 'Cannot refund non-stripe payment via this endpoint');
    
    // Process Stripe Refund
    const refund = await stripe.refunds.create({ payment_intent: payment.transactionId });

    return prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { paymentStatus: 'REFUNDED' }
      });
      // Recalculate order status
      const totalPaid = payment.rentalOrder.payments.filter(p => p.id !== paymentId).reduce((acc, curr) => acc + Number(curr.amount), 0);
      const balance = Number(payment.rentalOrder.grandTotal) - totalPaid;
      
      await tx.rentalOrder.update({
        where: { id: payment.rentalOrderId },
        data: { paymentStatus: balance <= 0 ? 'PAID' : (totalPaid > 0 ? 'PARTIAL' : 'PENDING') }
      });

      return { refundId: refund.id, status: refund.status };
    });
  }
}
export default new StripeService();
