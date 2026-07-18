import prisma from '../../config/db.js';

class RentalOrderRepository {
  async create(data) {
    return prisma.rentalOrder.create({
      data,
      include: { customer: true, rentalPeriod: true }
    });
  }

  async findAll({ skip, take, where, orderBy }) {
    return prisma.$transaction([
      prisma.rentalOrder.count({ where }),
      prisma.rentalOrder.findMany({
        skip, take, where, orderBy,
        include: { customer: true, rentalPeriod: true, rentalItems: true }
      })
    ]);
  }

  async findById(id) {
    return prisma.rentalOrder.findUnique({
      where: { id },
      include: { 
        customer: true, 
        rentalPeriod: true, 
        rentalItems: { include: { vehicle: true } }
      }
    });
  }

  async update(id, data) {
    return prisma.rentalOrder.update({
      where: { id },
      data,
      include: { customer: true, rentalPeriod: true, rentalItems: true }
    });
  }

  async delete(id) {
    return prisma.rentalOrder.delete({ where: { id } });
  }

  async generateBookingNumber() {
    const count = await prisma.rentalOrder.count();
    return `BKG-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
  }
}
export default new RentalOrderRepository();
