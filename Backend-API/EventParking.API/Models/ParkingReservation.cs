namespace EventParking.API.Models
{
    public class ParkingReservation
    {
        public int Id { get; set; }

        public string ReservationReference { get; set; }
            = string.Empty;

        public int CustomerId { get; set; }

        public int ParkingSlotId { get; set; }

        public int EventId { get; set; }

        public string VehicleNumber { get; set; }
            = string.Empty;

        public DateTime StartDateTime { get; set; }

        public DateTime EndDateTime { get; set; }

        public decimal Amount { get; set; }

        public string Status { get; set; } = "Reserved";

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; }
            = DateTime.UtcNow;

        public Customer? Customer { get; set; }

        public ParkingSlot? ParkingSlot { get; set; }

        public Event? Event { get; set; }
    }
}