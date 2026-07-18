import prisma from '../../config/db.js';

class ReturnRepository {
  async getOrder(orderId) {
    return prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: { pickup: true, return: true, rentalItems: { include: { vehicle: true } } }
    });
  }

  async findAll({ skip, take, where, orderBy }) {
    return prisma.$transaction([
      prisma.return.count({ where }),
      prisma.return.findMany({
        skip, take, where, orderBy,
        include: { rentalOrder: { include: { customer: true, rentalItems: { include: { vehicle: true } } } } }
      })
    ]);
  }

  async findById(id) {
    return prisma.return.findUnique({
      where: { id },
      include: { rentalOrder: { include: { customer: true, rentalItems: { include: { vehicle: true } } } } }
    });
  }

  async update(id, data) {
    return prisma.return.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.return.delete({ where: { id } });
  }
}
export default new ReturnRepository();
