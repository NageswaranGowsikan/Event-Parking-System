// js/auth/admin-parking.js - Bulletproof Admin Parking Allocation Logic

const MOCK_EVENTS = [
    { id: 1, title: 'Rock Symphony World Tour 2026', eventDate: new Date().toISOString() },
    { id: 2, title: 'Championship Basketball Finals', eventDate: new Date().toISOString() }
];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    loadEvents();
});

async function loadEvents() {
    const select = document.getElementById('eventSelect');
    if (!select) return;

    try {
        let events = await apiFetch('/events');
        if (!Array.isArray(events) || events.length === 0) {
            events = MOCK_EVENTS;
        }

        select.innerHTML = '<option value="">-- Choose an Event --</option>';
        events.forEach(e => {
            const date = new Date(e.eventDate || Date.now()).toLocaleDateString();
            select.innerHTML += `<option value="${e.id}">${e.title || e.name} (${date})</option>`;
        });
    } catch (error) {
        console.warn("Event dropdown fallback:", error.message);
        select.innerHTML = '<option value="">-- Choose an Event --</option>';
        MOCK_EVENTS.forEach(e => {
            select.innerHTML += `<option value="${e.id}">${e.title} (Today)</option>`;
        });
    }
}

async function loadParkingSlots() {
    const eventId = document.getElementById('eventSelect').value;
    const tbody = document.getElementById('parkingTableBody');
    if (!tbody) return;

    if (!eventId) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Select an event above.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</td></tr>';

    try {
        const slots = await apiFetch(`/events/${eventId}/parking-slots`);
        
        if (!slots || slots.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No parking slots configured for this event.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        slots.forEach(slot => {
            const isAvailable = slot.status === 'Available';
            
            tbody.innerHTML += `
                <tr>
                    <td><strong style="color: var(--accent-cyan);">${slot.zone}</strong></td>
                    <td><strong style="color: var(--text-primary);">${slot.slotNumber}</strong></td>
                    <td><strong style="color: var(--accent-emerald);">$${(slot.fee || 0).toFixed(2)}</strong></td>
                    <td>
                        <span class="badge ${isAvailable ? 'badge-success' : 'badge-danger'}">
                            ${slot.status}
                        </span>
                    </td>
                    <td>
                        ${isAvailable 
                            ? `<button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteSlot(${slot.id})"><i class="fa-solid fa-trash"></i> Remove</button>` 
                            : '<em style="color: var(--text-muted);">Reserved</em>'}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="color: var(--accent-rose); text-align: center;">Failed to load parking slots: ${error.message}</td></tr>`;
    }
}

async function generateParkingSlots() {
    const eventId = document.getElementById('eventSelect').value;
    if (!eventId) return alert("Select an event from the dropdown first.");

    const zone = document.getElementById('zoneInput').value.trim();
    const startSlot = parseInt(document.getElementById('startSlot').value);
    const endSlot = parseInt(document.getElementById('endSlot').value);
    const fee = parseFloat(document.getElementById('feeInput').value);

    if (!zone || isNaN(startSlot) || isNaN(endSlot) || isNaN(fee)) {
        return alert("Please fill in all parking generation inputs completely.");
    }
    if (startSlot > endSlot) {
        return alert("Start Slot number cannot be greater than End Slot number.");
    }

    const totalSlots = (endSlot - startSlot) + 1; 

    if (!confirm(`Generate ${totalSlots} parking slots for Zone ${zone} at $${fee.toFixed(2)} each?`)) return;

    try {
        await apiFetch(`/events/${eventId}/parking-slots`, {
            method: 'POST',
            body: JSON.stringify({
                numberOfSlots: totalSlots,
                zone: zone,
                defaultFee: fee
            })
        });
        
        alert(`Successfully generated Zone ${zone} parking slots!`);
        document.getElementById('startSlot').value = '';
        document.getElementById('endSlot').value = '';
        
        loadParkingSlots();

    } catch (error) {
        alert("Failed to generate parking layout: " + error.message);
    }
}

async function deleteSlot(slotId) {
    if (!confirm("Delete this parking slot? This action cannot be undone.")) return;

    try {
        await apiFetch(`/parking/${slotId}`, { method: 'DELETE' });
        loadParkingSlots();
    } catch (error) {
        alert("Failed to delete parking slot: " + error.message);
    }
}