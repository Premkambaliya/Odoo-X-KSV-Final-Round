import prisma from '../../config/db.js';

class QuotationRepository {
  async getOrder(orderId) {
    return prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        rentalPeriod: true,
        rentalItems: { include: { vehicle: true } },
      },
    });
  }

  async create(data) {
    return prisma.quotation.create({ data, include: { customer: true } });
  }

  async findById(id) {
    return prisma.quotation.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  async findByOrderId(rentalOrderId) {
    const quotations = await prisma.quotation.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return (
      quotations.find((q) => {
        try {
          const notes = q.notes ? JSON.parse(q.notes) : null;
          return notes?.rentalOrderId === rentalOrderId;
        } catch {
          return false;
        }
      }) || null
    );
  }

  async getCompanySettings() {
    return prisma.organizationSetting.findFirst();
  }

  async generateQuotationNumber() {
    const count = await prisma.quotation.count();
    return `QTN-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
  }
}
export default new QuotationRepository();
