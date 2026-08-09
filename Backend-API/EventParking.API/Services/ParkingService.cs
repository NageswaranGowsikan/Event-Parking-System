using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class ParkingService
    {
        private readonly IParkingRepository _parkingRepository;
        private readonly AppDbContext _context;
        private readonly NotificationService _notificationService;

        public ParkingService(
            IParkingRepository parkingRepository,
            AppDbContext context,
            NotificationService notificationService)
        {
            _parkingRepository = parkingRepository;
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<ParkingSlotResponseDto> CreateSlotAsync(
            CreateParkingSlotDto request)
        {
            var venue = await _context.Venues
                .FirstOrDefaultAsync(x => x.Id == request.VenueId);

            if (venue == null)
                throw new Exception("Venue not found");

            if (!venue.IsActive)
                throw new Exception("Venue is not active");

            if (string.IsNullOrWhiteSpace(request.SlotNumber))
                throw new Exception("Parking slot number is required");

            if (string.IsNullOrWhiteSpace(request.Zone))
                throw new Exception("Parking zone is required");

            if (request.Price < 0)
                throw new Exception("Parking price cannot be negative");

            if (await _parkingRepository.SlotNumberExistsAsync(
                    request.VenueId,
                    request.SlotNumber.Trim()))
            {
                throw new Exception(
                    "Parking slot number already exists for this venue");
            }

            var slot = new ParkingSlot
            {
                VenueId = request.VenueId,
                SlotNumber = request.SlotNumber.Trim(),
                Zone = request.Zone.Trim(),
                VehicleType = string.IsNullOrWhiteSpace(request.VehicleType)
                    ? "Car"
                    : request.VehicleType.Trim(),
                Price = request.Price
            };

            await _parkingRepository.AddSlotAsync(slot);

            return MapSlot(slot, venue.Name);
        }

        public async Task<List<ParkingSlotResponseDto>>
            GetSlotsByVenueAsync(int venueId)
        {
            var slots =
                await _parkingRepository.GetSlotsByVenueAsync(venueId);

            return slots.Select(x =>
                MapSlot(x, x.Venue?.Name ?? string.Empty)).ToList();
        }

        public async Task<bool> CheckAvailabilityAsync(
            int slotId,
            DateTime start,
            DateTime end)
        {
            if (start >= end)
                throw new Exception(
                    "End time must be after start time");

            var slot =
                await _parkingRepository.GetSlotByIdAsync(slotId);

            if (slot == null || !slot.IsActive)
                throw new Exception(
                    "Parking slot not found or inactive");

            return await _parkingRepository.IsSlotAvailableAsync(
                slotId,
                start,
                end);
        }

        public async Task<ParkingReservationResponseDto>
            ReserveAsync(CreateParkingReservationDto request)
        {
            if (request.StartDateTime >= request.EndDateTime)
                throw new Exception(
                    "End time must be after start time");

            if (string.IsNullOrWhiteSpace(request.VehicleNumber))
                throw new Exception("Vehicle number is required");

            var customer = await _context.Customers
                .FirstOrDefaultAsync(x => x.Id == request.CustomerId);

            if (customer == null)
                throw new Exception("Customer not found");

            var slot = await _parkingRepository
                .GetSlotByIdAsync(request.ParkingSlotId);

            if (slot == null || !slot.IsActive)
                throw new Exception(
                    "Parking slot not found or inactive");

            var eventItem = await _context.Events
                .FirstOrDefaultAsync(x => x.Id == request.EventId);

            if (eventItem == null)
                throw new Exception("Event not found");

            if (eventItem.VenueId != slot.VenueId)
                throw new Exception(
                    "Parking slot does not belong to the event venue");

            var available =
                await _parkingRepository.IsSlotAvailableAsync(
                    request.ParkingSlotId,
                    request.StartDateTime,
                    request.EndDateTime);

            if (!available)
                throw new Exception(
                    "Parking slot is already reserved for the selected time");

            var reservation = new ParkingReservation
            {
                ReservationReference =
                    $"PRK-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                CustomerId = request.CustomerId,
                ParkingSlotId = request.ParkingSlotId,
                EventId = request.EventId,
                VehicleNumber = request.VehicleNumber.Trim().ToUpper(),
                StartDateTime = request.StartDateTime,
                EndDateTime = request.EndDateTime,
                Amount = slot.Price,
                Status = "Reserved"
            };

            await _parkingRepository.AddReservationAsync(reservation);

            await _notificationService.CreateSystemNotificationAsync(
                reservation.CustomerId,
                "Parking",
                "Parking Reservation Confirmed",
                $"Parking slot {slot.SlotNumber} has been reserved successfully.",
                "ParkingReservation",
            reservation.Id);

            reservation.ParkingSlot = slot;
            reservation.Event = eventItem;

            return MapReservation(reservation);
        }

        public async Task<ParkingReservationResponseDto>
            GetReservationAsync(int id)
        {
            var reservation =
                await _parkingRepository.GetReservationByIdAsync(id)
                ?? throw new Exception(
                    "Parking reservation not found");

            return MapReservation(reservation);
        }

        public async Task<List<ParkingReservationResponseDto>>
            GetCustomerReservationsAsync(int customerId)
        {
            var reservations =
                await _parkingRepository
                    .GetReservationsByCustomerAsync(customerId);

            return reservations
                .Select(MapReservation)
                .ToList();
        }

        public async Task<ParkingReservationResponseDto>
            UpdateStatusAsync(int id, string status)
        {
            var reservation =
                await _parkingRepository.GetReservationByIdAsync(id)
                ?? throw new Exception(
                    "Parking reservation not found");

            var allowed = new[]
            {
                "Reserved",
                "CheckedIn",
                "Completed",
                "Cancelled"
            };

            var selected = allowed.FirstOrDefault(x =>
                x.Equals(
                    status,
                    StringComparison.OrdinalIgnoreCase));

            if (selected == null)
                throw new Exception(
                    "Invalid parking reservation status");

            reservation.Status = selected;

            await _parkingRepository
                .UpdateReservationAsync(reservation);

            // Ingana add pannanum

            await _notificationService.CreateSystemNotificationAsync(
                reservation.CustomerId,
                "Parking",
                "Parking Reservation Updated",
                $"Your parking reservation status is now {reservation.Status}.",
                "ParkingReservation",
                reservation.Id);

            return MapReservation(reservation);
        }

        private static ParkingSlotResponseDto MapSlot(
            ParkingSlot slot,
            string venueName)
        {
            return new ParkingSlotResponseDto
            {
                Id = slot.Id,
                VenueId = slot.VenueId,
                VenueName = venueName,
                SlotNumber = slot.SlotNumber,
                Zone = slot.Zone,
                VehicleType = slot.VehicleType,
                Price = slot.Price,
                IsActive = slot.IsActive
            };
        }

        private static ParkingReservationResponseDto
            MapReservation(ParkingReservation reservation)
        {
            return new ParkingReservationResponseDto
            {
                Id = reservation.Id,
                ReservationReference =
                    reservation.ReservationReference,
                CustomerId = reservation.CustomerId,
                ParkingSlotId = reservation.ParkingSlotId,
                SlotNumber =
                    reservation.ParkingSlot?.SlotNumber ?? string.Empty,
                EventId = reservation.EventId,
                EventTitle =
                    reservation.Event?.Title ?? string.Empty,
                VehicleNumber = reservation.VehicleNumber,
                StartDateTime = reservation.StartDateTime,
                EndDateTime = reservation.EndDateTime,
                Amount = reservation.Amount,
                Status = reservation.Status,
                CreatedAt = reservation.CreatedAt
            };


        }
    }
}