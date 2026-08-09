using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        // NEW TABLES FOR MODULE 2 & 3
        public DbSet<Venue> Venues { get; set; }
        public DbSet<EventCategory> EventCategories { get; set; }
        public DbSet<Event> Events { get; set; }
        // public DbSet<Booking> Bookings { get; set; } // Will be added by the Bookings team member

        public DbSet<Seat> Seats { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ensure Event correctly links to Venue and Category
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Venue)
                .WithMany()
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Seat>()
                 .HasOne(s => s.Event)
                 .WithMany()
                 .HasForeignKey(s => s.EventId)
                 .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Seat>()
                .Property(s => s.Price)
                .HasPrecision(18, 2);
        }
    }
}
