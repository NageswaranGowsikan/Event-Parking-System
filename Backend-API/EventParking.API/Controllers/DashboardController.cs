using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.DashboardDTOs;

namespace EventParking.API.Controllers
{
    [Route("api/dashboard")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Strictly lock this down
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboardService;

        public DashboardController(DashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("metrics")]
        public async Task<IActionResult> GetMetrics()
        {
            try
            {
                var metrics = await _dashboardService.GetMetricsAsync();
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}