using EventParking.API.Services;
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
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
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

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateEventDto request)
        {
            try
            {
                var eventItem =
                    await _service.CreateAsync(
                        request.Title,
                        request.Description,
                        request.VenueId,
                        request.EventCategoryId,
                        request.StartDateTime,
                        request.EndDateTime,
                        request.Capacity);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = eventItem.Id },
                    eventItem);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
    int id,
    [FromBody] UpdateEventDto request)
        {
            try
            {
                return Ok(await _service.UpdateAsync(
                    id,
                    request.Title,
                    request.Description,
                    request.VenueId,
                    request.EventCategoryId,
                    request.StartDateTime,
                    request.EndDateTime,
                    request.Capacity,
                    request.Status));
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}