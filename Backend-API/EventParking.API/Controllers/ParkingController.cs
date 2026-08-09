using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace EventParking.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParkingController : ControllerBase
    {
        private readonly ParkingService _service;

        public ParkingController(ParkingService service)
        {
            _service = service;
        }

        [HttpPost("slots")]
        public async Task<IActionResult> CreateSlot(
            [FromBody] CreateParkingSlotDto request)
        {
            try
            {
                var result =
                    await _service.CreateSlotAsync(request);

                return CreatedAtAction(
                    nameof(GetSlotsByVenue),
                    new { venueId = result.VenueId },
                    result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("slots/venue/{venueId}")]
        public async Task<IActionResult> GetSlotsByVenue(
            int venueId)
        {
            try
            {
                return Ok(
                    await _service.GetSlotsByVenueAsync(venueId));
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("slots/{slotId}/availability")]
        public async Task<IActionResult> CheckAvailability(
            int slotId,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end)
        {
            try
            {
                var available =
                    await _service.CheckAvailabilityAsync(
                        slotId,
                        start,
                        end);

                return Ok(new
                {
                    ParkingSlotId = slotId,
                    Available = available
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("reservations")]
        public async Task<IActionResult> Reserve(
            [FromBody] CreateParkingReservationDto request)
        {
            try
            {
                var result =
                    await _service.ReserveAsync(request);

                return CreatedAtAction(
                    nameof(GetReservation),
                    new { id = result.Id },
                    result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("reservations/{id}")]
        public async Task<IActionResult> GetReservation(int id)
        {
            try
            {
                return Ok(
                    await _service.GetReservationAsync(id));
            }
            catch (Exception ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpGet("reservations/customer/{customerId}")]
        public async Task<IActionResult> GetCustomerReservations(
            int customerId)
        {
            try
            {
                return Ok(
                    await _service
                        .GetCustomerReservationsAsync(customerId));
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("reservations/{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] UpdateParkingReservationStatusDto request)
        {
            try
            {
                return Ok(
                    await _service.UpdateStatusAsync(
                        id,
                        request.Status));
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}