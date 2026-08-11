using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class EventService
    {
        private readonly AppDbContext _context;

        public EventService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<EventDto>> GetAllEventsAsync()
        {
            return await _context.Events
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    VenueName = e.Venue!.Name,
                    CategoryName = e.Category!.Name,
                    Status = e.Status,
                    ImageUrl = e.ImageUrl
                })
                .ToListAsync();
        }

        public async Task<EventDto?> GetEventByIdAsync(int id)
        {
            var e = await _context.Events
                .Include(ev => ev.Venue)
                .Include(ev => ev.Category)
                .FirstOrDefaultAsync(ev => ev.Id == id);

            if (e == null) return null;

            return new EventDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                EventDate = e.EventDate,
                VenueName = e.Venue!.Name,
                CategoryName = e.Category!.Name,
                Status = e.Status,
                ImageUrl = e.ImageUrl
            };

            await _eventRepository.AddAsync(eventItem);

            return await GetByIdAsync(eventItem.Id);
        }

        public async Task<Event> CreateEventAsync(CreateEventDto dto)
        {
            var newEvent = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                EventDate = dto.EventDate,
                VenueId = dto.VenueId,
                CategoryId = dto.CategoryId,
                ImageUrl = dto.ImageUrl,
                Status = "Scheduled"
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();
            return newEvent;
        }
    }
}