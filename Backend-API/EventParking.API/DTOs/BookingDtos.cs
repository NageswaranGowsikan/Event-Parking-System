namespace EventParking.API.DTOs
{
    public class CreateUnifiedBookingDto
    {
        public List<int> SeatIds { get; set; } = new List<int>();
        public int? ParkingSlotId { get; set; } // Optional parking
    }

    public class HoldStatusDto
    {
        public string BookingNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double RemainingSeconds { get; set; }
    }
}