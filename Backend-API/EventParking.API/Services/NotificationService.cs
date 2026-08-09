using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class NotificationService
    {
        private readonly INotificationRepository _repository;
        private readonly AppDbContext _context;

        public NotificationService(
            INotificationRepository repository,
            AppDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<NotificationResponseDto> CreateAsync(
            CreateNotificationDto request)
        {
            var customerExists =
                await _context.Customers.AnyAsync(
                    x => x.Id == request.CustomerId);

            if (!customerExists)
                throw new Exception("Customer not found");

            if (string.IsNullOrWhiteSpace(request.Title))
                throw new Exception("Notification title is required");

            if (string.IsNullOrWhiteSpace(request.Message))
                throw new Exception("Notification message is required");

            var notification = new Notification
            {
                CustomerId = request.CustomerId,
                Type = string.IsNullOrWhiteSpace(request.Type)
                    ? "General"
                    : request.Type.Trim(),
                Title = request.Title.Trim(),
                Message = request.Message.Trim(),
                RelatedEntityType = request.RelatedEntityType,
                RelatedEntityId = request.RelatedEntityId
            };

            await _repository.AddAsync(notification);

            return Map(notification);
        }

        public async Task CreateSystemNotificationAsync(
            int customerId,
            string type,
            string title,
            string message,
            string? relatedEntityType = null,
            int? relatedEntityId = null)
        {
            await CreateAsync(new CreateNotificationDto
            {
                CustomerId = customerId,
                Type = type,
                Title = title,
                Message = message,
                RelatedEntityType = relatedEntityType,
                RelatedEntityId = relatedEntityId
            });
        }

        public async Task<List<NotificationResponseDto>>
            GetCustomerNotificationsAsync(int customerId)
        {
            var items =
                await _repository.GetByCustomerAsync(customerId);

            return items.Select(Map).ToList();
        }

        public async Task<List<NotificationResponseDto>>
            GetUnreadAsync(int customerId)
        {
            var items =
                await _repository.GetUnreadByCustomerAsync(customerId);

            return items.Select(Map).ToList();
        }

        public async Task<NotificationResponseDto> MarkAsReadAsync(
            int id)
        {
            var notification =
                await _repository.GetByIdAsync(id)
                ?? throw new Exception("Notification not found");

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;

                await _repository.UpdateAsync(notification);
            }

            return Map(notification);
        }

        public async Task MarkAllAsReadAsync(int customerId)
        {
            var exists = await _context.Customers
                .AnyAsync(x => x.Id == customerId);

            if (!exists)
                throw new Exception("Customer not found");

            await _repository.MarkAllAsReadAsync(customerId);
        }

        public async Task DeleteAsync(int id)
        {
            var notification =
                await _repository.GetByIdAsync(id)
                ?? throw new Exception("Notification not found");

            await _repository.DeleteAsync(notification);
        }

        private static NotificationResponseDto Map(
            Notification notification)
        {
            return new NotificationResponseDto
            {
                Id = notification.Id,
                CustomerId = notification.CustomerId,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                IsRead = notification.IsRead,
                RelatedEntityType =
                    notification.RelatedEntityType,
                RelatedEntityId =
                    notification.RelatedEntityId,
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt
            };
        }
    }
}