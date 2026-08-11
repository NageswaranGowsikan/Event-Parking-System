using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.EventDTOs;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly EventService _service;

        public EventsController(EventService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEvents(
             [FromQuery] string? search,
             [FromQuery] DateTime? date,
             [FromQuery] int? venueId,
             [FromQuery] int? categoryId)
        {
            var events = await _eventService.GetAllEventsAsync(search, date, venueId, categoryId);
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                return Ok(await _service.GetByIdAsync(id));
            }
            catch (Exception ex)
            {
                return NotFound(new
                {
                    Message = ex.Message
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            try
            {
                var createdEvent = await _eventService.CreateEventAsync(dto);
                return CreatedAtAction(nameof(GetEvent), new { id = createdEvent.Id }, createdEvent);
            }
            catch (Exception ex)
            {
                // Returns 409 Conflict for overlapping dates or capacity errors
                return Conflict(new { Message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] CreateEventDto dto)
        {
            try
            {
                await _eventService.UpdateEventAsync(id, dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            try
            {
                await _eventService.DeleteEventAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}