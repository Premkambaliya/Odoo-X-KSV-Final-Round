import pRepository from './payments.repository.js';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import {
  resolvePaymentStatus,
  syncOrderPaymentStatus,
} from '../../utils/orderTotals.js';

class PaymentService {
  async processPayment(data) {
    const order = await pRepository.getOrder(data.rentalOrderId);
    if (!order) throw new ApiError(404, 'Rental order not found');
    if (order.status === 'CANCELLED') {
      throw new ApiError(400, 'Cannot make payment for cancelled order');
    }

    const totalPaid = order.payments
      .filter((p) => p.paymentStatus === 'SUCCESS')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const balance = Number(order.grandTotal) - totalPaid;

    if (data.amount > balance + 0.0001) {
      throw new ApiError(
        400,
        `Payment amount (${data.amount}) cannot exceed remaining balance (${balance})`
      );
    }

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          rentalOrderId: data.rentalOrderId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          paymentGateway: data.paymentGateway,
          paymentStatus: 'SUCCESS',
        },
      });

      const newTotalPaid = totalPaid + Number(data.amount);
      const newPaymentStatus = resolvePaymentStatus(
        order.grandTotal,
        newTotalPaid
      );
      const newBalance = Number(order.grandTotal) - newTotalPaid;

      await tx.rentalOrder.update({
        where: { id: data.rentalOrderId },
        data: { paymentStatus: newPaymentStatus },
      });

      return {
        payment,
        orderTotal: order.grandTotal,
        totalPaid: newTotalPaid,
        balance: newBalance,
        orderPaymentStatus: newPaymentStatus,
      };
    });
  }

  async getAll(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.transactionId) {
      where.transactionId = {
        contains: query.transactionId,
        mode: 'insensitive',
      };
    }
    if (query.orderNumber) {
      where.rentalOrder = {
        bookingNumber: { contains: query.orderNumber, mode: 'insensitive' },
      };
    }
    if (query.customerName) {
      where.rentalOrder = {
        ...where.rentalOrder,
        customer: {
          OR: [
            {
              firstName: { contains: query.customerName, mode: 'insensitive' },
            },
            {
              lastName: { contains: query.customerName, mode: 'insensitive' },
            },
          ],
        },
      };
    }
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
    if (query.date) {
      const d = new Date(query.date);
      where.paidAt = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    let orderBy = {};
    if (query.sortBy) {
      const order = query.order === 'asc' ? 'asc' : 'desc';
      if (['amount', 'paidAt', 'createdAt'].includes(query.sortBy)) {
        orderBy[query.sortBy === 'createdAt' ? 'paidAt' : query.sortBy] = order;
      }
    } else {
      orderBy = { paidAt: 'desc' };
    }

    const [total, payments] = await pRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
    });
    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id) {
    const payment = await pRepository.findById(id);
    if (!payment) throw new ApiError(404, 'Payment not found');
    return payment;
  }

  async updateStatus(id, status) {
    const payment = await pRepository.findById(id);
    if (!payment) throw new ApiError(404, 'Payment not found');

    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { paymentStatus: status },
      });

      await syncOrderPaymentStatus(tx, payment.rentalOrderId);

      return updatedPayment;
    });
  }

  async delete(id) {
    const payment = await pRepository.findById(id);
    if (!payment) throw new ApiError(404, 'Payment not found');

    return prisma.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id } });
      await syncOrderPaymentStatus(tx, payment.rentalOrderId);
      return true;
    });
  }
}
export default new PaymentService();
