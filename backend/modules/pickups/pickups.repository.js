import prisma from '../../config/db.js';

class PickupRepository {
  async getOrder(orderId) {
    return prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: { pickup: true, rentalItems: { include: { vehicle: true } } }
    });
  }

  async findAll({ skip, take, where, orderBy }) {
    return prisma.$transaction([
      prisma.pickup.count({ where }),
      prisma.pickup.findMany({
        skip, take, where, orderBy,
        include: { rentalOrder: { include: { customer: true, rentalItems: { include: { vehicle: true } } } } }
      })
    ]);
  }

  async findById(id) {
    return prisma.pickup.findUnique({
      where: { id },
      include: { rentalOrder: { include: { customer: true, rentalItems: { include: { vehicle: true } } } } }
    });
  }

  async update(id, data) {
    return prisma.pickup.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.pickup.delete({ where: { id } });
  }
}
export default new PickupRepository();
