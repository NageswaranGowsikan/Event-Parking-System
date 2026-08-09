namespace EventParking.API.DTOs
{
    public class DashboardDTOs
    {
        public record AdminDashboardDto(
            int TotalEvents,
            int TotalBookings,
            int AvailableSeats,
            int OccupiedParkingSlots,
            decimal TotalRevenue,
            int TotalCustomers
        );

        public record CustomerDashboardDto(
            int CustomerId,
            List<UpcomingBookingDto> UpcomingBookings,
            List<ReservedParkingDto> ReservedParking,
            List<RecentPaymentDto> RecentPayments,
            int UnreadNotificationCount
        );

        public record UpcomingBookingDto(
            int BookingId,
            string BookingReference,
            string EventName,
            DateTime EventDate,
            string BookingStatus
        );

        public record ReservedParkingDto(
            int BookingId,
            string BookingReference,
            string EventName,
            string ParkingSlotNumber,
            decimal ParkingFee
        );

        public record RecentPaymentDto(
            int PaymentId,
            int BookingId,
            string BookingReference,
            decimal Amount,
            string PaymentMethod,
            string PaymentStatus,
            DateTime PaymentDate
        );
    }
}