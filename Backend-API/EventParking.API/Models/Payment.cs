namespace EventParking.API.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int BookingId { get; set; }

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string TransactionId { get; set; } = string.Empty;

        // Completed is the only successful status required for the simulation.
        public string PaymentStatus { get; set; } = "Completed";

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        public Booking? Booking { get; set; }
    }
}