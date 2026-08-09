using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface IEventRepository
    {
        Task<Event?> GetByIdAsync(int id);
        Task<List<Event>> GetAllAsync();
        Task AddAsync(Event eventItem);
        Task UpdateAsync(Event eventItem);
    }
}