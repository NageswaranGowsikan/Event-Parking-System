using EventParking.API.Services;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.VenueDTOs;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly VenueService _service;

        public VenuesController(VenueService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                return Ok(await _service.GetByIdAsync(id));
            }
            catch (Exception ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateVenueDto request)
        {
            try
            {
                var venue = await _service.CreateAsync(
                    request.Name,
                    request.Address,
                    request.Description,
                    request.Capacity);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = venue.Id },
                    venue);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("{id}/availability")]
        public async Task<IActionResult> CheckAvailability(
            int id,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end)
        {
            try
            {
                var available =
                    await _service.IsAvailableAsync(id, start, end);

                return Ok(new { Available = available });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deactivate(int id)
        {
            try
            {
                await _service.DeactivateAsync(id);

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateVenueDto request)
        {
            try
            {
                return Ok(await _service.UpdateAsync(
                    id,
                    request.Name,
                    request.Address,
                    request.Description,
                    request.Capacity));
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}