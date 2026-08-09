using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeatsController : ControllerBase
    {
        private readonly SeatService _seatService;

        public SeatsController(SeatService seatService)
        {
            _seatService = seatService;
        }

        // GET: api/seats/event/1
        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetSeatsForEvent(int eventId)
        {
            var seats = await _seatService.GetSeatsByEventAsync(eventId);
            return Ok(seats);
        }

        // PUT: api/seats/5/status
        [Authorize]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateSeatStatusDto dto)
        {
            try
            {
                await _seatService.UpdateSeatStatusAsync(id, dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
