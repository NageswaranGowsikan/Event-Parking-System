let currentEvents = [];
let selectedEventCapacity = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {
        currentEvents = await apiFetch('/events');
        const select = document.getElementById('eventSelect');
        select.innerHTML = '<option value="">-- Choose an Event --</option>';
        
        currentEvents.forEach(e => {
            const title = e.title || e.name;
            select.innerHTML += `<option value="${e.id}">${title} (Capacity: ${e.capacity})</option>`;
        });
    } catch (error) {
        alert('Failed to load events: ' + error.message);
    }
}

function handleEventSelection() {
    const eventId = document.getElementById('eventSelect').value;
    const warningDiv = document.getElementById('capacityWarning');
    
    if (!eventId) {
        warningDiv.style.display = 'none';
        selectedEventCapacity = 0;
        document.getElementById('seatTableBody').innerHTML = '<tr><td colspan="3" style="text-align: center;">Select an event above.</td></tr>';
        return;
    }

    // Find the capacity of the selected event
    const selectedEvent = currentEvents.find(e => e.id == eventId);
    selectedEventCapacity = selectedEvent ? selectedEvent.capacity : 0;
    
    document.getElementById('targetCapacityText').innerText = selectedEventCapacity;
    warningDiv.style.display = 'block';

    loadSeats(eventId);
}

function calculateTotal() {
    const rows = parseInt(document.getElementById('rowCount').value) || 0;
    const cols = parseInt(document.getElementById('colCount').value) || 0;
    const totalInput = document.getElementById('totalCalc');
    
    const total = rows * cols;
    totalInput.value = total;

    // Visual feedback for BRD rule
    if (total > 0 && total === selectedEventCapacity) {
        totalInput.style.color = "green";
    } else {
        totalInput.style.color = "red";
    }
}

async function loadSeats(eventId) {
    const tbody = document.getElementById('seatTableBody');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Loading...</td></tr>';

    try {
        // NOTE: Make sure this endpoint matches your C# SeatsController!
        // Some students use /api/seats?eventId=X instead of /api/events/{id}/seats
        const seats = await apiFetch(`/events/${eventId}/seats`);
        
        if (seats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No seats generated yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        seats.forEach(seat => {
            const isDeletable = seat.status === 'Available';
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${seat.seatNumber}</strong></td>
                    <td>
                        <span style="color: ${isDeletable ? 'green' : 'red'}; font-weight: bold;">
                            ${seat.status}
                        </span>
                    </td>
                    <td>
                        ${isDeletable 
                            ? `<button class="btn-danger" onclick="deleteSeat(${seat.id})">Remove</button>` 
                            : '<em>Booked</em>'}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" style="color: red; text-align: center;">Error: ${error.message}</td></tr>`;
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

    // ENFORCE BRD RULE 13: Seat map total must exactly match Event Capacity
    if (totalGenerating !== selectedEventCapacity) {
        return alert(`BRD Rule Violation: You are trying to generate ${totalGenerating} seats, but the Event Capacity is strictly set to ${selectedEventCapacity}. Please adjust rows and columns to match.`);
    }

    if (!confirm(`Generate ${totalGenerating} seats for this event?`)) return;

  try {
        // 1. Find the selected event from the array we loaded earlier
        const selectedEvent = currentEvents.find(e => e.id == eventId);
        // 2. Grab its ticket price (fallback to 0 if it can't find one)
        const eventTicketPrice = selectedEvent ? (selectedEvent.ticketPrice || 0) : 0;

        // 3. Send it to C#
        await apiFetch(`/events/${eventId}/seats`, {
            method: 'POST',
            body: JSON.stringify({
                rows: rows,
                seatsPerRow: cols,
                basePrice: eventTicketPrice // <-- Now it uses the real price!
            })
        });
        
        alert("Seat map generated successfully!");
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
        
        // Note: Ensure your API route matches this (e.g., /api/events/{eventId}/seats/{seatId} OR /api/seats/{id})
        await apiFetch(`/events/${eventId}/seats/${seatId}`, { method: 'DELETE' });
        
        loadSeats(eventId); 
    } catch (error) {
        alert("Failed to delete seat. It may have already been booked. " + error.message);
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "login.html";
}