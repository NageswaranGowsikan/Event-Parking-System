using EventParking.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.DashboardDTOs;

namespace EventParking.API.Controllers
{
    [Route("api/dashboard")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(
            IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("admin")]
        // [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AdminDashboardDto>>
            GetAdminDashboard()
        {
            var result =
                await _dashboardService.GetAdminDashboardAsync();

            return Ok(result);
        }

        [HttpGet("customer/{customerId:int}")]
        // [Authorize]
        public async Task<ActionResult<CustomerDashboardDto>>
            GetCustomerDashboard(int customerId)
        {
            try
            {
                var result = await _dashboardService
                    .GetCustomerDashboardAsync(customerId);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    Message = ex.Message
                });
            }
        }
    }
}