import rRepository from './returns.repository.js';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { syncOrderPaymentStatus } from '../../utils/orderTotals.js';

class ReturnService {
  async create(data) {
    const order = await rRepository.getOrder(data.rentalOrderId);
    if (!order) throw new ApiError(404, 'Rental order not found');
    
    if (order.status !== 'ACTIVE') {
      throw new ApiError(400, 'Rental order must be ACTIVE to be returned');
    }
    
    if (!order.pickup) {
      throw new ApiError(400, 'Vehicle must have a pickup record before it can be returned');
    }

    if (order.return) {
      throw new ApiError(400, 'Return has already been processed for this order');
    }

    const returnTime = new Date(data.returnTime);
    if (returnTime < new Date(order.pickup.pickupTime)) {
      throw new ApiError(400, 'Return date must be after pickup date');
    }

    if (data.odometerReading < order.pickup.odometerReading) {
      throw new ApiError(400, 'Return odometer reading cannot be less than pickup reading');
    }

    return prisma.$transaction(async (tx) => {
      // Create Return record
      const returnRecord = await tx.return.create({
        data: {
          rentalOrderId: data.rentalOrderId,
          executiveName: data.executiveName,
          returnTime: returnTime,
          odometerReading: data.odometerReading,
          fuelLevel: data.fuelLevel,
          vehicleCondition: data.vehicleCondition,
          damageCharge: data.damageCharge || 0,
          lateCharge: data.lateCharge || 0,
          remarks: data.remarks
        }
      });

      // Update Order Status to COMPLETED
      // Also apply damage and late charges to grandTotal
      const damageCharge = data.damageCharge ? Number(data.damageCharge) : 0;
      const lateCharge = data.lateCharge ? Number(data.lateCharge) : 0;

      const orderUpdateData = {
        status: 'COMPLETED',
        actualReturnDate: returnTime,
      };

      if (damageCharge > 0 || lateCharge > 0) {
        // Late + damage charges increase amount owed on the rental order
        orderUpdateData.grandTotal =
          Number(order.grandTotal) + lateCharge + damageCharge;
        orderUpdateData.lateFee = Number(order.lateFee) + lateCharge;
      }

      await tx.rentalOrder.update({
        where: { id: data.rentalOrderId },
        data: orderUpdateData
      });

      // Charges may reopen balance — keep paymentStatus in sync
      await syncOrderPaymentStatus(tx, data.rentalOrderId);

      // Release Vehicles back to AVAILABLE
      for (const item of order.rentalItems) {
        await tx.vehicle.update({
          where: { id: item.vehicleId },
          data: { availabilityStatus: 'AVAILABLE' }
        });
      }

      return returnRecord;
    });
  }

  async getAll(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.orderNumber) where.rentalOrder = { bookingNumber: { contains: query.orderNumber, mode: 'insensitive' } };
    if (query.customerName) {
      where.rentalOrder = {
        ...where.rentalOrder,
        customer: {
          OR: [
            { firstName: { contains: query.customerName, mode: 'insensitive' } },
            { lastName: { contains: query.customerName, mode: 'insensitive' } }
          ]
        }
      };
    }
    if (query.vehicleRegistration) {
      where.rentalOrder = {
        ...where.rentalOrder,
        rentalItems: { some: { vehicle: { registrationNumber: { contains: query.vehicleRegistration, mode: 'insensitive' } } } }
      };
    }
    if (query.date) {
      const d = new Date(query.date);
      where.returnTime = { gte: new Date(d.setHours(0,0,0,0)), lte: new Date(d.setHours(23,59,59,999)) };
    }

    let orderBy = {};
    if (query.sortBy === 'createdAt') orderBy = { id: 'desc' };
    else if (query.sortBy === 'date') orderBy = { returnTime: 'desc' };
    else orderBy = { returnTime: 'desc' };

    const [total, returns] = await rRepository.findAll({ skip, take: limit, where, orderBy });
    return {
      returns,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getById(id) {
    const returnRecord = await rRepository.findById(id);
    if (!returnRecord) throw new ApiError(404, 'Return record not found');
    return returnRecord;
  }

  async update(id, data) {
    const returnRecord = await rRepository.findById(id);
    if (!returnRecord) throw new ApiError(404, 'Return record not found');
    
    const updateData = { ...data };
    if (data.returnTime) updateData.returnTime = new Date(data.returnTime);
    
    return rRepository.update(id, updateData);
  }

  async delete(id) {
    const returnRecord = await rRepository.findById(id);
    if (!returnRecord) throw new ApiError(404, 'Return record not found');
    
    return prisma.$transaction(async (tx) => {
      await tx.return.delete({ where: { id } });

      // Rollback status to ACTIVE
      await tx.rentalOrder.update({
        where: { id: returnRecord.rentalOrderId },
        data: { status: 'ACTIVE', actualReturnDate: null }
      });

      // Rollback vehicles to BOOKED (assuming they were booked when picked up)
      const order = await tx.rentalOrder.findUnique({ 
        where: { id: returnRecord.rentalOrderId },
        include: { rentalItems: true }
      });
      for (const item of order.rentalItems) {
        await tx.vehicle.update({
          where: { id: item.vehicleId },
          data: { availabilityStatus: 'BOOKED' }
        });
      }
      
      return true;
    });
  }
}
export default new ReturnService();
