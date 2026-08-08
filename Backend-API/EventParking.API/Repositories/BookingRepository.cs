using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly AppDbContext _context;

        public BookingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetByIdAsync(int id) =>
            await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == id);

        public async Task<Booking?> GetByReferenceAsync(string bookingReference) =>
            await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingReference == bookingReference);

        public async Task<List<Booking>> GetByCustomerIdAsync(int customerId) =>
            await _context.Bookings
                .Where(b => b.CustomerId == customerId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

        public async Task<List<Booking>> GetAllAsync() =>
            await _context.Bookings
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

        public async Task<List<Booking>> GetExpiredPendingBookingsAsync(DateTime utcNow) =>
            await _context.Bookings
                .Where(b =>
                    b.Status == "Pending" &&
                    b.ExpiresAt <= utcNow)
                .ToListAsync();

        public async Task AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Booking booking)
        {
            booking.UpdatedAt = DateTime.UtcNow;

            _context.Bookings.Update(booking);

            await _context.SaveChangesAsync();
        }
    }
}