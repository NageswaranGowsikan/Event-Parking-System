using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(p => p.Amount)
                    .HasPrecision(18, 2);

                entity.Property(p => p.PaymentMethod)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(p => p.TransactionId)
                    .HasMaxLength(60)
                    .IsRequired();

                entity.Property(p => p.PaymentStatus)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.HasIndex(p => p.BookingId)
                    .IsUnique();

                entity.HasIndex(p => p.TransactionId)
                    .IsUnique();

                entity.HasOne(p => p.Booking)
                    .WithOne(b => b.Payment)
                    .HasForeignKey<Payment>(p => p.BookingId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}