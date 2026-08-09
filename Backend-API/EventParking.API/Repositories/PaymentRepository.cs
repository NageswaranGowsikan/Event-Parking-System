using EventParking.API.Data;
using EventParking.API.Exceptions;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly AppDbContext _context;

        public PaymentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Payment?> GetByIdAsync(int id) =>
            await _context.Payments
                .AsNoTracking()
                .Include(p => p.Booking)
                .ThenInclude(b => b!.Customer)
                .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<Payment?> GetByBookingIdAsync(int bookingId) =>
            await _context.Payments
                .AsNoTracking()
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.BookingId == bookingId);

        public async Task<List<Payment>> GetByCustomerIdAsync(int customerId) =>
            await _context.Payments
                .AsNoTracking()
                .Include(p => p.Booking)
                .Where(p => p.Booking != null && p.Booking.CustomerId == customerId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

        public async Task<Payment> AddAndConfirmBookingAsync(
            Payment payment,
            Booking booking)
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                await _context.Payments.AddAsync(payment);

                booking.Status = "Confirmed";
                booking.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return payment;
            }
            catch (DbUpdateException ex) when (
                ex.InnerException is SqlException sqlException &&
                (sqlException.Number == 2601 || sqlException.Number == 2627))
            {
                await transaction.RollbackAsync();
                throw new PaymentConflictException(
                    "A payment has already been recorded for this booking.");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}