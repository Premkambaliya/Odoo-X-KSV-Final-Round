import itemRepository from './rentalItems.repository.js';
import availabilityService from './availability.service.js';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

async function recalculateOrderTotals(tx, orderId, orderSnapshot) {
  const allItems = await tx.rentalItem.findMany({
    where: { rentalOrderId: orderId },
    include: { vehicle: true },
  });

  const orderSubtotal = allItems.reduce(
    (acc, curr) => acc + Number(curr.subtotal),
    0
  );
  const securityDeposit = allItems.reduce(
    (acc, curr) => acc + Number(curr.vehicle?.securityDeposit || 0),
    0
  );
  const tax = Number(orderSnapshot.tax || 0);
  const discount = Number(orderSnapshot.discount || 0);
  const lateFee = Number(orderSnapshot.lateFee || 0);
  const grandTotal = orderSubtotal + tax - discount + securityDeposit + lateFee;

  await tx.rentalOrder.update({
    where: { id: orderId },
    data: {
      subtotal: orderSubtotal,
      securityDeposit,
      grandTotal,
    },
  });

  return { orderSubtotal, securityDeposit, grandTotal };
}

class RentalItemService {
  async addRentalItem(orderId, vehicleId) {
    const order = await itemRepository.getOrder(orderId);
    if (!order) throw new ApiError(404, 'Rental order not found');

    if (order.status !== 'PENDING') {
      throw new ApiError(400, 'Can only add items to PENDING orders');
    }

    const availability = await availabilityService.checkVehicleAvailability(
      vehicleId,
      order.pickupDate,
      order.expectedReturnDate
    );

    if (!availability.available) {
      throw new ApiError(400, availability.reason);
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    const rentalPeriodDays = order.rentalPeriod.days;
    const unitPrice = Number(vehicle.basePrice) * rentalPeriodDays;
    const quantity = 1;
    const subtotal = unitPrice * quantity;

    return prisma.$transaction(async (tx) => {
      const item = await tx.rentalItem.create({
        data: {
          rentalOrderId: orderId,
          vehicleId,
          quantity,
          unitPrice,
          subtotal,
        },
      });

      await recalculateOrderTotals(tx, orderId, order);

      return item;
    });
  }

  async getItems(orderId) {
    const items = await prisma.rentalItem.findMany({
      where: { rentalOrderId: orderId },
      include: { vehicle: true },
    });
    return items;
  }

  async removeItem(itemId) {
    const item = await prisma.rentalItem.findUnique({
      where: { id: itemId },
      include: { rentalOrder: true },
    });
    if (!item) throw new ApiError(404, 'Rental item not found');
    if (item.rentalOrder.status !== 'PENDING') {
      throw new ApiError(400, 'Cannot remove items from non-pending orders');
    }

    return prisma.$transaction(async (tx) => {
      await tx.rentalItem.delete({ where: { id: itemId } });
      await recalculateOrderTotals(tx, item.rentalOrderId, item.rentalOrder);
      return true;
    });
  }
}

export default new RentalItemService();
