import itemRepository from './rentalItems.repository.js';
import prisma from '../../config/db.js';

class AvailabilityService {
  async checkVehicleAvailability(vehicleId, pickupDate, returnDate) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return { available: false, reason: 'Vehicle not found' };
    
    if (vehicle.availabilityStatus !== 'AVAILABLE') {
      return { available: false, reason: `Vehicle is currently ${vehicle.availabilityStatus}` };
    }

    const overlap = await itemRepository.findOverlappingBookings(vehicleId, pickupDate, returnDate);
    if (overlap) {
      return { available: false, reason: 'Booking Conflict: Vehicle already booked for overlapping dates' };
    }

    return { available: true, reason: 'Available' };
  }
}
export default new AvailabilityService();
