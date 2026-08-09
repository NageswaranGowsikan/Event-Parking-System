document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the eventId from the URL (e.g., seat-map.html?eventId=1)
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (!eventId) {
        document.getElementById('seatGrid').innerHTML = '<h3 style="color: red;">No event selected!</h3>';
        return;
    }

    loadSeats(eventId);
});

async function loadSeats(eventId) {
    const grid = document.getElementById('seatGrid');
    
    try {
        // 2. Fetch the seats for this specific event from the C# backend
        const seats = await apiFetch(`/seats/event/${eventId}`);
        
        grid.innerHTML = ''; // Clear loading text

        if (seats.length === 0) {
            grid.innerHTML = '<h3>No seats configured for this event yet.</h3>';
            return;
        }

        // 3. Loop through and create a button for each seat
        seats.forEach(seat => {
            const btn = document.createElement('button');
            btn.className = `seat ${seat.status}`; // Adds class 'Available', 'Booked', etc.
            btn.innerText = `${seat.row}${seat.seatNumber}`;
            
            // 4. Add click logic to lock/book the seat
            if (seat.status === 'Available') {
                btn.onclick = () => reserveSeat(seat.id, eventId);
            } else {
                btn.onclick = () => alert('This seat is unavailable.');
            }

            grid.appendChild(btn);
        });

    } catch (error) {
        console.error("Error loading seats:", error);
        grid.innerHTML = `<div style="color: red;">Failed to load seats: ${error.message}</div>`;
    }
}

async function reserveSeat(seatId, eventId) {
    const confirmBooking = confirm("Do you want to book this seat?");
    if (!confirmBooking) return;

    try {
        // Send the PUT request to change the status to Booked
        await apiFetch(`/seats/${seatId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: "Booked" })
        });
        
        alert("Seat booked successfully!");
        loadSeats(eventId); // Reload the grid to show the updated color
        
    } catch (error) {
        console.error("Booking error:", error);
        alert("Failed to book seat. Please ensure you are logged in.");
    }
}