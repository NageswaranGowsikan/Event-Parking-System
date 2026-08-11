using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface IPaymentRepository
    {
        Task<Payment?> GetByIdAsync(int id);

        Task<Payment?> GetByBookingIdAsync(int bookingId);

        Task<List<Payment>> GetByCustomerIdAsync(int customerId);

        Task<Payment> AddAndConfirmBookingAsync(Payment payment, Booking booking);
    }
}