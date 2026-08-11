using EventParking.API.Interfaces;
using EventParking.API.Models;

namespace EventParking.API.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly ICustomerRepository _customerRepository;

        public BookingService(
            IBookingRepository bookingRepository,
            ICustomerRepository customerRepository)
        {
            _bookingRepository = bookingRepository;
            _customerRepository = customerRepository;
        }

        public async Task<Booking?> GetBookingByIdAsync(int id)
        {
            return await _bookingRepository.GetByIdAsync(id);
        }

        public async Task<List<Booking>> GetCustomerBookingsAsync(int customerId)
        {
            return await _bookingRepository.GetByCustomerIdAsync(customerId);
        }

        public async Task<List<Booking>> GetAllBookingsAsync()
        {
            return await _bookingRepository.GetAllAsync();
        }

        public async Task<Booking> CreateBookingAsync(
            int customerId,
            decimal totalAmount)
        {
            var customer =
                await _customerRepository.GetByIdAsync(customerId);

            if (customer == null)
                throw new Exception("Customer not found");

            if (customer.Status != "Active")
                throw new Exception(
                    "Only active customers can create bookings");

            if (totalAmount < 0)
                throw new Exception(
                    "Booking amount cannot be negative");

            var now = DateTime.UtcNow;

            var bookingReference =
                await GenerateBookingReferenceAsync();

            var booking = new Booking
            {
                BookingReference = bookingReference,
                CustomerId = customerId,
                TotalAmount = totalAmount,
                Status = "Pending",
                CreatedAt = now,
                UpdatedAt = now,
                ExpiresAt = now.AddMinutes(15)
            };

            await _bookingRepository.AddAsync(booking);

            return booking;
        }

        public async Task<bool> UpdateBookingStatusAsync(
            int bookingId,
            string status)
        {
            var booking =
                await _bookingRepository.GetByIdAsync(bookingId);

            if (booking == null)
                return false;

            var requestedStatus =
                NormalizeStatus(status);

            if (requestedStatus == null)
                throw new Exception("Invalid booking status");

            // A pending booking cannot be confirmed after
            // its 15-minute hold has already expired.
            if (booking.Status == "Pending" &&
                booking.ExpiresAt <= DateTime.UtcNow &&
                requestedStatus != "Expired")
            {
                booking.Status = "Expired";

                await _bookingRepository.UpdateAsync(booking);

                return false;
            }

            if (!CanTransition(
                    booking.Status,
                    requestedStatus))
            {
                return false;
            }

            booking.Status = requestedStatus;

            await _bookingRepository.UpdateAsync(booking);

            return true;
        }

        public async Task<int> ExpirePendingBookingsAsync()
        {
            var expiredBookings =
                await _bookingRepository
                    .GetExpiredPendingBookingsAsync(
                        DateTime.UtcNow);

            foreach (var booking in expiredBookings)
            {
                booking.Status = "Expired";

                await _bookingRepository.UpdateAsync(booking);
            }

            return expiredBookings.Count;
        }

        private async Task<string>
            GenerateBookingReferenceAsync()
        {
            string bookingReference;

            do
            {
                bookingReference =
                    $"BKG-{DateTime.UtcNow:yyyyMMddHHmmss}-" +
                    $"{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
            }
            while (await _bookingRepository
                .GetByReferenceAsync(bookingReference) != null);

            return bookingReference;
        }

        private static string? NormalizeStatus(
            string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return null;

            return status.Trim().ToLowerInvariant() switch
            {
                "pending" => "Pending",
                "confirmed" => "Confirmed",
                "cancelled" => "Cancelled",
                "expired" => "Expired",
                _ => null
            };
        }

        private static bool CanTransition(
            string currentStatus,
            string requestedStatus)
        {
            if (currentStatus == requestedStatus)
                return true;

            return currentStatus switch
            {
                "Pending" =>
                    requestedStatus is
                        "Confirmed" or
                        "Cancelled" or
                        "Expired",

                "Confirmed" =>
                    requestedStatus == "Cancelled",

                "Cancelled" => false,

                "Expired" => false,

                _ => false
            };
        }
    }
}