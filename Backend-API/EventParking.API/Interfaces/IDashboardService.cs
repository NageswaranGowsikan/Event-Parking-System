using static EventParking.API.DTOs.DashboardDTOs;

namespace EventParking.API.Interfaces
{
    public interface IDashboardService
    {
        Task<AdminDashboardDto> GetAdminDashboardAsync();

        Task<CustomerDashboardDto> GetCustomerDashboardAsync(
            int customerId);
    }
}