using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class SeatService
    {
        private readonly AppDbContext _context;

        public SeatService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SeatDto>> GetSeatsByEventAsync(int eventId)
        {
            return await _context.Seats
                .Where(s => s.EventId == eventId)
                .OrderBy(s => s.Row).ThenBy(s => s.SeatNumber)
                .Select(s => new SeatDto
                {
                    Id = s.Id,
                    EventId = s.EventId,
                    Row = s.Row,
                    SeatNumber = s.SeatNumber,
                    Status = s.Status,
                    Price = s.Price
                })
                .ToListAsync();
        }

        public async Task UpdateSeatStatusAsync(int seatId, UpdateSeatStatusDto dto)
        {
            var seat = await _context.Seats.FindAsync(seatId);
            if (seat == null) throw new Exception("Seat not found");

            // Prevent changing a seat that is already fully booked
            if (seat.Status == "Booked" && dto.Status != "Available")
            {
                throw new Exception("Seat is already booked.");
            }

            seat.Status = dto.Status;
            await _context.SaveChangesAsync();
        }
    }
}