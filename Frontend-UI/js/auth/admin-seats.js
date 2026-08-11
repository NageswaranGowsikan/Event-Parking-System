// js/auth/admin-seats.js - Bulletproof Admin Seat Matrix Configuration

let currentEvents = [];
let selectedEventCapacity = 0;

const MOCK_ADMIN_EVENTS = [
    { id: 1, title: 'Rock Symphony World Tour 2026', capacity: 500, ticketPrice: 89.99 },
    { id: 2, title: 'Championship Basketball Finals', capacity: 250, ticketPrice: 120.00 },
    { id: 3, title: 'Broadway Musical Spectacular', capacity: 100, ticketPrice: 65.00 }
];

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    const select = document.getElementById('eventSelect');
    if (!select) return;

    try {
        currentEvents = await apiFetch('/events');
        if (!Array.isArray(currentEvents) || currentEvents.length === 0) {
            currentEvents = MOCK_ADMIN_EVENTS;
        }

        select.innerHTML = '<option value="">-- Choose an Event --</option>';
        currentEvents.forEach(e => {
            const title = e.title || e.name;
            select.innerHTML += `<option value="${e.id}">${title} (Capacity: ${e.capacity})</option>`;
        });
    } catch (error) {
        console.warn("API offline, using mock admin events fallback:", error.message);
        currentEvents = MOCK_ADMIN_EVENTS;
        select.innerHTML = '<option value="">-- Choose an Event --</option>';
        currentEvents.forEach(e => {
            select.innerHTML += `<option value="${e.id}">${e.title} (Capacity: ${e.capacity})</option>`;
        });
    }
}

function handleEventSelection() {
    const eventId = document.getElementById('eventSelect').value;
    const warningDiv = document.getElementById('capacityWarning');
    const tbody = document.getElementById('seatTableBody');
    
    if (!eventId) {
        if (warningDiv) warningDiv.style.display = 'none';
        selectedEventCapacity = 0;
        if (tbody) tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Select an event above.</td></tr>';
        return;
    }

    const selectedEvent = currentEvents.find(e => e.id == eventId);
    selectedEventCapacity = selectedEvent ? selectedEvent.capacity : 0;
    
    const targetText = document.getElementById('targetCapacityText');
    if (targetText) targetText.innerText = selectedEventCapacity;
    if (warningDiv) warningDiv.style.display = 'block';

    loadSeats(eventId);
}

function calculateTotal() {
    const rows = parseInt(document.getElementById('rowCount').value) || 0;
    const cols = parseInt(document.getElementById('colCount').value) || 0;
    const totalInput = document.getElementById('totalCalc');
    if (!totalInput) return;
    
    const total = rows * cols;
    totalInput.value = total;

    if (total > 0 && selectedEventCapacity > 0 && total === selectedEventCapacity) {
        totalInput.style.color = "var(--accent-emerald)";
        totalInput.style.borderColor = "var(--accent-emerald)";
    } else {
        totalInput.style.color = "var(--accent-rose)";
        totalInput.style.borderColor = "rgba(255,255,255,0.1)";
    }
}

async function loadSeats(eventId) {
    const tbody = document.getElementById('seatTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</td></tr>';

    try {
        const seats = await apiFetch(`/events/${eventId}/seats`);
        
        if (!seats || seats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No seats generated yet. Configure matrix above.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        seats.forEach(seat => {
            const isAvailable = seat.status === 'Available';
            const label = seat.row ? `${seat.row}${seat.seatNumber}` : seat.seatNumber;
            
            tbody.innerHTML += `
                <tr>
                    <td><strong style="color: var(--text-primary);">${label}</strong></td>
                    <td>
                        <span class="badge ${isAvailable ? 'badge-success' : 'badge-danger'}">
                            ${seat.status}
                        </span>
                    </td>
                    <td>
                        ${isAvailable 
                            ? `<button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteSeat(${seat.id})"><i class="fa-solid fa-trash"></i> Remove</button>` 
                            : '<em style="color: var(--text-muted);">Booked</em>'}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" style="color: var(--accent-rose); text-align: center;">Failed to load seats: ${error.message}</td></tr>`;
    }
}

async function generateSeatMap() {
    const eventId = document.getElementById('eventSelect').value;
    if (!eventId) return alert("Select an event first.");

    const rows = parseInt(document.getElementById('rowCount').value);
    const cols = parseInt(document.getElementById('colCount').value);
    
    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        return alert("Please enter valid row and column numbers.");
    }

    const totalGenerating = rows * cols;

    if (selectedEventCapacity > 0 && totalGenerating !== selectedEventCapacity) {
        return alert(`BRD Capacity Rule: You are trying to generate ${totalGenerating} seats, but Event Capacity is set to ${selectedEventCapacity}. Please adjust rows and columns.`);
    }

    if (!confirm(`Generate ${totalGenerating} seats for this event?`)) return;

    try {
        const selectedEvent = currentEvents.find(e => e.id == eventId);
        const eventTicketPrice = selectedEvent ? (selectedEvent.ticketPrice || 0) : 0;

        await apiFetch(`/events/${eventId}/seats`, {
            method: 'POST',
            body: JSON.stringify({
                rows: rows,
                seatsPerRow: cols,
                basePrice: eventTicketPrice
            })
        });
        
        alert("Seat matrix map generated successfully!");
        document.getElementById('rowCount').value = '';
        document.getElementById('colCount').value = '';
        document.getElementById('totalCalc').value = '0';
        
        loadSeats(eventId);
    } catch (error) {
        alert("Generation failed: " + error.message);
    }
}

async function deleteSeat(seatId) {
    if (!confirm("Delete this seat? This action cannot be undone.")) return;

    try {
        const eventId = document.getElementById('eventSelect').value;
        await apiFetch(`/events/${eventId}/seats/${seatId}`, { method: 'DELETE' });
        loadSeats(eventId); 
    } catch (error) {
        alert("Failed to delete seat: " + error.message);
    }
}