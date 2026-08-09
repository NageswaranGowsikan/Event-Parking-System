namespace EventParking.API.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }

        // Foreign Keys
        public int VenueId { get; set; }
        public Venue? Venue { get; set; }

        public int CategoryId { get; set; }
        public EventCategory? Category { get; set; }

        public string Status { get; set; } = "Scheduled"; // Scheduled, Ongoing, Completed, Cancelled
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
}
}
