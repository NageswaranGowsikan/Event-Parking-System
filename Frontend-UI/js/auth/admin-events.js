document.addEventListener('DOMContentLoaded', () => {
    loadDropdowns();
    loadEvents();
});

async function loadDropdowns() {
    try {
        const venues = await apiFetch('/venues');
        const categories = await apiFetch('/categories');
        
        const venueSelect = document.getElementById('eVenue');
        venues.forEach(v => {
            venueSelect.innerHTML += `<option value="${v.id}">${v.name} (Max Cap: ${v.capacity})</option>`;
        });

        const catSelect = document.getElementById('eCategory');
        categories.forEach(c => {
            catSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    } catch (error) {
        console.error("Error loading dropdowns:", error);
    }
}

async function loadEvents() {
    const tbody = document.getElementById('eventTable');
    try {
        const events = await apiFetch('/events');
        tbody.innerHTML = events.length ? '' : '<tr><td colspan="5">No events found.</td></tr>';
        
        events.forEach(e => {
            // Adjust property names (e.title vs e.name) depending on what your backend returns
            const eventTitle = e.title || e.name; 
            const eventDateStr = new Date(e.eventDate || e.date).toLocaleString();

            tbody.innerHTML += `<tr>
                <td>${eventTitle}</td>
                <td>${eventDateStr}</td>
                <td>${e.capacity}</td>
                <td>$${(e.ticketPrice || 0).toFixed(2)}</td>
                <td><button class="btn-danger" onclick="deleteEvent(${e.id})">Delete</button></td>
            </tr>`;
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Error loading events.</td></tr>`;
    }
}

async function addEvent() {
    const title = document.getElementById('eTitle').value;
    const venueId = parseInt(document.getElementById('eVenue').value);
    const categoryId = parseInt(document.getElementById('eCategory').value);
    const eventDate = document.getElementById('eDate').value;
    const capacity = parseInt(document.getElementById('eCapacity').value);
    const ticketPrice = parseFloat(document.getElementById('eTicketPrice').value);
    const parkingFee = parseFloat(document.getElementById('eParkingFee').value);

    if (!title || !venueId || !categoryId || !eventDate || isNaN(capacity) || isNaN(ticketPrice) || isNaN(parkingFee)) {
        return alert("Please fill out all event fields!");
    }

    try {
        // IMPORTANT: If your C# CreateEventDto uses different property names (like 'Name' instead of 'Title'), update them here!
        const payload = {
            title: title,
            venueId: venueId,
            categoryId: categoryId,
            eventDate: eventDate, 
            capacity: capacity,
            ticketPrice: ticketPrice,
            parkingFee: parkingFee
        };

        await apiFetch('/events', { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        });

        alert("Event created successfully!");
        
        // Clear fields
        document.getElementById('eTitle').value = '';
        document.getElementById('eDate').value = '';
        document.getElementById('eCapacity').value = '';
        document.getElementById('eTicketPrice').value = '';
        document.getElementById('eParkingFee').value = '';
        
        loadEvents();
    } catch (error) {
        alert("Failed to create event: " + error.message);
    }
}

async function deleteEvent(id) {
    if (!confirm("Are you sure you want to delete this event? It cannot be deleted if bookings exist.")) return;
    try {
        await apiFetch(`/events/${id}`, { method: 'DELETE' });
        loadEvents();
    } catch (error) {
        alert(error.message);
    }
}