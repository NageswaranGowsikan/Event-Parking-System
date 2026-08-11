namespace EventParking.API.DTOs
{
    public class VenueDTOs
    {
        public record CreateVenueDto(
            string Name,
            string Address,
            string? Description,
            int Capacity
        );

        public record UpdateVenueDto(
            string Name,
            string Address,
            string? Description,
            int Capacity
        );

        public record VenueResponseDto(
            int Id,
            string Name,
            string Address,
            string? Description,
            int Capacity,
            bool IsActive
        );
    }
}