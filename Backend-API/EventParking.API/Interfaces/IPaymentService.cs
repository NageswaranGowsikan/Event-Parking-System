using static EventParking.API.DTOs.PaymentDTOs;

namespace EventParking.API.Interfaces
{
    public interface IPaymentService
    {
        Task<BookingPaymentStatusDto> GetBookingPaymentStatusAsync(int bookingId);

        Task<PaymentResponseDto> ProcessPaymentAsync(
            int bookingId,
            ProcessPaymentDto dto);

        Task<List<PaymentHistoryItemDto>> GetCustomerPaymentHistoryAsync(
            int customerId);

        Task<PaymentReceiptDto> GetReceiptAsync(int paymentId);
    }
}