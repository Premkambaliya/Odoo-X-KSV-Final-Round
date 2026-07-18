import roRepository from './rentalOrders.repository.js';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import {
  recalculateOrderTotals,
  syncOrderPaymentStatus,
} from '../../utils/orderTotals.js';

class RentalOrderService {
  async create(data, user) {
    // If not admin, force customerId to be self
    if (user.role !== 'ADMIN') {
      data.customerId = user.id;
    }

    const customer = await prisma.user.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new ApiError(404, 'Customer not found');

    const rentalPeriod = await prisma.rentalPeriod.findUnique({ where: { id: data.rentalPeriodId } });
    if (!rentalPeriod) throw new ApiError(404, 'Rental period not found');

    const bookingNumber = await roRepository.generateBookingNumber();

    const orderData = {
      ...data,
      bookingNumber,
      pickupDate: new Date(data.pickupDate),
      expectedReturnDate: new Date(data.expectedReturnDate),
      subtotal: 0,
      securityDeposit: 0,
      tax: 0,
      discount: 0,
      lateFee: 0,
      grandTotal: 0,
      status: 'PENDING'
    };

    return roRepository.create(orderData);
  }

  async getAll(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.orderNumber) where.bookingNumber = { contains: query.orderNumber, mode: 'insensitive' };
    if (query.customerName) {
      where.customer = {
        OR: [
          { firstName: { contains: query.customerName, mode: 'insensitive' } },
          { lastName: { contains: query.customerName, mode: 'insensitive' } }
        ]
      };
    }
    if (query.customerId) where.customerId = query.customerId;
    if (query.status) where.status = query.status;
    if (query.pickupDate) where.pickupDate = { gte: new Date(query.pickupDate) };
    if (query.returnDate) where.expectedReturnDate = { lte: new Date(query.returnDate) };

    let orderBy = {};
    if (query.sortBy) {
      const order = query.order === 'asc' ? 'asc' : 'desc';
      if (['createdAt', 'pickupDate', 'grandTotal'].includes(query.sortBy)) {
        orderBy[query.sortBy] = order;
      }
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [total, orders] = await roRepository.findAll({ skip, take: limit, where, orderBy });
    return {
      orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getById(id) {
    const order = await roRepository.findById(id);
    if (!order) throw new ApiError(404, 'Rental order not found');
    return order;
  }

  async update(id, data) {
    const order = await roRepository.findById(id);
    if (!order) throw new ApiError(404, 'Rental order not found');
    if (order.status === 'CANCELLED') throw new ApiError(400, 'Cancelled orders cannot be modified');
    if (order.status === 'COMPLETED') throw new ApiError(400, 'Completed orders cannot be edited');

    if (data.pickupDate) data.pickupDate = new Date(data.pickupDate);
    if (data.expectedReturnDate) data.expectedReturnDate = new Date(data.expectedReturnDate);

    if (data.pickupDate || data.expectedReturnDate) {
      const pDate = data.pickupDate || order.pickupDate;
      const rDate = data.expectedReturnDate || order.expectedReturnDate;
      if (rDate <= pDate) throw new ApiError(400, 'Expected return date must be after pickup date');
    }

    const updateData = { ...data };
    
    // If tax or discount changes, recalculate totals including vehicle deposits + late fee
    if (data.tax !== undefined || data.discount !== undefined) {
      const items = await prisma.rentalItem.findMany({
        where: { rentalOrderId: id },
        include: { vehicle: true },
      });
      const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal), 0);
      const securityDeposit = items.reduce(
        (acc, item) => acc + Number(item.vehicle?.securityDeposit || 0),
        0
      );
      const tax = data.tax !== undefined ? Number(data.tax) : Number(order.tax);
      const discount =
        data.discount !== undefined ? Number(data.discount) : Number(order.discount);
      const lateFee = Number(order.lateFee || 0);

      updateData.subtotal = subtotal;
      updateData.securityDeposit = securityDeposit;
      updateData.grandTotal = subtotal + tax - discount + securityDeposit + lateFee;
    }

    const updated = await roRepository.update(id, updateData);

    if (updateData.grandTotal !== undefined) {
      await syncOrderPaymentStatus(prisma, id);
    }

    return updated;
  }

  async updateStatus(id, status, user) {
    const order = await roRepository.findById(id);
    if (!order) throw new ApiError(404, 'Rental order not found');
    if (order.status === 'CANCELLED') throw new ApiError(400, 'Cancelled orders cannot be modified');
    if (order.status === 'COMPLETED') throw new ApiError(400, 'Completed orders cannot be edited');

    if (status === 'CONFIRMED' && user.role !== 'ADMIN') {
      throw new ApiError(403, 'Only ADMIN can confirm booking');
    }

    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.rentalOrder.update({
        where: { id },
        data: { status }
      });

      // If status becomes CONFIRMED, mark vehicles as RESERVED (BOOKED)
      if (status === 'CONFIRMED') {
        const items = await tx.rentalItem.findMany({ where: { rentalOrderId: id } });
        for (const item of items) {
          await tx.vehicle.update({
            where: { id: item.vehicleId },
            data: { availabilityStatus: 'BOOKED' }
          });
        }
      }

      // If status becomes CANCELLED, release vehicles
      if (status === 'CANCELLED') {
        const items = await tx.rentalItem.findMany({ where: { rentalOrderId: id } });
        for (const item of items) {
          await tx.vehicle.update({
            where: { id: item.vehicleId },
            data: { availabilityStatus: 'AVAILABLE' }
          });
        }
      }

      return updatedOrder;
    });
  }

  async delete(id) {
    const order = await roRepository.findById(id);
    if (!order) throw new ApiError(404, 'Rental order not found');
    if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
      throw new ApiError(400, 'Only pending or cancelled orders can be deleted');
    }
    await roRepository.delete(id);
    return true;
  }

  async recalculate(id) {
    const order = await roRepository.findById(id);
    if (!order) throw new ApiError(404, 'Rental order not found');

    const result = await recalculateOrderTotals(prisma, id);
    if (!result) throw new ApiError(404, 'Rental order not found');

    return result;
  }
}
export default new RentalOrderService();
