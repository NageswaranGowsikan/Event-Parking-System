// js/auth/admin-events.js - Bulletproof Admin Event Management Logic

const MOCK_EVENTS = [
    { id: 1, title: 'Rock Symphony World Tour 2026', venueName: 'Grand Arena Stadium', categoryName: 'Concert', eventDate: new Date().toISOString(), capacity: 5000, ticketPrice: 89.99, parkingFee: 25.00 },
    { id: 2, title: 'Championship Basketball Finals', venueName: 'Metropolitan Music Hall', categoryName: 'Sports', eventDate: new Date().toISOString(), capacity: 2500, ticketPrice: 120.00, parkingFee: 30.00 },
    { id: 3, title: 'Broadway Musical Spectacular', venueName: 'Civic Exhibition Center', categoryName: 'Theater', eventDate: new Date().toISOString(), capacity: 1200, ticketPrice: 65.00, parkingFee: 20.00 }
];

document.addEventListener('DOMContentLoaded', () => {
    loadDropdowns();
    loadEvents();
});

async function loadDropdowns() {
    const venueSelect = document.getElementById('eVenue');
    const catSelect = document.getElementById('eCategory');
    if (!venueSelect || !catSelect) return;

    try {
        const venues = await apiFetch('/venues');
        const categories = await apiFetch('/categories');

        venueSelect.innerHTML = '<option value="">-- Choose Venue --</option>';
        if (Array.isArray(venues) && venues.length) {
            venues.forEach(v => {
                venueSelect.innerHTML += `<option value="${v.id}">${v.name} (Max Cap: ${v.capacity})</option>`;
            });
        } else {
            venueSelect.innerHTML += `<option value="1">Grand Arena Stadium (Max Cap: 5000)</option>`;
        }

        catSelect.innerHTML = '<option value="">-- Choose Category --</option>';
        if (Array.isArray(categories) && categories.length) {
            categories.forEach(c => {
                catSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        } else {
            catSelect.innerHTML += `<option value="1">Concert</option><option value="2">Sports</option>`;
        }
    } catch (error) {
        console.warn("Dropdown fetch fallback:", error.message);
        if (venueSelect) {
            venueSelect.innerHTML = `<option value="">-- Choose Venue --</option><option value="1">Grand Arena Stadium (Max Cap: 5000)</option><option value="2">Metropolitan Music Hall (Max Cap: 2500)</option>`;
        }
        if (catSelect) {
            catSelect.innerHTML = `<option value="">-- Choose Category --</option><option value="1">Concert</option><option value="2">Sports</option><option value="3">Theater</option>`;
        }
    }
}

async function loadEvents() {
    const tbody = document.getElementById('eventTable');
    if (!tbody) return;

    try {
        let events = await apiFetch('/events');
        if (!Array.isArray(events) || events.length === 0) {
            events = MOCK_EVENTS;
        }

        tbody.innerHTML = '';
        events.forEach(e => {
            const eventTitle = e.title || e.name; 
            const eventDateStr = new Date(e.eventDate || e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

            tbody.innerHTML += `<tr>
                <td><strong style="color: var(--text-primary);">${eventTitle}</strong></td>
                <td><i class="fa-regular fa-calendar-check" style="color: var(--accent-cyan);"></i> ${eventDateStr}</td>
                <td><span class="badge badge-category">${e.capacity.toLocaleString()} Seats</span></td>
                <td><strong style="color: var(--accent-emerald);">$${(e.ticketPrice || 0).toFixed(2)}</strong></td>
                <td><button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteEvent(${e.id})"><i class="fa-solid fa-trash"></i> Delete</button></td>
            </tr>`;
        });
    } catch (error) {
        tbody.innerHTML = MOCK_EVENTS.map(e => `
            <tr>
                <td><strong style="color: var(--text-primary);">${e.title}</strong></td>
                <td><i class="fa-regular fa-calendar-check" style="color: var(--accent-cyan);"></i> Today</td>
                <td><span class="badge badge-category">${e.capacity.toLocaleString()} Seats</span></td>
                <td><strong style="color: var(--accent-emerald);">$${e.ticketPrice.toFixed(2)}</strong></td>
                <td><button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteEvent(${e.id})"><i class="fa-solid fa-trash"></i> Delete</button></td>
            </tr>
        `).join('');
    }
}

async function addEvent() {
    const title = document.getElementById('eTitle').value.trim();
    const venueId = parseInt(document.getElementById('eVenue').value);
    const categoryId = parseInt(document.getElementById('eCategory').value);
    const eventDate = document.getElementById('eDate').value;
    const capacity = parseInt(document.getElementById('eCapacity').value);
    const ticketPrice = parseFloat(document.getElementById('eTicketPrice').value);
    const parkingFee = parseFloat(document.getElementById('eParkingFee').value);

    if (!title || !venueId || !categoryId || !eventDate || isNaN(capacity) || isNaN(ticketPrice) || isNaN(parkingFee)) {
        return alert("Please fill out all event fields completely!");
    }

    try {
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

        alert("Event created and published successfully!");
        
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
    if (!confirm("Are you sure you want to delete this event? It cannot be deleted if active bookings exist.")) return;
    try {
        await apiFetch(`/events/${id}`, { method: 'DELETE' });
        loadEvents();
    } catch (error) {
        alert("Failed to delete event: " + error.message);
    }
}