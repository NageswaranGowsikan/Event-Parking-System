using EventParking.API.Interfaces;
using EventParking.API.Models;

namespace EventParking.API.Services
{
    public class EventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IVenueRepository _venueRepository;
        private readonly IEventCategoryRepository _categoryRepository;

        public EventService(
            IEventRepository eventRepository,
            IVenueRepository venueRepository,
            IEventCategoryRepository categoryRepository)
        {
            _eventRepository = eventRepository;
            _venueRepository = venueRepository;
            _categoryRepository = categoryRepository;
        }

        public Task<List<Event>> GetAllAsync() =>
            _eventRepository.GetAllAsync();

        public async Task<Event> GetByIdAsync(int id)
        {
            return await _eventRepository.GetByIdAsync(id)
                ?? throw new Exception("Event not found");
        }

        public async Task<Event> CreateAsync(
            string title,
            string? description,
            int venueId,
            int categoryId,
            DateTime start,
            DateTime end,
            int capacity)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new Exception("Event title is required");

            if (start >= end)
                throw new Exception(
                    "Event end time must be after start time");

            if (capacity <= 0)
                throw new Exception(
                    "Event capacity must be greater than zero");

            var venue =
                await _venueRepository.GetByIdAsync(venueId)
                ?? throw new Exception("Venue not found");

            if (!venue.IsActive)
                throw new Exception("Venue is not active");

            if (capacity > venue.Capacity)
                throw new Exception(
                    "Event capacity cannot exceed venue capacity");

            var category =
                await _categoryRepository.GetByIdAsync(categoryId)
                ?? throw new Exception(
                    "Event category not found");

            if (!category.IsActive)
                throw new Exception(
                    "Event category is not active");

            var hasOverlap =
                await _venueRepository.HasOverlappingEventAsync(
                    venueId,
                    start,
                    end);

            if (hasOverlap)
                throw new Exception(
                    "Venue is already booked during the selected time");

            var eventItem = new Event
            {
                Title = title.Trim(),
                Description = description,
                VenueId = venueId,
                EventCategoryId = categoryId,
                StartDateTime = start,
                EndDateTime = end,
                Capacity = capacity,
                Status = "Scheduled"
            };

            await _eventRepository.AddAsync(eventItem);

            return await GetByIdAsync(eventItem.Id);
        }

        public async Task<Event> UpdateAsync(
    int id,
    string title,
    string? description,
    int venueId,
    int categoryId,
    DateTime start,
    DateTime end,
    int capacity,
    string status)
        {
            var eventItem = await GetByIdAsync(id);

            if (string.IsNullOrWhiteSpace(title))
                throw new Exception("Event title is required");

            if (start >= end)
                throw new Exception("Event end time must be after start time");

            if (capacity <= 0)
                throw new Exception("Event capacity must be greater than zero");

            var venue =
                await _venueRepository.GetByIdAsync(venueId)
                ?? throw new Exception("Venue not found");

            if (!venue.IsActive)
                throw new Exception("Venue is not active");

            if (capacity > venue.Capacity)
                throw new Exception(
                    "Event capacity cannot exceed venue capacity");

            var category =
                await _categoryRepository.GetByIdAsync(categoryId)
                ?? throw new Exception("Event category not found");

            var hasOverlap =
                await _venueRepository.HasOverlappingEventAsync(
                    venueId,
                    start,
                    end,
                    id);

            if (hasOverlap)
                throw new Exception(
                    "Venue is already booked during the selected time");

            var allowedStatuses =
                new[] { "Scheduled", "Cancelled", "Completed" };

            if (!allowedStatuses.Contains(
                    status,
                    StringComparer.OrdinalIgnoreCase))
            {
                throw new Exception("Invalid event status");
            }

            eventItem.Title = title.Trim();
            eventItem.Description = description;
            eventItem.VenueId = venueId;
            eventItem.EventCategoryId = categoryId;
            eventItem.StartDateTime = start;
            eventItem.EndDateTime = end;
            eventItem.Capacity = capacity;
            eventItem.Status =
                allowedStatuses.First(s =>
                    s.Equals(
                        status,
                        StringComparison.OrdinalIgnoreCase));

            await _eventRepository.UpdateAsync(eventItem);

            return await GetByIdAsync(id);
        }
    }
}