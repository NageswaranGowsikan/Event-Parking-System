using EventParking.API.Services;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.EventCategoryDTOs;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventCategoriesController : ControllerBase
    {
        private readonly EventCategoryService _service;

        public EventCategoriesController(
            EventCategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _service.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateCategoryDto request)
        {
            try
            {
                return Ok(await _service.CreateAsync(
                    request.Name,
                    request.Description));
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}