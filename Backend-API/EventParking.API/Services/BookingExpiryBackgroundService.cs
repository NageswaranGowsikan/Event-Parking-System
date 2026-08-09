using EventParking.API.Interfaces;

namespace EventParking.API.Services
{
    public class BookingExpiryBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingExpiryBackgroundService> _logger;

        public BookingExpiryBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<BookingExpiryBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var bookingService =
                        scope.ServiceProvider
                            .GetRequiredService<IBookingService>();

                    var expiredCount =
                        await bookingService
                            .ExpirePendingBookingsAsync();

                    if (expiredCount > 0)
                    {
                        _logger.LogInformation(
                            "{ExpiredCount} pending booking(s) expired automatically.",
                            expiredCount);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "An error occurred while expiring pending bookings.");
                }

                try
                {
                    await Task.Delay(
                        TimeSpan.FromSeconds(30),
                        stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }
    }
}