namespace EventParking.API.Models
{
    public class ParkingSlot
    {
        public int Id { get; set; }

        public int VenueId { get; set; }

        public string SlotNumber { get; set; } = string.Empty;

        public string Zone { get; set; } = string.Empty;

        public string VehicleType { get; set; } = "Car";

        public decimal Price { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Venue? Venue { get; set; }

        public ICollection<ParkingReservation> Reservations { get; set; }
            = new List<ParkingReservation>();
    }
}