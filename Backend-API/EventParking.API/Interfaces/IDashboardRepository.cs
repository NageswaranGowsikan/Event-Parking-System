using static EventParking.API.DTOs.DashboardDTOs;

namespace EventParking.API.Interfaces
{
    public interface IDashboardRepository
    {
        Task<int> GetTotalEventsAsync();

        Task<int> GetTotalBookingsAsync();

        Task<int> GetAvailableSeatsAsync();

        Task<int> GetOccupiedParkingSlotsAsync();

        Task<decimal> GetTotalRevenueAsync();

        Task<int> GetTotalCustomersAsync();

        Task<bool> CustomerExistsAsync(int customerId);

        Task<List<UpcomingBookingDto>> GetUpcomingBookingsAsync(
            int customerId);

        Task<List<ReservedParkingDto>> GetReservedParkingAsync(
            int customerId);

        Task<List<RecentPaymentDto>> GetRecentPaymentsAsync(
            int customerId);

        Task<int> GetUnreadNotificationCountAsync(
            int customerId);
    }
}