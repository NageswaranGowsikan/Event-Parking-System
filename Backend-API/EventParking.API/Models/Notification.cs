namespace EventParking.API.Models
{
    public class Notification
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public string Type { get; set; } = "General";

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public string? RelatedEntityType { get; set; }

        public int? RelatedEntityId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadAt { get; set; }

        public Customer? Customer { get; set; }
    }
}