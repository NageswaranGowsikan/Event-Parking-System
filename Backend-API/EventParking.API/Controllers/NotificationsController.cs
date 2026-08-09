using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace EventParking.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _service;

        public NotificationsController(NotificationService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateNotificationDto request)
        {
            try
            {
                var result = await _service.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetCustomerNotifications(
            int customerId)
        {
            try
            {
                return Ok(
                    await _service
                        .GetCustomerNotificationsAsync(customerId));
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("customer/{customerId}/unread")]
        public async Task<IActionResult> GetUnread(
            int customerId)
        {
            try
            {
                return Ok(
                    await _service.GetUnreadAsync(customerId));
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                return Ok(
                    await _service.MarkAsReadAsync(id));
            }
            catch (Exception ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpPut("customer/{customerId}/read-all")]
        public async Task<IActionResult> MarkAllAsRead(
            int customerId)
        {
            try
            {
                await _service.MarkAllAsReadAsync(customerId);

                return Ok(new
                {
                    Message =
                        "All notifications marked as read"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);

                return Ok(new
                {
                    Message = "Notification deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }
    }
}