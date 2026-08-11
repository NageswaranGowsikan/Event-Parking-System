document.addEventListener('DOMContentLoaded', () => {
    // Verify Admin Token
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    loadEvents();
});

async function loadEvents() {
    try {
        const events = await apiFetch('/events'); // Ensure you have a generic GET /api/events endpoint
        const select = document.getElementById('eventSelect');
        select.innerHTML = '<option value="">-- Choose an Event --</option>';
        
        events.forEach(e => {
            const date = new Date(e.eventDate).toLocaleDateString();
            select.innerHTML += `<option value="${e.id}">${e.title} (${date})</option>`;
        });
    } catch (error) {
        alert('Failed to load events: ' + error.message);
    }
}

async function loadParkingSlots() {
    const eventId = document.getElementById('eventSelect').value;
    const tbody = document.getElementById('parkingTableBody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';

    if (!eventId) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Select an event above.</td></tr>';
        return;
    }

    try {
        const slots = await apiFetch(`/events/${eventId}/parking-slots`);
        
        if (slots.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No parking configured for this event.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        slots.forEach(slot => {
            const isDeletable = slot.status === 'Available';
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${slot.zone}</strong></td>
                    <td>${slot.slotNumber}</td>
                    <td>$${slot.fee.toFixed(2)}</td>
                    <td>
                        <span style="color: ${isDeletable ? 'green' : 'red'}; font-weight: bold;">
                            ${slot.status}
                        </span>
                    </td>
                    <td>
                        ${isDeletable 
                            ? `<button class="btn-danger" onclick="deleteSlot(${slot.id})">Remove</button>` 
                            : '<em>Reserved</em>'}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Error: ${error.message}</td></tr>`;
    }
}

async function generateParkingSlots() {
    const eventId = document.getElementById('eventSelect').value;
    if (!eventId) return alert("You must select an event from the dropdown first.");

    const zone = document.getElementById('zoneInput').value.trim();
    const startSlot = parseInt(document.getElementById('startSlot').value);
    const endSlot = parseInt(document.getElementById('endSlot').value);
    const fee = parseFloat(document.getElementById('feeInput').value);

    if (!zone || isNaN(startSlot) || isNaN(endSlot) || isNaN(fee)) {
        return alert("Please fill in all generation fields completely.");
    }
    if (startSlot > endSlot) {
        return alert("Start Slot cannot be greater than End Slot.");
    }

    // Calculate total slots to generate based on start/end numbers
    const totalSlots = (endSlot - startSlot) + 1; 

    const confirmGeneration = confirm(`Are you sure you want to generate ${totalSlots} slots for Zone ${zone} at $${fee.toFixed(2)} each?`);
    if (!confirmGeneration) return;

    try {
        // Send the exact payload your GenerateParkingLayoutDto expects!
        await apiFetch(`/events/${eventId}/parking-slots`, {
            method: 'POST',
            body: JSON.stringify({
                numberOfSlots: totalSlots,
                zone: zone,
                defaultFee: fee
            })
        });
        
        alert(`Successfully created Zone ${zone} slots!`);
        
        // Clear the form
        document.getElementById('startSlot').value = '';
        document.getElementById('endSlot').value = '';
        
        // Refresh the data table
        loadParkingSlots();

    } catch (error) {
        alert("Generation stopped due to error: " + error.message);
    }
}
async function deleteSlot(slotId) {
    if (!confirm("Delete this parking slot? This action cannot be undone.")) return;

    try {
        await apiFetch(`/parking/${slotId}`, { method: 'DELETE' });
        loadParkingSlots(); // Refresh table
    } catch (error) {
        alert("Failed to delete slot. It may have already been reserved. " + error.message);
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "login.html";
}