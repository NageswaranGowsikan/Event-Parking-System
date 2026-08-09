let currentEventId = null;
let currentBookingId = null;
let selectedSlot = null; // Object to store the single selected spot { id, label, fee }

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('eventId');
    currentBookingId = urlParams.get('bookingId');

    if (!currentEventId || !currentBookingId) {
        document.getElementById('parkingLayout').innerHTML = '<h3 style="color: red;">Invalid booking session.</h3>';
        return;
    }
    loadParkingSlots(currentEventId);
});

async function loadParkingSlots(eventId) {
    const container = document.getElementById('parkingLayout');
    
    try {
        const slots = await apiFetch(`/events/${eventId}/parking-slots`);
        container.innerHTML = ''; 

        if (slots.length === 0) {
            container.innerHTML = '<h3>No parking configured for this event.</h3>';
            return;
        }

        // Group slots by Zone for a nicer layout
        const zones = [...new Set(slots.map(s => s.zone))];

        zones.forEach(zone => {
            // Create Zone Header
            const zoneHeader = document.createElement('div');
            zoneHeader.className = 'zone-header';
            zoneHeader.innerText = `Zone ${zone}`;
            container.appendChild(zoneHeader);

            // Create Grid for this Zone
            const grid = document.createElement('div');
            grid.className = 'parking-grid';

            const zoneSlots = slots.filter(s => s.zone === zone);
            zoneSlots.forEach(slot => {
                const btn = document.createElement('button');
                const slotLabel = `${slot.zone}-${slot.slotNumber}`;
                
                // Construct button content with price
                btn.innerHTML = `${slotLabel}<br><span>$${slot.fee.toFixed(2)}</span>`;
                
                // Determine CSS class
                const isSelected = selectedSlot && selectedSlot.id === slot.id;
                btn.className = `slot ${slot.status === 'Reserved' ? 'Reserved' : (isSelected ? 'Selected' : 'Available')}`;
                
                if (slot.status === 'Available') {
                    btn.onclick = () => toggleSlot(slot, slotLabel);
                }
                
                grid.appendChild(btn);
            });
            
            container.appendChild(grid);
        });

    } catch (error) {
        container.innerHTML = `<div style="color: red;">Failed to load parking: ${error.message}</div>`;
    }
}

function toggleSlot(slot, label) {
    // BRD Rule: Allow at most one parking slot to be selected
    if (selectedSlot && selectedSlot.id === slot.id) {
        // Deselect if clicking the same one
        selectedSlot = null;
    } else {
        // Select the new one (replacing any previous selection)
        selectedSlot = { id: slot.id, label: label, fee: slot.fee };
    }
    
    updateCheckoutUI();
    loadParkingSlots(currentEventId); // Re-render to update colors
}

function updateCheckoutUI() {
    const labelSpan = document.getElementById('selectedSlotLabel');
    const feeSpan = document.getElementById('parkingFee');
    const confirmBtn = document.getElementById('confirmBtn');

    if (!selectedSlot) {
        labelSpan.innerText = "None";
        feeSpan.innerText = "0.00";
        confirmBtn.disabled = true;
    } else {
        labelSpan.innerText = selectedSlot.label;
        feeSpan.innerText = selectedSlot.fee.toFixed(2);
        confirmBtn.disabled = false;
    }
}

async function reserveParking() {
    if (!selectedSlot) return;

    try {
        await apiFetch(`/bookings/${currentBookingId}/parking`, {
            method: 'POST',
            body: JSON.stringify({ parkingSlotId: selectedSlot.id })
        });
        
        alert(`Success! Parking spot ${selectedSlot.label} has been added to your reservation.`);
        window.location.href = "events.html"; // Redirect back to main page
        
    } catch (error) {
        alert("Failed to reserve parking: " + error.message);
    }
}

function finishBooking() {
    // Parking is optional, so user can just skip this step
    alert("Booking complete! No parking was added.");
    window.location.href = "events.html";
}