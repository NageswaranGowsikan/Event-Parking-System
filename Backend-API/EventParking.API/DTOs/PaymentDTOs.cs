namespace EventParking.API.DTOs
{
    public class PaymentDTOs
    {
        public record ProcessPaymentDto(
            string PaymentMethod
        );

        public record BookingPaymentStatusDto(
            int BookingId,
            string BookingReference,
            decimal AmountDue,
            string BookingStatus,
            string PaymentStatus,
            string? TransactionId,
            DateTime? PaymentDate
        );

        public record PaymentResponseDto(
            int Id,
            int BookingId,
            string BookingReference,
            decimal Amount,
            string PaymentMethod,
            string TransactionId,
            string PaymentStatus,
            DateTime PaymentDate
        );

        public record PaymentHistoryItemDto(
            int Id,
            int BookingId,
            string BookingReference,
            decimal Amount,
            string PaymentMethod,
            string TransactionId,
            string PaymentStatus,
            DateTime PaymentDate
        );

        public record PaymentReceiptDto(
            string ReceiptNumber,
            int PaymentId,
            int BookingId,
            string BookingReference,
            int CustomerId,
            string CustomerName,
            string CustomerEmail,
            decimal Amount,
            string PaymentMethod,
            string TransactionId,
            string PaymentStatus,
            DateTime PaymentDate
        );
    }
}