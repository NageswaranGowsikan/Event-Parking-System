namespace EventParking.API.DTOs
{
    public class BookingDTOs
    {
        public record BookingResponseDto(
            int Id,
            string BookingReference,
            int CustomerId,
            decimal TotalAmount,
            string Status,
            DateTime ExpiresAt,
            DateTime CreatedAt,
            DateTime UpdatedAt
        );

        public record BookingHistoryItemDto(
            int Id,
            string BookingReference,
            decimal TotalAmount,
            string Status,
            DateTime ExpiresAt,
            DateTime CreatedAt
        );

        public record UpdateBookingStatusDto(
            string Status
        );

        public record CreateBookingDto(
           int CustomerId,
           decimal TotalAmount
        );
    }
}