namespace EventParking.API.DTOs
{
    public class EventCategoryDTOs
    {
        public record CreateCategoryDto(
            string Name,
            string? Description
        );

        public record CategoryResponseDto(
            int Id,
            string Name,
            string? Description,
            bool IsActive
        );
    }
}