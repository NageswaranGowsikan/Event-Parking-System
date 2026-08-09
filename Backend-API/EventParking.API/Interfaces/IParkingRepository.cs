using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface IParkingRepository
    {
        Task<ParkingSlot?> GetSlotByIdAsync(int id);

        Task<List<ParkingSlot>> GetSlotsByVenueAsync(int venueId);

        Task<bool> SlotNumberExistsAsync(
            int venueId,
            string slotNumber);

        Task<bool> IsSlotAvailableAsync(
            int parkingSlotId,
            DateTime start,
            DateTime end,
            int? excludeReservationId = null);

        Task AddSlotAsync(ParkingSlot slot);

        Task<ParkingReservation?> GetReservationByIdAsync(int id);

        Task<List<ParkingReservation>> GetReservationsByCustomerAsync(
            int customerId);

        Task AddReservationAsync(ParkingReservation reservation);

        Task UpdateReservationAsync(ParkingReservation reservation);
    }
}