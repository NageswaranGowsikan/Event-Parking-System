using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _context;

        public EventRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Event?> GetByIdAsync(int id) =>
            await _context.Events
                .Include(e => e.Venue)
                .Include(e => e.EventCategory)
                .FirstOrDefaultAsync(e => e.Id == id);

        public async Task<List<Event>> GetAllAsync() =>
            await _context.Events
                .Include(e => e.Venue)
                .Include(e => e.EventCategory)
                .OrderBy(e => e.StartDateTime)
                .ToListAsync();

        public async Task AddAsync(Event eventItem)
        {
            await _context.Events.AddAsync(eventItem);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Event eventItem)
        {
            eventItem.UpdatedAt = DateTime.UtcNow;

            _context.Events.Update(eventItem);

            await _context.SaveChangesAsync();
        }
    }
}