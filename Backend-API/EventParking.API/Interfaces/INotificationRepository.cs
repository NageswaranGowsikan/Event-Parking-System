using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(int id);

        Task<List<Notification>> GetByCustomerAsync(int customerId);

        Task<List<Notification>> GetUnreadByCustomerAsync(int customerId);

        Task AddAsync(Notification notification);

        Task UpdateAsync(Notification notification);

        Task DeleteAsync(Notification notification);

        Task MarkAllAsReadAsync(int customerId);
    }
}