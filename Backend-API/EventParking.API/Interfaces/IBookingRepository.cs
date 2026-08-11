using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface IBookingRepository
    {
        Task<Booking?> GetByIdAsync(int id);

        Task<Booking?> GetByReferenceAsync(string bookingReference);

        Task<List<Booking>> GetByCustomerIdAsync(int customerId);

        Task<List<Booking>> GetAllAsync();

        Task<List<Booking>> GetExpiredPendingBookingsAsync(DateTime utcNow);

        Task AddAsync(Booking booking);

        Task UpdateAsync(Booking booking);
    }
}