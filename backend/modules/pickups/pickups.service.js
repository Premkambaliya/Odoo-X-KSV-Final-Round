import pRepository from './pickups.repository.js';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

class PickupService {
  async create(data) {
    const order = await pRepository.getOrder(data.rentalOrderId);
    if (!order) throw new ApiError(404, 'Rental order not found');
    
    if (order.status !== 'CONFIRMED') {
      throw new ApiError(400, 'Rental order must be CONFIRMED before pickup');
    }
    
    if (order.pickup) {
      throw new ApiError(400, 'Pickup has already been completed for this order');
    }

    if (new Date(data.pickupTime) < new Date(order.pickupDate)) {
      throw new ApiError(400, 'Pickup date cannot be before booking date');
    }

    // Verify all vehicles are AVAILABLE or BOOKED (they become BOOKED when CONFIRMED)
    for (const item of order.rentalItems) {
      if (!['AVAILABLE', 'BOOKED'].includes(item.vehicle.availabilityStatus)) {
        throw new ApiError(400, `Vehicle ${item.vehicle.registrationNumber} is not ready for pickup (Status: ${item.vehicle.availabilityStatus})`);
      }
    }

    return prisma.$transaction(async (tx) => {
      // Create Pickup record
      const pickup = await tx.pickup.create({
        data: {
          rentalOrderId: data.rentalOrderId,
          executiveName: data.executiveName,
          pickupTime: new Date(data.pickupTime),
          odometerReading: data.odometerReading,
          fuelLevel: data.fuelLevel,
          customerVerified: data.customerVerified || false,
          remarks: data.remarks
        }
      });

      // Update Order Status to ACTIVE
      await tx.rentalOrder.update({
        where: { id: data.rentalOrderId },
        data: { status: 'ACTIVE' }
      });

      // Update Vehicle statuses (assuming BOOKED acts as RENTED)
      for (const item of order.rentalItems) {
        await tx.vehicle.update({
          where: { id: item.vehicleId },
          data: { availabilityStatus: 'BOOKED' } // schema has no RENTED
        });
      }

      return pickup;
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
      where.pickupTime = { gte: new Date(d.setHours(0,0,0,0)), lte: new Date(d.setHours(23,59,59,999)) };
    }

    let orderBy = {};
    if (query.sortBy === 'createdAt') orderBy = { id: 'desc' }; // approximation if no createdAt on pickup
    else if (query.sortBy === 'date') orderBy = { pickupTime: 'desc' };
    else orderBy = { pickupTime: 'desc' };

    const [total, pickups] = await pRepository.findAll({ skip, take: limit, where, orderBy });
    return {
      pickups,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getById(id) {
    const pickup = await pRepository.findById(id);
    if (!pickup) throw new ApiError(404, 'Pickup not found');
    return pickup;
  }

  async update(id, data) {
    const pickup = await pRepository.findById(id);
    if (!pickup) throw new ApiError(404, 'Pickup not found');
    
    const updateData = { ...data };
    if (data.pickupTime) updateData.pickupTime = new Date(data.pickupTime);
    
    return pRepository.update(id, updateData);
  }

  async delete(id) {
    const pickup = await pRepository.findById(id);
    if (!pickup) throw new ApiError(404, 'Pickup not found');
    
    return prisma.$transaction(async (tx) => {
      await tx.pickup.delete({ where: { id } });

      // Rollback status
      await tx.rentalOrder.update({
        where: { id: pickup.rentalOrderId },
        data: { status: 'CONFIRMED' }
      });
      // Assuming vehicle goes back to BOOKED (it already is, since confirmed)
      
      return true;
    });
  }
}
export default new PickupService();
