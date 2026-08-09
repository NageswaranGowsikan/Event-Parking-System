using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Repositories
{
    public class ParkingRepository : IParkingRepository
    {
        private readonly AppDbContext _context;

        public ParkingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ParkingSlot?> GetSlotByIdAsync(int id)
        {
            return await _context.ParkingSlots
                .Include(x => x.Venue)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<ParkingSlot>> GetSlotsByVenueAsync(
            int venueId)
        {
            return await _context.ParkingSlots
                .Include(x => x.Venue)
                .Where(x => x.VenueId == venueId && x.IsActive)
                .OrderBy(x => x.Zone)
                .ThenBy(x => x.SlotNumber)
                .ToListAsync();
        }

        public async Task<bool> SlotNumberExistsAsync(
            int venueId,
            string slotNumber)
        {
            return await _context.ParkingSlots.AnyAsync(x =>
                x.VenueId == venueId &&
                x.SlotNumber == slotNumber);
        }

        public async Task<bool> IsSlotAvailableAsync(
            int parkingSlotId,
            DateTime start,
            DateTime end,
            int? excludeReservationId = null)
        {
            return !await _context.ParkingReservations.AnyAsync(x =>
                x.ParkingSlotId == parkingSlotId &&
                x.Status != "Cancelled" &&
                (!excludeReservationId.HasValue ||
                 x.Id != excludeReservationId.Value) &&
                x.StartDateTime < end &&
                x.EndDateTime > start);
        }

        public async Task AddSlotAsync(ParkingSlot slot)
        {
            _context.ParkingSlots.Add(slot);
            await _context.SaveChangesAsync();
        }

        public async Task<ParkingReservation?> GetReservationByIdAsync(
            int id)
        {
            return await _context.ParkingReservations
                .Include(x => x.ParkingSlot)
                .Include(x => x.Event)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<ParkingReservation>>
            GetReservationsByCustomerAsync(int customerId)
        {
            return await _context.ParkingReservations
                .Include(x => x.ParkingSlot)
                .Include(x => x.Event)
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task AddReservationAsync(
            ParkingReservation reservation)
        {
            _context.ParkingReservations.Add(reservation);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateReservationAsync(
            ParkingReservation reservation)
        {
            reservation.UpdatedAt = DateTime.UtcNow;
            _context.ParkingReservations.Update(reservation);
            await _context.SaveChangesAsync();
        }
    }
}