using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Repositories
{
    public class VenueRepository : IVenueRepository
    {
        private readonly AppDbContext _context;

        public VenueRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Venue?> GetByIdAsync(int id) =>
            await _context.Venues.FindAsync(id);

        public async Task<List<Venue>> GetAllAsync() =>
            await _context.Venues
                .OrderBy(v => v.Name)
                .ToListAsync();

        public async Task AddAsync(Venue venue)
        {
            await _context.Venues.AddAsync(venue);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Venue venue)
        {
            venue.UpdatedAt = DateTime.UtcNow;

            _context.Venues.Update(venue);

            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasOverlappingEventAsync(
            int venueId,
            DateTime start,
            DateTime end,
            int? excludeEventId = null)
        {
            return await _context.Events.AnyAsync(e =>
                e.VenueId == venueId &&
                e.Status != "Cancelled" &&
                (!excludeEventId.HasValue || e.Id != excludeEventId.Value) &&
                e.StartDateTime < end &&
                e.EndDateTime > start);
        }
    }
}