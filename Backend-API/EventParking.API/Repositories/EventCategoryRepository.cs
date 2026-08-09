using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Repositories
{
    public class EventCategoryRepository : IEventCategoryRepository
    {
        private readonly AppDbContext _context;

        public EventCategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<EventCategory?> GetByIdAsync(int id) =>
            await _context.EventCategories.FindAsync(id);

        public async Task<EventCategory?> GetByNameAsync(string name) =>
            await _context.EventCategories
                .FirstOrDefaultAsync(c => c.Name == name);

        public async Task<List<EventCategory>> GetAllAsync() =>
            await _context.EventCategories
                .OrderBy(c => c.Name)
                .ToListAsync();

        public async Task AddAsync(EventCategory category)
        {
            await _context.EventCategories.AddAsync(category);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(EventCategory category)
        {
            category.UpdatedAt = DateTime.UtcNow;

            _context.EventCategories.Update(category);

            await _context.SaveChangesAsync();
        }
    }
}