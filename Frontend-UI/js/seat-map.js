let selectedSeats = []; // Array of seat objects {id, label, price}
let currentEventId = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('eventId');

    if (!currentEventId) {
        document.getElementById('seatGrid').innerHTML = '<h3 style="color: red;">No event selected!</h3>';
        return;
    }
    loadSeats(currentEventId);
});

async function loadSeats(eventId) {
    const grid = document.getElementById('seatGrid');
    try {
        // Now using the exact URI requested by the specification
        const seats = await apiFetch(`/events/${eventId}/seats`);
        grid.innerHTML = ''; 

        if (seats.length === 0) {
            grid.innerHTML = '<h3>No seats generated for this event yet. (Admin must configure)</h3>';
            return;
        }

        seats.forEach(seat => {
            const btn = document.createElement('button');
            const seatLabel = `${seat.row}${seat.seatNumber}`;
            btn.innerText = seatLabel;
            
            // Check if it's already in the cart from a previous render
            const isSelected = selectedSeats.some(s => s.id === seat.id);
            btn.className = `seat ${seat.status === 'Booked' ? 'Booked' : (isSelected ? 'Selected' : 'Available')}`;
            
            if (seat.status === 'Available') {
                btn.onclick = () => toggleSeat(seat, seatLabel);
            }
            grid.appendChild(btn);
        });
    } catch (error) {
        grid.innerHTML = `<div style="color: red;">Failed to load seats: ${error.message}</div>`;
    }
}

function toggleSeat(seat, label) {
    const index = selectedSeats.findIndex(s => s.id === seat.id);
    if (index > -1) {
        selectedSeats.splice(index, 1); // Remove if already selected
    } else {
        selectedSeats.push({ id: seat.id, label: label, price: seat.price }); // Add to cart
    }
    updateCartUI();
    loadSeats(currentEventId); // Re-render colors
}

function updateCartUI() {
    const labelsSpan = document.getElementById('selectedSeatLabels');
    const priceSpan = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (selectedSeats.length === 0) {
        labelsSpan.innerText = "None";
        priceSpan.innerText = "0.00";
        checkoutBtn.disabled = true;
    } else {
        labelsSpan.innerText = selectedSeats.map(s => s.label).join(", ");
        const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
        priceSpan.innerText = total.toFixed(2);
        checkoutBtn.disabled = false;
    }
}

function submitBooking() {
    const confirmBooking = confirm(`Checkout total is $${document.getElementById('totalPrice').innerText}. Proceed to parking options?`);
    if (!confirmBooking) return;

    // Save the seat IDs to the browser's session storage
    const seatIds = selectedSeats.map(s => s.id);
    sessionStorage.setItem('pendingSeatIds', JSON.stringify(seatIds));

    // Move to the parking map (we no longer have a bookingId yet)
    window.location.href = `parking-map.html?eventId=${currentEventId}`;
}