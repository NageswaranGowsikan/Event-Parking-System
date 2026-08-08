using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        // public DbSet<Booking> Bookings { get; set; } // Will be added by the Bookings team member
    }
}
