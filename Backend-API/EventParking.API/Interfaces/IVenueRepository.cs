using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface IVenueRepository
    {
        Task<Venue?> GetByIdAsync(int id);
        Task<List<Venue>> GetAllAsync();
        Task AddAsync(Venue venue);
        Task UpdateAsync(Venue venue);

        Task<bool> HasOverlappingEventAsync(
            int venueId,
            DateTime start,
            DateTime end,
            int? excludeEventId = null);
    }
}