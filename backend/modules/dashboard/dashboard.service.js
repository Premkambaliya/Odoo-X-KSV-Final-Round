import dRepository from './dashboard.repository.js';
import prisma from '../../config/db.js';

class DashboardService {
  async getOverview() {
    const [
      [totalVehicles, availableVehicles, bookedVehicles, maintenanceVehicles],
      totalCustomers,
      [totalRentals, activeRentals, completedRentals, cancelledRentals, pendingRentals],
      revenue
    ] = await Promise.all([
      dRepository.getVehicleStats(),
      dRepository.getCustomerCount(),
      dRepository.getRentalStats(),
      dRepository.getRevenueStats()
    ]);

    const paymentsStats = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: 'PENDING' } // assuming logic for pending payments, though payments table only has SUCCESS usually if completed
    });

    return {
      vehicles: { total: totalVehicles, available: availableVehicles, reserved: bookedVehicles, rented: bookedVehicles, maintenance: maintenanceVehicles },
      customers: { total: totalCustomers },
      rentals: { total: totalRentals, active: activeRentals, completed: completedRentals, cancelled: cancelledRentals, pending: pendingRentals },
      revenue: { total: revenue.total, today: revenue.today, monthly: revenue.month },
      payments: { pendingAmount: paymentsStats._sum.amount || 0 }
    };
  }

  async getRevenue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const [todayRev, weekRev, monthRev, yearRev] = await prisma.$transaction([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'SUCCESS', paidAt: { gte: today } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'SUCCESS', paidAt: { gte: firstDayOfWeek } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'SUCCESS', paidAt: { gte: firstDayOfMonth } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'SUCCESS', paidAt: { gte: firstDayOfYear } } })
    ]);

    return {
      today: todayRev._sum.amount || 0,
      weekly: weekRev._sum.amount || 0,
      monthly: monthRev._sum.amount || 0,
      yearly: yearRev._sum.amount || 0
    };
  }

  async getRentals() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [pickups, returns] = await prisma.$transaction([
      prisma.rentalOrder.count({ where: { pickupDate: { gte: today, lt: tomorrow } } }),
      prisma.rentalOrder.count({ where: { expectedReturnDate: { gte: today, lt: tomorrow } } })
    ]);

    return {
      todayPickups: pickups,
      todayReturns: returns
    };
  }

  async getVehicles() {
    const categories = await prisma.category.findMany({ include: { _count: { select: { vehicles: true } } } });
    const formatted = categories.map(c => ({ category: c.name, count: c._count.vehicles }));
    return { byCategory: formatted };
  }

  async getPayments() {
    const [success, pending, refunded] = await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'SUCCESS' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'PENDING' } }), // approximation
      prisma.securityDeposit.aggregate({ _sum: { amountRefunded: true } })
    ]);
    return {
      totalPaid: success._sum.amount || 0,
      pendingAmount: pending._sum.amount || 0,
      refundAmount: refunded._sum.amountRefunded || 0
    };
  }
}
export default new DashboardService();
