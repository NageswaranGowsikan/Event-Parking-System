using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.BookingReference)
                .IsUnique();
        }
    }
}