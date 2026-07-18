import prisma from '../../config/db.js';

class DashboardRepository {
  async getVehicleStats() {
    return prisma.$transaction([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { availabilityStatus: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { availabilityStatus: 'BOOKED' } }),
      prisma.vehicle.count({ where: { availabilityStatus: 'UNDER_MAINTENANCE' } })
    ]);
  }

  async getCustomerCount() {
    return prisma.user.count({ where: { role: 'CUSTOMER' } });
  }

  async getRentalStats() {
    return prisma.$transaction([
      prisma.rentalOrder.count(),
      prisma.rentalOrder.count({ where: { status: 'ACTIVE' } }),
      prisma.rentalOrder.count({ where: { status: 'COMPLETED' } }),
      prisma.rentalOrder.count({ where: { status: 'CANCELLED' } }),
      prisma.rentalOrder.count({ where: { status: 'PENDING' } })
    ]);
  }

  async getRevenueStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, todayRev, monthRev] = await prisma.$transaction([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'SUCCESS' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'SUCCESS', paidAt: { gte: today } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'SUCCESS', paidAt: { gte: firstDayOfMonth } } })
    ]);

    return {
      total: total._sum.amount || 0,
      today: todayRev._sum.amount || 0,
      month: monthRev._sum.amount || 0
    };
  }
}
export default new DashboardRepository();
