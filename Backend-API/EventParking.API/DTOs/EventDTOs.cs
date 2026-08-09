namespace EventParking.API.DTOs
{
    public class EventDTOs
    {
        public record CreateEventDto(
            string Title,
            string? Description,
            int VenueId,
            int EventCategoryId,
            DateTime StartDateTime,
            DateTime EndDateTime,
            int Capacity
        );

        public record UpdateEventDto(
            string Title,
            string? Description,
            int VenueId,
            int EventCategoryId,
            DateTime StartDateTime,
            DateTime EndDateTime,
            int Capacity,
            string Status
        );

        public record EventResponseDto(
            int Id,
            string Title,
            string? Description,
            int VenueId,
            string VenueName,
            int EventCategoryId,
            string CategoryName,
            DateTime StartDateTime,
            DateTime EndDateTime,
            int Capacity,
            string Status
        );
    }
}