namespace EventParking.API.DTOs
{
    public class CreateNotificationDto
    {
        public int CustomerId { get; set; }
        public string Type { get; set; } = "General";
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
    }

    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}