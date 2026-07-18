import prisma from '../../config/db.js';

class RentalItemRepository {
  async findOverlappingBookings(vehicleId, pickupDate, returnDate) {
    return prisma.rentalItem.findFirst({
      where: {
        vehicleId,
        rentalOrder: {
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          OR: [
            { pickupDate: { lte: returnDate }, expectedReturnDate: { gte: pickupDate } }
          ]
        }
      },
      include: { rentalOrder: true }
    });
  }

  async getOrder(orderId) {
    return prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: { rentalPeriod: true, rentalItems: true }
    });
  }
}
export default new RentalItemRepository();
