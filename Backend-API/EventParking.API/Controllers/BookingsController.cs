using EventParking.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.BookingDTOs;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(
            IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBooking(int id)
        {
            var booking =
                await _bookingService.GetBookingByIdAsync(id);

            if (booking == null)
            {
                return NotFound(new
                {
                    Message = "Booking not found"
                });
            }

            return Ok(new BookingResponseDto(
                booking.Id,
                booking.BookingReference,
                booking.CustomerId,
                booking.TotalAmount,
                booking.Status,
                booking.ExpiresAt,
                booking.CreatedAt,
                booking.UpdatedAt
            ));
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult>
            GetCustomerBookings(int customerId)
        {
            var bookings =
                await _bookingService
                    .GetCustomerBookingsAsync(customerId);

            var response = bookings
                .Select(booking =>
                    new BookingHistoryItemDto(
                        booking.Id,
                        booking.BookingReference,
                        booking.TotalAmount,
                        booking.Status,
                        booking.ExpiresAt,
                        booking.CreatedAt
                    ))
                .ToList();

            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings =
                await _bookingService.GetAllBookingsAsync();

            var response = bookings
                .Select(booking =>
                    new BookingResponseDto(
                        booking.Id,
                        booking.BookingReference,
                        booking.CustomerId,
                        booking.TotalAmount,
                        booking.Status,
                        booking.ExpiresAt,
                        booking.CreatedAt,
                        booking.UpdatedAt
                    ))
                .ToList();

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking(
            [FromBody] CreateBookingDto request)
        {
            try
            {
                var booking =
                    await _bookingService.CreateBookingAsync(
                        request.CustomerId,
                        request.TotalAmount);

                var response = new BookingResponseDto(
                    booking.Id,
                    booking.BookingReference,
                    booking.CustomerId,
                    booking.TotalAmount,
                    booking.Status,
                    booking.ExpiresAt,
                    booking.CreatedAt,
                    booking.UpdatedAt
                );

                return CreatedAtAction(
                    nameof(GetBooking),
                    new { id = booking.Id },
                    response);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] UpdateBookingStatusDto request)
        {
            try
            {
                var updated =
                    await _bookingService
                        .UpdateBookingStatusAsync(
                            id,
                            request.Status);

                if (!updated)
                {
                    return BadRequest(new
                    {
                        Message =
                            "Booking status could not be updated"
                    });
                }

                return Ok(new
                {
                    Message =
                        "Booking status updated successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }
    }
}