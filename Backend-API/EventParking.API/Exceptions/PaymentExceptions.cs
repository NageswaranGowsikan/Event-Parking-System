namespace EventParking.API.Exceptions
{
    public class PaymentConflictException : Exception
    {
        public PaymentConflictException(string message) : base(message)
        {
        }
    }

    public class PaymentValidationException : Exception
    {
        public PaymentValidationException(string message) : base(message)
        {
        }
    }
}