using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly AppDbContext _context;

        public NotificationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Notification?> GetByIdAsync(int id)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Notification>> GetByCustomerAsync(
            int customerId)
        {
            return await _context.Notifications
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Notification>> GetUnreadByCustomerAsync(
            int customerId)
        {
            return await _context.Notifications
                .Where(x =>
                    x.CustomerId == customerId &&
                    !x.IsRead)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Notification notification)
        {
            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Notification notification)
        {
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
        }

        public async Task MarkAllAsReadAsync(int customerId)
        {
            var notifications = await _context.Notifications
                .Where(x =>
                    x.CustomerId == customerId &&
                    !x.IsRead)
                .ToListAsync();

            var now = DateTime.UtcNow;

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = now;
            }

            await _context.SaveChangesAsync();
        }
    }
}