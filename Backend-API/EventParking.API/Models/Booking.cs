namespace EventParking.API.Models
{
    public class Booking
    {
        public int Id { get; set; }

        public string BookingReference { get; set; } = string.Empty;

        public int CustomerId { get; set; }

        public decimal TotalAmount { get; set; } = 0;

        // Pending, Confirmed, Cancelled, Expired
        public string Status { get; set; } = "Pending";

        // A pending booking is held for 15 minutes.
        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(15);

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Customer? Customer { get; set; }

        public Payment? Payment { get; set; }
    }
}