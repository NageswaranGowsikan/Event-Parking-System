using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Customer> Customers { get; set; }

        public DbSet<Venue> Venues { get; set; }

        public DbSet<Event> Events { get; set; }
        // public DbSet<Booking> Bookings { get; set; } // Will be added by the Bookings team member

        public DbSet<EventCategory> EventCategories { get; set; }

        public DbSet<ParkingSlot> ParkingSlots { get; set; }
        public DbSet<ParkingReservation> ParkingReservations { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ParkingReservation>()
                .HasOne(x => x.Customer)
                .WithMany()
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ParkingReservation>()
                .HasOne(x => x.ParkingSlot)
                .WithMany(x => x.Reservations)
                .HasForeignKey(x => x.ParkingSlotId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ParkingReservation>()
                .HasOne(x => x.Event)
                .WithMany()
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ParkingSlot>()
                .Property(x => x.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ParkingReservation>()
                .Property(x => x.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ParkingReservation>()
                .HasIndex(x => x.ReservationReference)
                .IsUnique();

            modelBuilder.Entity<ParkingSlot>()
                .HasIndex(x => new { x.VenueId, x.SlotNumber })
                .IsUnique();

            modelBuilder.Entity<Notification>()
                .HasOne(x => x.Customer)
                .WithMany()
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Notification>()
                .HasIndex(x => new { x.CustomerId, x.IsRead });
        }
    }

}