using EventParking.API.Exceptions;
using EventParking.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.PaymentDTOs;

namespace EventParking.API.Controllers
{
    [Route("api")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(
            IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("bookings/{bookingId:int}/payment")]
        public async Task<ActionResult<BookingPaymentStatusDto>>
            GetBookingPaymentStatus(int bookingId)
        {
            try
            {
                var result = await _paymentService
                    .GetBookingPaymentStatusAsync(bookingId);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpPost("bookings/{bookingId:int}/payment")]
        public async Task<ActionResult<PaymentResponseDto>>
            ProcessPayment(
                int bookingId,
                [FromBody] ProcessPaymentDto dto)
        {
            try
            {
                var result = await _paymentService
                    .ProcessPaymentAsync(bookingId, dto);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (PaymentConflictException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
            catch (PaymentValidationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("payments/customer/{customerId:int}")]
        public async Task<ActionResult<List<PaymentHistoryItemDto>>>
            GetCustomerPaymentHistory(int customerId)
        {
            try
            {
                var result = await _paymentService
                    .GetCustomerPaymentHistoryAsync(customerId);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpGet("payments/{paymentId:int}/receipt")]
        public async Task<ActionResult<PaymentReceiptDto>>
            GetReceipt(int paymentId)
        {
            try
            {
                var result =
                    await _paymentService.GetReceiptAsync(paymentId);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (PaymentValidationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}