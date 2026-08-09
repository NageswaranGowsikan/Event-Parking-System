using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface IEventCategoryRepository
    {
        Task<EventCategory?> GetByIdAsync(int id);
        Task<EventCategory?> GetByNameAsync(string name);
        Task<List<EventCategory>> GetAllAsync();
        Task AddAsync(EventCategory category);
        Task UpdateAsync(EventCategory category);
    }
}