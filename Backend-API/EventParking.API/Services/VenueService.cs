using EventParking.API.Interfaces;
using EventParking.API.Models;

namespace EventParking.API.Services
{
    public class VenueService
    {
        private readonly IVenueRepository _venueRepository;

        public VenueService(IVenueRepository venueRepository)
        {
            _venueRepository = venueRepository;
        }

        public Task<List<Venue>> GetAllAsync() =>
            _venueRepository.GetAllAsync();

        public async Task<Venue> GetByIdAsync(int id)
        {
            return await _venueRepository.GetByIdAsync(id)
                ?? throw new Exception("Venue not found");
        }

        public async Task<Venue> CreateAsync(
            string name,
            string address,
            string? description,
            int capacity)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new Exception("Venue name is required");

            if (capacity <= 0)
                throw new Exception("Venue capacity must be greater than zero");

            var venue = new Venue
            {
                Name = name.Trim(),
                Address = address.Trim(),
                Description = description,
                Capacity = capacity
            };

            await _venueRepository.AddAsync(venue);

            return venue;
        }

        public async Task<bool> IsAvailableAsync(
            int venueId,
            DateTime start,
            DateTime end)
        {
            var venue = await GetByIdAsync(venueId);

            if (!venue.IsActive)
                return false;

            if (start >= end)
                throw new Exception("End time must be after start time");

            return !await _venueRepository.HasOverlappingEventAsync(
                venueId,
                start,
                end);
        }

        public async Task DeactivateAsync(int id)
        {
            var venue = await GetByIdAsync(id);

            venue.IsActive = false;

            await _venueRepository.UpdateAsync(venue);
        }

        public async Task<Venue> UpdateAsync(
            int id,
            string name,
            string address,
            string? description,
            int capacity)
        {
            var venue = await GetByIdAsync(id);

            if (string.IsNullOrWhiteSpace(name))
                throw new Exception("Venue name is required");

            if (capacity <= 0)
                throw new Exception("Venue capacity must be greater than zero");

            venue.Name = name.Trim();
            venue.Address = address.Trim();
            venue.Description = description;
            venue.Capacity = capacity;

            await _venueRepository.UpdateAsync(venue);

            return venue;
        }
    }
}