namespace EventParking.API.DTOs
{
    public class CreateParkingSlotDto
    {
        public int VenueId { get; set; }
        public string SlotNumber { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public string VehicleType { get; set; } = "Car";
        public decimal Price { get; set; }
    }

    public class ParkingSlotResponseDto
    {
        public int Id { get; set; }
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public string SlotNumber { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public string VehicleType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateParkingReservationDto
    {
        public int CustomerId { get; set; }
        public int ParkingSlotId { get; set; }
        public int EventId { get; set; }
        public string VehicleNumber { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
    }

    public class ParkingReservationResponseDto
    {
        public int Id { get; set; }
        public string ReservationReference { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public int ParkingSlotId { get; set; }
        public string SlotNumber { get; set; } = string.Empty;
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public string VehicleNumber { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateParkingReservationStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}