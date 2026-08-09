using EventParking.API.Interfaces;
using EventParking.API.Models;

namespace EventParking.API.Services
{
    public class EventCategoryService
    {
        private readonly IEventCategoryRepository _repository;

        public EventCategoryService(
            IEventCategoryRepository repository)
        {
            _repository = repository;
        }

        public Task<List<EventCategory>> GetAllAsync() =>
            _repository.GetAllAsync();

        public async Task<EventCategory> CreateAsync(
            string name,
            string? description)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new Exception("Category name is required");

            var existing =
                await _repository.GetByNameAsync(name.Trim());

            if (existing != null)
                throw new Exception("Category already exists");

            var category = new EventCategory
            {
                Name = name.Trim(),
                Description = description
            };

            await _repository.AddAsync(category);

            return category;
        }
    }
}