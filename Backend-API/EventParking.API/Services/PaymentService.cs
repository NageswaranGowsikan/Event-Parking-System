using EventParking.API.Exceptions;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using static EventParking.API.DTOs.PaymentDTOs;

namespace EventParking.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly ICustomerRepository _customerRepository;

        public PaymentService(
            IPaymentRepository paymentRepository,
            IBookingRepository bookingRepository,
            ICustomerRepository customerRepository)
        {
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
            _customerRepository = customerRepository;
        }

        public async Task<BookingPaymentStatusDto> GetBookingPaymentStatusAsync(
            int bookingId)
        {
            var booking = await GetBookingOrThrowAsync(bookingId);
            var payment = await _paymentRepository.GetByBookingIdAsync(bookingId);

            return new BookingPaymentStatusDto(
                booking.Id,
                booking.BookingReference,
                booking.TotalAmount,
                booking.Status,
                payment?.PaymentStatus ?? "Pending",
                payment?.TransactionId,
                payment?.PaymentDate
            );
        }

        public async Task<PaymentResponseDto> ProcessPaymentAsync(
            int bookingId,
            ProcessPaymentDto dto)
        {
            var booking = await GetBookingOrThrowAsync(bookingId);

            if (booking.Customer == null)
            {
                throw new KeyNotFoundException("Customer not found.");
            }

            if (!booking.Customer.Status.Equals(
                    "Active",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new PaymentValidationException(
                    "A deactivated customer cannot complete a payment.");
            }

            if (!booking.Customer.EmailVerified)
            {
                throw new PaymentValidationException(
                    "The customer must verify their email before completing payment.");
            }

            var existingPayment =
                await _paymentRepository.GetByBookingIdAsync(bookingId);

            if (existingPayment != null)
            {
                throw new PaymentConflictException(
                    "A payment has already been recorded for this booking.");
            }

            if (!booking.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
            {
                throw new PaymentValidationException(
                    $"A booking with status '{booking.Status}' cannot be paid.");
            }

            if (booking.ExpiresAt <= DateTime.UtcNow)
            {
                booking.Status = "Expired";
                await _bookingRepository.UpdateAsync(booking);

                throw new PaymentValidationException(
                    "The booking hold has expired. Create a new booking before paying.");
            }

            if (booking.TotalAmount <= 0)
            {
                throw new PaymentValidationException(
                    "The booking total must be greater than zero.");
            }

            var paymentMethod = NormalizePaymentMethod(dto.PaymentMethod);

            var payment = new Payment
            {
                BookingId = booking.Id,
                Amount = booking.TotalAmount,
                PaymentMethod = paymentMethod,
                TransactionId = GenerateTransactionId(),
                PaymentStatus = "Completed",
                PaymentDate = DateTime.UtcNow
            };

            await _paymentRepository.AddAndConfirmBookingAsync(payment, booking);

            return MapToResponse(payment, booking);
        }

        public async Task<List<PaymentHistoryItemDto>>
            GetCustomerPaymentHistoryAsync(int customerId)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId);

            if (customer == null)
            {
                throw new KeyNotFoundException("Customer not found.");
            }

            var payments =
                await _paymentRepository.GetByCustomerIdAsync(customerId);

            return payments
                .Select(p => new PaymentHistoryItemDto(
                    p.Id,
                    p.BookingId,
                    p.Booking?.BookingReference ?? string.Empty,
                    p.Amount,
                    p.PaymentMethod,
                    p.TransactionId,
                    p.PaymentStatus,
                    p.PaymentDate
                ))
                .ToList();
        }

        public async Task<PaymentReceiptDto> GetReceiptAsync(int paymentId)
        {
            var payment = await _paymentRepository.GetByIdAsync(paymentId);

            if (payment == null)
            {
                throw new KeyNotFoundException("Payment not found.");
            }

            if (!payment.PaymentStatus.Equals(
                    "Completed",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new PaymentValidationException(
                    "A receipt is only available for a completed payment.");
            }

            var booking = payment.Booking
                ?? throw new KeyNotFoundException("Booking not found.");

            var customer = booking.Customer
                ?? throw new KeyNotFoundException("Customer not found.");

            return new PaymentReceiptDto(
                $"RCT-{payment.PaymentDate:yyyyMMdd}-{payment.Id:D6}",
                payment.Id,
                booking.Id,
                booking.BookingReference,
                customer.Id,
                customer.Name,
                customer.Email,
                payment.Amount,
                payment.PaymentMethod,
                payment.TransactionId,
                payment.PaymentStatus,
                payment.PaymentDate
            );
        }

        private async Task<Booking> GetBookingOrThrowAsync(int bookingId)
        {
            return await _bookingRepository.GetByIdAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");
        }

        private static string NormalizePaymentMethod(string paymentMethod)
        {
            if (string.IsNullOrWhiteSpace(paymentMethod))
            {
                throw new PaymentValidationException(
                    "Payment method is required.");
            }

            return paymentMethod.Trim().ToLowerInvariant() switch
            {
                "card" => "Card",
                "cash" => "Cash",
                "online" => "Online",
                _ => throw new PaymentValidationException(
                    "Payment method must be Card, Cash, or Online.")
            };
        }

        private static string GenerateTransactionId()
        {
            var randomPart = Guid.NewGuid()
                .ToString("N")[..8]
                .ToUpperInvariant();

            return $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{randomPart}";
        }

        private static PaymentResponseDto MapToResponse(
            Payment payment,
            Booking booking)
        {
            return new PaymentResponseDto(
                payment.Id,
                booking.Id,
                booking.BookingReference,
                payment.Amount,
                payment.PaymentMethod,
                payment.TransactionId,
                payment.PaymentStatus,
                payment.PaymentDate
            );
        }
    }
}