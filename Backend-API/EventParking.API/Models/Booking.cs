namespace EventParking.API.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public string CustomerEmail { get; set; } = string.Empty; // Links to logged-in user
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;
        public decimal TotalPrice { get; set; }
    }
}
