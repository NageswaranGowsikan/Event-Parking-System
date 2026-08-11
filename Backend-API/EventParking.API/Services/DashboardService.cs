using EventParking.API.Interfaces;
using static EventParking.API.DTOs.DashboardDTOs;

namespace EventParking.API.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;

        public DashboardService(
            IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<AdminDashboardDto>
            GetAdminDashboardAsync()
        {
            var totalEvents =
                await _dashboardRepository.GetTotalEventsAsync();

            var totalBookings =
                await _dashboardRepository.GetTotalBookingsAsync();

            var availableSeats =
                await _dashboardRepository.GetAvailableSeatsAsync();

            var occupiedParkingSlots =
                await _dashboardRepository
                    .GetOccupiedParkingSlotsAsync();

            var totalRevenue =
                await _dashboardRepository.GetTotalRevenueAsync();

            var totalCustomers =
                await _dashboardRepository.GetTotalCustomersAsync();

            return new AdminDashboardDto(
                totalEvents,
                totalBookings,
                availableSeats,
                occupiedParkingSlots,
                totalRevenue,
                totalCustomers
            );
        }

        public async Task<CustomerDashboardDto>
            GetCustomerDashboardAsync(int customerId)
        {
            var customerExists =
                await _dashboardRepository
                    .CustomerExistsAsync(customerId);

            if (!customerExists)
            {
                throw new KeyNotFoundException(
                    "Customer not found.");
            }

            var upcomingBookings =
                await _dashboardRepository
                    .GetUpcomingBookingsAsync(customerId);

            var reservedParking =
                await _dashboardRepository
                    .GetReservedParkingAsync(customerId);

            var recentPayments =
                await _dashboardRepository
                    .GetRecentPaymentsAsync(customerId);

            var unreadNotificationCount =
                await _dashboardRepository
                    .GetUnreadNotificationCountAsync(customerId);

            return new CustomerDashboardDto(
                customerId,
                upcomingBookings,
                reservedParking,
                recentPayments,
                unreadNotificationCount
            );
        }
    }
}