using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface IBookingService
    {
        Task<Booking?> GetBookingByIdAsync(int id);

        Task<List<Booking>> GetCustomerBookingsAsync(int customerId);

        Task<List<Booking>> GetAllBookingsAsync();

        Task<Booking> CreateBookingAsync(
            int customerId,
            decimal totalAmount);

        Task<bool> UpdateBookingStatusAsync(
            int bookingId,
            string status);

        Task<int> ExpirePendingBookingsAsync();
    }
}